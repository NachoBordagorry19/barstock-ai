import { StockService } from './StockService';
import { PrismaProductRepository } from '../repositories/PrismaProductRepository';
import { PrismaStockRepository } from '../repositories/PrismaStockRepository';
import { PrismaPurchaseRepository } from '../repositories/PrismaPurchaseRepository';
import { PrismaTransferRepository } from '../repositories/PrismaTransferRepository';
import { PrismaUserRepository } from '../repositories/PrismaUserRepository';
import { PrismaMovementRepository } from '../repositories/PrismaMovementRepository';

const productRepo = new PrismaProductRepository();
const purchaseRepo = new PrismaPurchaseRepository();
const stockRepo = new PrismaStockRepository();
const transferRepo = new PrismaTransferRepository();
const userRepo = new PrismaUserRepository();
const movementRepo = new PrismaMovementRepository();

export const serverStockService = new StockService(
  productRepo,
  purchaseRepo,
  movementRepo,
  stockRepo,
  transferRepo,
  userRepo
);
