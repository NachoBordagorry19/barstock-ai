/**
 * @jest-environment node
 */
import { PrismaProductRepository } from '../lib/repositories/PrismaProductRepository';
import { PrismaStockRepository } from '../lib/repositories/PrismaStockRepository';
import { PrismaUserRepository } from '../lib/repositories/PrismaUserRepository';
import { PrismaMovementRepository } from '../lib/repositories/PrismaMovementRepository';
import { PrismaPurchaseRepository } from '../lib/repositories/PrismaPurchaseRepository';
import { PrismaTransferRepository } from '../lib/repositories/PrismaTransferRepository';

import { Product } from '../lib/domain/Product';
import { StockItem } from '../lib/domain/StockItem';
import { User } from '../lib/domain/User';
import { Purchase } from '../lib/domain/Purchase';
import { Transfer } from '../lib/domain/Transfer';

import { prisma, pool } from '../lib/prisma';

describe('Prisma Repositories Integration Tests (TDD)', () => {
  const productRepo = new PrismaProductRepository();
  const stockRepo = new PrismaStockRepository();
  const userRepo = new PrismaUserRepository();
  const movementRepo = new PrismaMovementRepository();
  const purchaseRepo = new PrismaPurchaseRepository();
  const transferRepo = new PrismaTransferRepository();

  beforeAll(async () => {
    // Limpiar base de datos de prueba para evitar colisiones
    await prisma.movement.deleteMany({});
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.transferItem.deleteMany({});
    await prisma.transfer.deleteMany({});
    await prisma.stockItem.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Cerrar el pool de conexiones de pg al finalizar los tests
    await prisma.$disconnect();
    await pool.end();
  });

  describe('PrismaProductRepository', () => {
    it('debería guardar un producto y luego buscarlo por ID', async () => {
      const product = new Product({
        id: 'test-prod-1',
        name: 'Corona 330ml',
        category: 'Cerveza',
        barcode: '7501064191350',
        stock: 12,
        cost: 1500,
        marginPercent: 30,
        price: 1950,
      });

      const saved = await productRepo.save(product);
      expect(saved).toBeInstanceOf(Product);
      expect(saved.id).toBe('test-prod-1');

      const found = await productRepo.findById('test-prod-1');
      expect(found).toBeInstanceOf(Product);
      expect(found.name).toBe('Corona 330ml');
      expect(found.price).toBe(1950);
    });
  });

  describe('PrismaStockRepository', () => {
    it('debería guardar un stock item y buscarlo por producto y ubicación', async () => {
      const product = new Product({
        id: 'test-prod-2',
        name: 'Patagonia Amber Lager',
        category: 'Cerveza',
        barcode: '7790895000994',
        stock: 24,
        cost: 2000,
        marginPercent: 20,
        price: 2400,
      });
      await productRepo.save(product);

      const stockItem = new StockItem({
        productId: 'test-prod-2',
        location: 'depósito',
        quantity: 10,
        expirationDate: new Date('2026-12-31'),
      });

      const saved = await stockRepo.save(stockItem);
      expect(saved).toBeInstanceOf(StockItem);
      expect(saved.quantity).toBe(10);

      const found = await stockRepo.getByProductAndLocation('test-prod-2', 'depósito');
      expect(found).toBeInstanceOf(StockItem);
      expect(found.quantity).toBe(10);
      expect(found.location).toBe('depósito');
    });

    it('debería retornar un StockItem con cantidad 0 si no se encuentra en esa ubicación', async () => {
      const found = await stockRepo.getByProductAndLocation('test-prod-2', 'barra');
      expect(found).toBeInstanceOf(StockItem);
      expect(found.quantity).toBe(0);
      expect(found.location).toBe('barra');
    });

    it('debería listar todos los stock items', async () => {
      const all = await stockRepo.findAll();
      expect(Array.isArray(all)).toBe(true);
      expect(all.length).toBeGreaterThanOrEqual(1);
      expect(all[0]).toBeInstanceOf(StockItem);
    });
  });

  describe('PrismaUserRepository', () => {
    it('debería buscar un usuario por ID', async () => {
      // Primero insertamos el usuario de prueba directamente
      await prisma.user.create({
        data: {
          id: 'test-user-1',
          name: 'Carlos Test',
          role: 'ADMIN',
          active: true,
        },
      });

      const found = await userRepo.findById('test-user-1');
      expect(found).toBeInstanceOf(User);
      expect(found.name).toBe('Carlos Test');
      expect(found.role).toBe('ADMIN');
      expect(found.active).toBe(true);
    });

    it('debería retornar null si el usuario no existe', async () => {
      const found = await userRepo.findById('non-existent');
      expect(found).toBeNull();
    });
  });

  describe('PrismaMovementRepository', () => {
    it('debería registrar un movimiento de stock para un producto', async () => {
      const movement = {
        productId: 'test-prod-1',
        quantity: 5,
        type: 'INGRESAR',
        origin: 'Distribuidora Paso',
      };

      const result = await movementRepo.save(movement);
      expect(result).toBeDefined();
      expect(result.productId).toBe('test-prod-1');

      // Consultar de la DB para validar persistencia
      const dbMovement = await prisma.movement.findFirst({
        where: { productId: 'test-prod-1', type: 'INGRESAR' },
      });
      expect(dbMovement).not.toBeNull();
      expect(dbMovement.quantity).toBe(5);
    });
  });

  describe('PrismaPurchaseRepository', () => {
    it('debería guardar una compra con sus ítems y recuperarla', async () => {
      const purchase = new Purchase({
        id: 'test-purch-1',
        wholesaler: 'Pasifox Mayorista',
        invoiceNumber: 'INV-999',
        paymentType: 'contado',
        paymentStatus: 'pendiente',
        items: [
          { productId: 'test-prod-1', quantity: 10, purchasePrice: 1500 },
        ],
        createdAt: new Date(),
      });

      const saved = await purchaseRepo.save(purchase);
      expect(saved).toBeInstanceOf(Purchase);
      expect(saved.id).toBe('test-purch-1');
      expect(saved.items).toHaveLength(1);
      expect(saved.items[0].productId).toBe('test-prod-1');

      const all = await purchaseRepo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].wholesaler).toBe('Pasifox Mayorista');
      expect(all[0].items[0].purchasePrice).toBe(1500);
    });
  });

  describe('PrismaTransferRepository', () => {
    it('debería registrar un envío de mercadería y recuperarlo por ID', async () => {
      const transfer = new Transfer({
        id: 'test-trans-1',
        items: [{ productId: 'test-prod-1', quantity: 5 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'test-user-1',
        status: 'PENDING',
        createdAt: new Date(),
      });

      const saved = await transferRepo.save(transfer);
      expect(saved).toBeInstanceOf(Transfer);
      expect(saved.id).toBe('test-trans-1');

      const found = await transferRepo.findById('test-trans-1');
      expect(found).toBeInstanceOf(Transfer);
      expect(found.originLocation).toBe('depósito');
      expect(found.destinationLocation).toBe('barra');
      expect(found.status).toBe('PENDING');
      expect(found.items).toHaveLength(1);
      expect(found.items[0].productId).toBe('test-prod-1');
    });

    it('debería actualizar el estado de una transferencia al guardarse de nuevo', async () => {
      const found = await transferRepo.findById('test-trans-1');
      expect(found).toBeInstanceOf(Transfer);

      // Confirmar transferencia
      found.confirm('test-user-1');

      const updated = await transferRepo.save(found);
      expect(updated.status).toBe('CONFIRMED');
      expect(updated.receiverUserId).toBe('test-user-1');
      expect(updated.confirmedAt).toBeInstanceOf(Date);

      const reFound = await transferRepo.findById('test-trans-1');
      expect(reFound.status).toBe('CONFIRMED');
      expect(reFound.receiverUserId).toBe('test-user-1');
    });
  });
});
