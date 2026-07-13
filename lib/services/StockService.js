import { Purchase } from "../domain/Purchase";
import { Transfer } from "../domain/Transfer";
import { PurchaseDTO, TransferDTO } from "../dtos/StockDTOs";
import { Validator } from "../validation/Validator";

export class StockService {
  constructor(productRepository, purchaseRepository, movementRepository, stockRepository, transferRepository, userRepository) {
    this.productRepository = productRepository;
    this.purchaseRepository = purchaseRepository;
    this.movementRepository = movementRepository;
    this.stockRepository = stockRepository;
    this.transferRepository = transferRepository;
    this.userRepository = userRepository;

    // Inicializar validadores con Fluent API (SOLID & Seguros)
    this._initValidators();
  }

  _initValidators() {
    this.purchaseValidator = new Validator();
    this.purchaseValidator.ruleFor('wholesaler').required().string().minLength(2);
    this.purchaseValidator.ruleFor('invoiceNumber').required().string();
    this.purchaseValidator.ruleFor('paymentType').required().string();
    this.purchaseValidator.ruleFor('items').required().custom((items, field) => {
      if (!Array.isArray(items) || items.length === 0) {
        return "Debe ingresar al menos un ítem.";
      }
      for (const item of items) {
        if (!item.productId) return "Cada ítem debe tener un productId.";
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          return "Cada ítem debe tener una cantidad mayor a cero.";
        }
        if (typeof item.purchasePrice !== 'number' || item.purchasePrice < 0) {
          return "Cada ítem debe tener un precio de costo válido.";
        }
      }
      return null;
    });

    this.transferValidator = new Validator();
    this.transferValidator.ruleFor('originLocation').required().string();
    this.transferValidator.ruleFor('destinationLocation').required().string();
    this.transferValidator.ruleFor('senderUserId').required().string();
    this.transferValidator.ruleFor('items').required().custom((items, field) => {
      if (!Array.isArray(items) || items.length === 0) {
        return "Debe trasladar al menos un ítem.";
      }
      for (const item of items) {
        if (!item.productId) return "Cada ítem debe tener un productId.";
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
          return "Cada ítem debe tener una cantidad mayor a cero.";
        }
      }
      return null;
    });
  }

  /**
   * Registra una nueva compra a un proveedor (mayorista como Pasifox).
   * Valida la entrada usando Fluent API,
   * convierte el DTO de entrada en entidad Purchase (Dominio),
   * incrementa el stock de los productos usando lógica de dominio,
   * y retorna un PurchaseDTO a la UI.
   *
   * @param {Object} purchaseData
   * @returns {PurchaseDTO} La compra mapeada a DTO
   */
  registerPurchase(purchaseData) {
    // Validar input
    const validation = this.purchaseValidator.validate(purchaseData);
    if (!validation.isValid) {
      throw new Error(`Validación fallida: ${JSON.stringify(validation.errors)}`);
    }

    const { wholesaler, invoiceNumber, paymentType, paymentStatus, items } = purchaseData;

    // Crear la Entidad de Dominio Purchase
    const purchaseEntity = new Purchase({
      wholesaler,
      invoiceNumber,
      paymentType,
      paymentStatus: paymentStatus || 'pendiente',
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
   * Valida la entrada con Fluent API,
   * controla que el despachador tenga los permisos del rol,
   * crea una Entidad de Dominio Transfer en estado PENDING y retorna TransferDTO.
   *
   * @param {Object} transferData
   * @returns {TransferDTO} La transferencia creada como DTO
   */
  dispatchTransfer(transferData) {
    // Validar input
    const validation = this.transferValidator.validate(transferData);
    if (!validation.isValid) {
      throw new Error(`Validación fallida: ${JSON.stringify(validation.errors)}`);
    }

    const { items, originLocation, destinationLocation, senderUserId } = transferData;

    // Control de Perfiles de Usuario (Seguridad)
    if (this.userRepository) {
      const sender = this.userRepository.findById(senderUserId);
      if (!sender) {
        throw new Error(`Usuario no encontrado: ${senderUserId}`);
      }
      if (!sender.isDespachador()) {
        throw new Error("Permiso denegado: El usuario no tiene rol de despachador");
      }
    }

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
   * Controla que el receptor tenga los permisos del rol,
   * modifica el estado mediante métodos de negocio de la Entidad de Dominio Transfer,
   * actualiza los stocks y retorna el TransferDTO a la UI.
   *
   * @param {string} transferId
   * @param {string} receiverUserId
   * @returns {TransferDTO} La transferencia confirmada mapeada a DTO
   */
  confirmTransfer(transferId, receiverUserId) {
    // Control de Perfiles de Usuario (Seguridad)
    if (this.userRepository) {
      const receiver = this.userRepository.findById(receiverUserId);
      if (!receiver) {
        throw new Error(`Usuario no encontrado: ${receiverUserId}`);
      }
      if (!receiver.isReceptor()) {
        throw new Error("Permiso denegado: El usuario no tiene rol de receptor");
      }
    }

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
