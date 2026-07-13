export class Transfer {
  constructor({ id, items, originLocation, destinationLocation, senderUserId, receiverUserId, status, createdAt, confirmedAt }) {
    this.id = id;
    this.items = items; // [{ productId, quantity }]
    this.originLocation = originLocation;
    this.destinationLocation = destinationLocation;
    this.senderUserId = senderUserId;
    this.receiverUserId = receiverUserId || null;
    this.status = status || "PENDING"; // 'PENDING' | 'CONFIRMED'
    this.createdAt = createdAt || new Date();
    this.confirmedAt = confirmedAt || null;
  }

  confirm(receiverUserId) {
    if (this.status !== "PENDING") {
      throw new Error("La transferencia no está pendiente");
    }
    this.status = "CONFIRMED";
    this.receiverUserId = receiverUserId;
    this.confirmedAt = new Date();
  }
}
