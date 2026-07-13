export class Purchase {
  constructor({ id, wholesaler, invoiceNumber, paymentType, paymentStatus, items, createdAt }) {
    this.id = id;
    this.wholesaler = wholesaler;
    this.invoiceNumber = invoiceNumber;
    this.paymentType = paymentType; // 'contado' | 'crédito'
    this.paymentStatus = paymentStatus; // 'pendiente' | 'pagado'
    this.items = items; // [{ productId, quantity, purchasePrice }]
    this.createdAt = createdAt || new Date();
  }

  markAsPaid() {
    this.paymentStatus = "pagado";
  }
}
