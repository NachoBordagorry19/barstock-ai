/**
 * @jest-environment node
 */
import { PrismaProductRepository } from '../lib/repositories/PrismaProductRepository';
import { PrismaStockRepository } from '../lib/repositories/PrismaStockRepository';
import { Product } from '../lib/domain/Product';
import { StockItem } from '../lib/domain/StockItem';
import { prisma, pool } from '../lib/prisma';

describe('Prisma Repositories Integration Tests (TDD)', () => {
  const productRepo = new PrismaProductRepository();
  const stockRepo = new PrismaStockRepository();

  beforeAll(async () => {
    // Limpiar base de datos de prueba para evitar colisiones
    await prisma.stockItem.deleteMany({});
    await prisma.product.deleteMany({});
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
      // Necesitamos crear un producto primero en el test
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
});
