export class StockService {
  constructor(productRepository, purchaseRepository, movementRepository) {
    this.productRepository = productRepository;
    this.purchaseRepository = purchaseRepository;
    this.movementRepository = movementRepository;
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
}
