export class StockService {
  constructor(productRepository, purchaseRepository, movementRepository, stockRepository, transferRepository) {
    this.productRepository = productRepository;
    this.purchaseRepository = purchaseRepository;
    this.movementRepository = movementRepository;
    this.stockRepository = stockRepository;
    this.transferRepository = transferRepository;
  }

  /**
   * Registra una nueva compra a un proveedor (mayorista como Pasifox),
   * incrementa el stock de los productos e historial de movimientos.
   *
   * @param {Object} purchaseData
   * @returns {Object} La compra guardada
   */
  registerPurchase(purchaseData) {
    const { wholesaler, invoiceNumber, paymentType, paymentStatus, items } = purchaseData;

    // Guardar la factura/compra
    const savedPurchase = this.purchaseRepository.save({
      wholesaler,
      invoiceNumber,
      paymentType,
      paymentStatus,
      items,
      createdAt: new Date(),
    });

    // Procesar cada ítem comprado
    for (const item of items) {
      const product = this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      // Incrementar el stock del producto (TDD: Coca 10 -> 30, Fernet 5 -> 15)
      product.stock = (product.stock || 0) + item.quantity;
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

    return savedPurchase;
  }

  /**
   * Registra el envío de mercadería entre dos ubicaciones (por un despachador).
   * Resta la cantidad del stock de origen, pero no la suma al destino.
   *
   * @param {Object} transferData
   * @returns {Object} La transferencia creada en estado PENDING
   */
  dispatchTransfer(transferData) {
    const { items, originLocation, destinationLocation, senderUserId } = transferData;

    // Crear la transferencia con estado PENDING
    const transfer = this.transferRepository.save({
      items,
      originLocation,
      destinationLocation,
      senderUserId,
      receiverUserId: null,
      status: 'PENDING',
      createdAt: new Date(),
    });

    // Restar el stock en la ubicación de origen
    for (const item of items) {
      const stock = this.stockRepository.getByProductAndLocation(item.productId, originLocation);
      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Stock insuficiente en ${originLocation} para el producto ${item.productId}`);
      }
      stock.quantity -= item.quantity;
      this.stockRepository.save(stock);
    }

    return transfer;
  }

  /**
   * Confirma una transferencia pendiente por parte de un receptor.
   * Suma la cantidad al stock de destino y registra el movimiento.
   *
   * @param {string} transferId
   * @param {string} receiverUserId
   * @returns {Object} La transferencia actualizada en estado CONFIRMED
   */
  confirmTransfer(transferId, receiverUserId) {
    const transfer = this.transferRepository.findById(transferId);
    if (!transfer) {
      throw new Error(`Transferencia no encontrada: ${transferId}`);
    }

    if (transfer.status !== 'PENDING') {
      throw new Error(`La transferencia ya se encuentra en estado: ${transfer.status}`);
    }

    // Actualizar el estado de la transferencia
    transfer.status = 'CONFIRMED';
    transfer.receiverUserId = receiverUserId;
    transfer.confirmedAt = new Date();
    this.transferRepository.save(transfer);

    // Sumar el stock en la ubicación de destino
    for (const item of transfer.items) {
      const stock = this.stockRepository.getByProductAndLocation(item.productId, transfer.destinationLocation);
      stock.quantity = (stock.quantity || 0) + item.quantity;
      this.stockRepository.save(stock);

      // Registrar movimiento de stock
      this.movementRepository.save({
        productId: item.productId,
        quantity: item.quantity,
        type: 'TRASLADAR',
        origin: transfer.originLocation,
        destination: transfer.destinationLocation,
        createdAt: new Date(),
      });
    }

    return transfer;
  }
}
