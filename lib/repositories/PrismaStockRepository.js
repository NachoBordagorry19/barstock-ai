import { prisma } from '../prisma';
import { StockItem } from '../domain/StockItem';

export class PrismaStockRepository {
  async getByProductAndLocation(productId, location) {
    const data = await prisma.stockItem.findUnique({
      where: {
        productId_location: {
          productId,
          location,
        },
      },
    });

    if (!data) {
      return new StockItem({ productId, location, quantity: 0 });
    }

    return new StockItem({
      productId: data.productId,
      location: data.location,
      quantity: data.quantity,
      expirationDate: data.expirationDate,
    });
  }

  async save(stockItem) {
    if (!(stockItem instanceof StockItem)) {
      throw new Error('Debe ser instancia de StockItem');
    }

    const data = await prisma.stockItem.upsert({
      where: {
        productId_location: {
          productId: stockItem.productId,
          location: stockItem.location,
        },
      },
      update: {
        quantity: stockItem.quantity,
        expirationDate: stockItem.expirationDate,
      },
      create: {
        productId: stockItem.productId,
        location: stockItem.location,
        quantity: stockItem.quantity,
        expirationDate: stockItem.expirationDate,
      },
    });

    return new StockItem({
      productId: data.productId,
      location: data.location,
      quantity: data.quantity,
      expirationDate: data.expirationDate,
    });
  }

  async findAll() {
    const list = await prisma.stockItem.findMany();
    return list.map(
      (item) =>
        new StockItem({
          productId: item.productId,
          location: item.location,
          quantity: item.quantity,
          expirationDate: item.expirationDate,
        })
    );
  }
}
