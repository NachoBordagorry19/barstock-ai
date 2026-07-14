import { prisma } from '../prisma';
import { User } from '../domain/User';

export class PrismaUserRepository {
  async findById(id) {
    const data = await prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return new User({
      id: data.id,
      name: data.name,
      role: data.role,
      active: data.active,
    });
  }
}
