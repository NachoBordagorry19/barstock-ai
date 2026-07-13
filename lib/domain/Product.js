export class Product {
  constructor({ id, name, category, barcode, stock = 0, price = 0, cost = 0, marginPercent = 20 }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.barcode = barcode;
    this.stock = stock;
    this.cost = cost;
    this.marginPercent = marginPercent;
    this.price = price || Math.round(cost * (1 + marginPercent / 100));
  }

  addStock(qty) {
    if (qty < 0) throw new Error("La cantidad debe ser positiva");
    this.stock += qty;
  }

  /**
   * Actualiza el costo de compra del producto y recalcula automáticamente
   * el precio de venta en base al margen de ganancia configurado (SOLID Domain Rule).
   *
   * @param {number} newCost Nuevo costo unitario de compra
   */
  updateCost(newCost) {
    if (newCost < 0) throw new Error("El costo no puede ser negativo");
    this.cost = newCost;
    this.price = Math.round(newCost * (1 + this.marginPercent / 100));
  }
}
