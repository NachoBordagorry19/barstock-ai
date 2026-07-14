import { prisma } from '../prisma';
import { Purchase } from '../domain/Purchase';

export class PrismaPurchaseRepository {
  async save(purchase) {
    if (!(purchase instanceof Purchase)) {
      throw new Error('Debe ser instancia de Purchase');
    }

    const purchaseId = purchase.id || `purch-${Date.now()}`;

    // Ejecutar en una transacción para guardar la compra y sus ítems relacionales
    const data = await prisma.$transaction(async (tx) => {
      // Eliminar ítems existentes si se está actualizando la compra
      await tx.purchaseItem.deleteMany({
        where: { purchaseId },
      });

      // Crear o actualizar la compra
      const dbPurchase = await tx.purchase.upsert({
        where: { id: purchaseId },
        update: {
          wholesaler: purchase.wholesaler,
          invoiceNumber: purchase.invoiceNumber,
          paymentType: purchase.paymentType,
          paymentStatus: purchase.paymentStatus,
          createdAt: purchase.createdAt,
        },
        create: {
          id: purchaseId,
          wholesaler: purchase.wholesaler,
          invoiceNumber: purchase.invoiceNumber,
          paymentType: purchase.paymentType,
          paymentStatus: purchase.paymentStatus,
          createdAt: purchase.createdAt,
        },
      });

      // Crear los ítems asociados
      if (purchase.items && purchase.items.length > 0) {
        await tx.purchaseItem.createMany({
          data: purchase.items.map((item) => ({
            purchaseId,
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
          })),
        });
      }

      // Recuperar la compra completa con sus ítems
      return tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { items: true },
      });
    });

    return new Purchase({
      id: data.id,
      wholesaler: data.wholesaler,
      invoiceNumber: data.invoiceNumber,
      paymentType: data.paymentType,
      paymentStatus: data.paymentStatus,
      createdAt: data.createdAt,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
      })),
    });
  }

  async findAll() {
    const list = await prisma.purchase.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map(
      (data) =>
        new Purchase({
          id: data.id,
          wholesaler: data.wholesaler,
          invoiceNumber: data.invoiceNumber,
          paymentType: data.paymentType,
          paymentStatus: data.paymentStatus,
          createdAt: data.createdAt,
          items: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
          })),
        })
    );
  }
}
