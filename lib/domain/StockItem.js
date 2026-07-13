export class StockItem {
  constructor({ productId, location, quantity, expirationDate = null }) {
    this.productId = productId;
    this.location = location;
    this.quantity = quantity;
    this.expirationDate = expirationDate ? new Date(expirationDate) : null;
  }

  isExpired(currentDate = new Date()) {
    if (!this.expirationDate) return false;
    // Poner ambas fechas a las 00:00:00 para comparar solo el día
    const exp = new Date(this.expirationDate).setHours(0, 0, 0, 0);
    const curr = new Date(currentDate).setHours(0, 0, 0, 0);
    return exp < curr;
  }

  isNearExpiration(currentDate = new Date(), daysThreshold = 30) {
    if (!this.expirationDate) return false;
    if (this.isExpired(currentDate)) return false;

    const exp = new Date(this.expirationDate).setHours(0, 0, 0, 0);
    const curr = new Date(currentDate).setHours(0, 0, 0, 0);
    
    const diffTime = exp - curr;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= daysThreshold;
  }
}
