export class Product {
  constructor({ id, name, category, barcode, stock = 0, price = 0 }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.barcode = barcode;
    this.stock = stock;
    this.price = price;
  }

  addStock(qty) {
    if (qty < 0) throw new Error("La cantidad debe ser positiva");
    this.stock += qty;
  }
}
