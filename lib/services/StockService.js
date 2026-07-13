import { Purchase } from "../domain/Purchase";
import { Transfer } from "../domain/Transfer";
import { PurchaseDTO, TransferDTO } from "../dtos/StockDTOs";

export class StockService {
  constructor(productRepository, purchaseRepository, movementRepository, stockRepository, transferRepository) {
    this.productRepository = productRepository;
    this.purchaseRepository = purchaseRepository;
    this.movementRepository = movementRepository;
    this.stockRepository = stockRepository;
    this.transferRepository = transferRepository;
  }

  /**
   * Registra una nueva compra a un proveedor (mayorista como Pasifox).
   * Convierte el DTO de entrada en entidad Purchase (Dominio),
   * incrementa el stock de los productos usando lógica de dominio,
   * y retorna un PurchaseDTO a la UI.
   *
   * @param {Object} purchaseData
   * @returns {PurchaseDTO} La compra mapeada a DTO
   */
  registerPurchase(purchaseData) {
    const { wholesaler, invoiceNumber, paymentType, paymentStatus, items } = purchaseData;

    // Crear la Entidad de Dominio Purchase
    const purchaseEntity = new Purchase({
      wholesaler,
      invoiceNumber,
      paymentType,
      paymentStatus,
      items,
      createdAt: new Date(),
    });

    // Guardar la Entidad de Dominio en el repositorio de Compras
    const savedPurchase = this.purchaseRepository.save(purchaseEntity);

    // Procesar cada ítem comprado actualizando el stock a nivel de Dominio (Product)
    for (const item of items) {
      const product = this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      // Usar método de negocio del dominio Product
      product.addStock(item.quantity);
      this.productRepository.save(product);

      // Registrar movimiento de stock
      this.movementRepository.save({
        productId: item.productId,
        quantity: item.quantity,
        type: 'INGRESAR',
        origin: wholesaler,
        createdAt: new Date(),
      });
    }

    // Retornar el DTO a la UI
    return new PurchaseDTO(savedPurchase);
  }

  /**
   * Registra el envío de mercadería entre dos ubicaciones (por un despachador).
   * Crea una Entidad de Dominio Transfer en estado PENDING y retorna TransferDTO.
   *
   * @param {Object} transferData
   * @returns {TransferDTO} La transferencia creada como DTO
   */
  dispatchTransfer(transferData) {
    const { items, originLocation, destinationLocation, senderUserId } = transferData;

    // Crear la Entidad de Dominio Transfer
    const transferEntity = new Transfer({
      items,
      originLocation,
      destinationLocation,
      senderUserId,
      receiverUserId: null,
      status: 'PENDING',
      createdAt: new Date(),
    });

    // Guardar la Entidad de Dominio en el repositorio
    const savedTransfer = this.transferRepository.save(transferEntity);

    // Restar el stock en la ubicación de origen
    for (const item of items) {
      const stock = this.stockRepository.getByProductAndLocation(item.productId, originLocation);
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Stock insuficiente en ${originLocation} para el producto ${item.productId}`);
      }
      stock.quantity -= item.quantity;
      this.stockRepository.save(stock);
    }

    // Retornar DTO a la UI
    return new TransferDTO(savedTransfer);
  }

  /**
   * Confirma una transferencia pendiente por parte de un receptor.
   * Modifica el estado mediante métodos de negocio de la Entidad de Dominio Transfer,
   * actualiza los stocks y retorna el TransferDTO a la UI.
   *
   * @param {string} transferId
   * @param {string} receiverUserId
   * @returns {TransferDTO} La transferencia confirmada mapeada a DTO
   */
  confirmTransfer(transferId, receiverUserId) {
    const transferEntity = this.transferRepository.findById(transferId);
    if (!transferEntity) {
      throw new Error(`Transferencia no encontrada: ${transferId}`);
    }

    // Usar la lógica de negocio de la Entidad de Dominio para confirmarla
    transferEntity.confirm(receiverUserId);

    // Guardar la Entidad de Dominio actualizada en el repositorio
    const savedTransfer = this.transferRepository.save(transferEntity);

    // Sumar el stock en la ubicación de destino
    for (const item of savedTransfer.items) {
      const stock = this.stockRepository.getByProductAndLocation(item.productId, savedTransfer.destinationLocation);
      stock.quantity = (stock.quantity || 0) + item.quantity;
      this.stockRepository.save(stock);

      // Registrar movimiento de stock
      this.movementRepository.save({
        productId: item.productId,
        quantity: item.quantity,
        type: 'TRASLADAR',
        origin: savedTransfer.originLocation,
        destination: savedTransfer.destinationLocation,
        createdAt: new Date(),
      });
    }

    // Retornar DTO a la UI
    return new TransferDTO(savedTransfer);
  }
}
