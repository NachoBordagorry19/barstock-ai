import { prisma } from '../prisma';
import { Product } from '../domain/Product';

export class PrismaProductRepository {
  async findById(id) {
    const data = await prisma.product.findUnique({ where: { id } });
    if (!data) return null;
    return new Product({
      id: data.id,
      name: data.name,
      category: data.category,
      barcode: data.barcode,
      stock: data.stock,
      cost: data.cost,
      marginPercent: data.marginPercent,
      price: data.price,
    });
  }

  async save(product) {
    if (!(product instanceof Product)) {
      throw new Error('Debe ser instancia de Product');
    }

    const data = await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        category: product.category,
        barcode: product.barcode,
        stock: product.stock,
        cost: product.cost,
        marginPercent: product.marginPercent,
        price: product.price,
      },
      create: {
        id: product.id,
        name: product.name,
        category: product.category,
        barcode: product.barcode,
        stock: product.stock,
        cost: product.cost,
        marginPercent: product.marginPercent,
        price: product.price,
      },
    });

    return new Product({
      id: data.id,
      name: data.name,
      category: data.category,
      barcode: data.barcode,
      stock: data.stock,
      cost: data.cost,
      marginPercent: data.marginPercent,
      price: data.price,
    });
  }
}
