export class PurchaseDTO {
  constructor({ id, wholesaler, invoiceNumber, paymentType, paymentStatus, items, createdAt }) {
    this.id = id;
    this.wholesaler = wholesaler;
    this.invoiceNumber = invoiceNumber;
    this.paymentType = paymentType;
    this.paymentStatus = paymentStatus;
    this.items = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.purchasePrice,
    }));
    this.createdAt = createdAt;
  }
}

export class TransferDTO {
  constructor({ id, items, originLocation, destinationLocation, senderUserId, receiverUserId, status, createdAt, confirmedAt }) {
    this.id = id;
    this.items = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    this.originLocation = originLocation;
    this.destinationLocation = destinationLocation;
    this.senderUserId = senderUserId;
    this.receiverUserId = receiverUserId;
    this.status = status;
    this.createdAt = createdAt;
    this.confirmedAt = confirmedAt;
  }
}

export class UserDTO {
  constructor({ id, name, role, active }) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.active = active;
  }
}

export class StockItemDTO {
  constructor({ productId, location, quantity, expirationDate, isExpired, isNearExpiration }) {
    this.productId = productId;
    this.location = location;
    this.quantity = quantity;
    this.expirationDate = expirationDate ? new Date(expirationDate).toISOString().split('T')[0] : null;
    this.isExpired = isExpired;
    this.isNearExpiration = isNearExpiration;
  }
}
