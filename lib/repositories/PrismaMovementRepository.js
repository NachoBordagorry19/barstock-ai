import { prisma } from '../prisma';

export class PrismaMovementRepository {
  async save(movement) {
    const data = await prisma.movement.create({
      data: {
        productId: movement.productId,
        quantity: movement.quantity,
        type: movement.type,
        origin: movement.origin || null,
        destination: movement.destination || null,
        createdAt: movement.createdAt || new Date(),
      },
    });
    return {
      id: data.id,
      productId: data.productId,
      quantity: data.quantity,
      type: data.type,
      origin: data.origin,
      destination: data.destination,
      createdAt: data.createdAt,
    };
  }
}
