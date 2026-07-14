import { prisma } from '../prisma';
import { Transfer } from '../domain/Transfer';

export class PrismaTransferRepository {
  async findById(id) {
    const data = await prisma.transfer.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!data) return null;
    return new Transfer({
      id: data.id,
      originLocation: data.originLocation,
      destinationLocation: data.destinationLocation,
      senderUserId: data.senderUserId,
      receiverUserId: data.receiverUserId,
      status: data.status,
      createdAt: data.createdAt,
      confirmedAt: data.confirmedAt,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }

  async save(transfer) {
    if (!(transfer instanceof Transfer)) {
      throw new Error('Debe ser instancia de Transfer');
    }

    const transferId = transfer.id || `trans-${Date.now()}`;

    const data = await prisma.$transaction(async (tx) => {
      // Eliminar ítems existentes de transferencia si es actualización
      await tx.transferItem.deleteMany({
        where: { transferId },
      });

      // Crear o actualizar la transferencia
      const dbTransfer = await tx.transfer.upsert({
        where: { id: transferId },
        update: {
          originLocation: transfer.originLocation,
          destinationLocation: transfer.destinationLocation,
          senderUserId: transfer.senderUserId,
          receiverUserId: transfer.receiverUserId,
          status: transfer.status,
          createdAt: transfer.createdAt,
          confirmedAt: transfer.confirmedAt,
        },
        create: {
          id: transferId,
          originLocation: transfer.originLocation,
          destinationLocation: transfer.destinationLocation,
          senderUserId: transfer.senderUserId,
          receiverUserId: transfer.receiverUserId,
          status: transfer.status,
          createdAt: transfer.createdAt,
          confirmedAt: transfer.confirmedAt,
        },
      });

      // Crear ítems asociados
      if (transfer.items && transfer.items.length > 0) {
        await tx.transferItem.createMany({
          data: transfer.items.map((item) => ({
            transferId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        });
      }

      // Recuperar completa
      return tx.transfer.findUnique({
        where: { id: transferId },
        include: { items: true },
      });
    });

    return new Transfer({
      id: data.id,
      originLocation: data.originLocation,
      destinationLocation: data.destinationLocation,
      senderUserId: data.senderUserId,
      receiverUserId: data.receiverUserId,
      status: data.status,
      createdAt: data.createdAt,
      confirmedAt: data.confirmedAt,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }
}
