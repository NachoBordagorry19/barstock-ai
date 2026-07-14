import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prisma;
let pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.globalPrisma) {
    global.globalPool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(global.globalPool);
    global.globalPrisma = new PrismaClient({ adapter });
  }
  prisma = global.globalPrisma;
  pool = global.globalPool;
}

export { prisma, pool };
