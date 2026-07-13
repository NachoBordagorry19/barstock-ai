import { Product } from '../lib/domain/Product';
import { Purchase } from '../lib/domain/Purchase';
import { Transfer } from '../lib/domain/Transfer';
import { User } from '../lib/domain/User';
import { StockItem } from '../lib/domain/StockItem';
import { PurchaseDTO, TransferDTO, StockItemDTO } from '../lib/dtos/StockDTOs';
import { StockService } from '../lib/services/StockService';

describe('StockService - Arquitectura Limpia con Roles de Usuario (TDD)', () => {
  let mockProductRepository;
  let mockPurchaseRepository;
  let mockMovementRepository;
  let mockStockRepository;
  let mockTransferRepository;
  let mockUserRepository;
  let stockService;

  beforeEach(() => {
    // Repositorio de Usuarios
    mockUserRepository = {
      users: [
        new User({ id: 'user-admin', name: 'Admin Carlos', role: 'ADMIN' }),
        new User({ id: 'user-despachador', name: 'Despachador Pedro', role: 'DESPACHADOR' }),
        new User({ id: 'user-receptor', name: 'Receptor Gomez', role: 'RECEPTOR' }),
        new User({ id: 'user-invalid', name: 'Usuario Invalido', role: 'OTRO' }),
      ],
      findById: jest.fn((id) => mockUserRepository.users.find(u => u.id === id)),
    };

    // Repositorio de Productos maneja entidades de Dominio 'Product' (con costo y margen)
    mockProductRepository = {
      products: [
        new Product({ id: 'prod-1', name: 'Coca Cola 1L', stock: 10, price: 1200, cost: 1000, marginPercent: 20 }),
        new Product({ id: 'prod-2', name: 'Fernet Branca 750ml', stock: 5, price: 14700, cost: 12250, marginPercent: 20 }),
      ],
      findById: jest.fn((id) => mockProductRepository.products.find(p => p.id === id)),
      save: jest.fn((product) => {
        if (!(product instanceof Product)) {
          throw new Error('Debe ser instancia de Product en el Repositorio');
        }
        const index = mockProductRepository.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          mockProductRepository.products[index] = product;
        } else {
          mockProductRepository.products.push(product);
        }
        return product;
      }),
    };

    // Repositorio de Compras maneja entidades de Dominio 'Purchase'
    mockPurchaseRepository = {
      purchases: [],
      save: jest.fn((purchase) => {
        if (!(purchase instanceof Purchase)) {
          throw new Error('Debe ser instancia de Purchase en el Repositorio');
        }
        purchase.id = purchase.id || `purch-${mockPurchaseRepository.purchases.length + 1}`;
        mockPurchaseRepository.purchases.push(purchase);
        return purchase;
      }),
      findAll: jest.fn(() => mockPurchaseRepository.purchases),
    };

    mockMovementRepository = {
      movements: [],
      save: jest.fn((movement) => {
        movement.id = `mov-${mockMovementRepository.movements.length + 1}`;
        mockMovementRepository.movements.push(movement);
        return movement;
      }),
    };

    // Repositorio de Stocks maneja entidades de Dominio 'StockItem'
    mockStockRepository = {
      stocks: [
        new StockItem({ productId: 'prod-1', location: 'depósito', quantity: 10 }),
        new StockItem({ productId: 'prod-1', location: 'barra', quantity: 2 }),
      ],
      getByProductAndLocation: jest.fn((productId, location) => {
        return mockStockRepository.stocks.find(
          s => s.productId === productId && s.location === location
        ) || new StockItem({ productId, location, quantity: 0 });
      }),
      save: jest.fn((stock) => {
        if (!(stock instanceof StockItem)) {
          throw new Error('Debe ser instancia de StockItem en el Repositorio');
        }
        const index = mockStockRepository.stocks.findIndex(
          s => s.productId === stock.productId && s.location === stock.location
        );
        if (index !== -1) {
          mockStockRepository.stocks[index] = stock;
        } else {
          mockStockRepository.stocks.push(stock);
        }
        return stock;
      }),
      findAll: jest.fn(() => mockStockRepository.stocks),
    };

    // Repositorio de Transferencias maneja entidades de Dominio 'Transfer'
    mockTransferRepository = {
      transfers: [],
      save: jest.fn((transfer) => {
        if (!(transfer instanceof Transfer)) {
          throw new Error('Debe ser instancia de Transfer en el Repositorio');
        }
        if (!transfer.id) {
          transfer.id = `trans-${mockTransferRepository.transfers.length + 1}`;
          mockTransferRepository.transfers.push(transfer);
        } else {
          const index = mockTransferRepository.transfers.findIndex(t => t.id === transfer.id);
          if (index !== -1) mockTransferRepository.transfers[index] = transfer;
        }
        return transfer;
      }),
      findById: jest.fn((id) => mockTransferRepository.transfers.find(t => t.id === id)),
    };

    // Inyección de dependencias (ahora con mockUserRepository)
    stockService = new StockService(
      mockProductRepository,
      mockPurchaseRepository,
      mockMovementRepository,
      mockStockRepository,
      mockTransferRepository,
      mockUserRepository
    );
  });

  test('Debería mapear DTO a Entidad de Dominio en Compra, guardarla en repositorio y retornar PurchaseDTO a la UI', () => {
    const purchaseInput = {
      wholesaler: 'Pasifox',
      invoiceNumber: 'FC-0001-00002345',
      paymentType: 'crédito',
      paymentStatus: 'pendiente',
      items: [
        { productId: 'prod-1', quantity: 20, purchasePrice: 1000 },
        { productId: 'prod-2', quantity: 10, purchasePrice: 12250 },
      ]
    };

    const resultDTO = stockService.registerPurchase(purchaseInput);

    expect(resultDTO).toBeInstanceOf(PurchaseDTO);
    expect(resultDTO.wholesaler).toBe('Pasifox');
    expect(resultDTO.invoiceNumber).toBe('FC-0001-00002345');

    expect(mockPurchaseRepository.save).toHaveBeenCalled();
    const savedArg = mockPurchaseRepository.save.mock.calls[0][0];
    expect(savedArg).toBeInstanceOf(Purchase);

    const updatedCoca = mockProductRepository.products.find(p => p.id === 'prod-1');
    expect(updatedCoca.stock).toBe(30);
  });

  test('Debería manejar el ciclo de vida del traslado mediante Transfer (Dominio) y retornar TransferDTO', () => {
    // 1. DESPACHAR (con un usuario despachador válido)
    const transferInput = {
      items: [{ productId: 'prod-1', quantity: 5 }],
      originLocation: 'depósito',
      destinationLocation: 'barra',
      senderUserId: 'user-despachador'
    };

    const dispatchedDTO = stockService.dispatchTransfer(transferInput);

    expect(dispatchedDTO).toBeInstanceOf(TransferDTO);
    expect(dispatchedDTO.status).toBe('PENDING');

    const savedTransferInRepo = mockTransferRepository.transfers[0];
    expect(savedTransferInRepo).toBeInstanceOf(Transfer);

    // 2. CONFIRMAR (con un usuario receptor válido)
    const confirmedDTO = stockService.confirmTransfer(dispatchedDTO.id, 'user-receptor');

    expect(confirmedDTO).toBeInstanceOf(TransferDTO);
    expect(confirmedDTO.status).toBe('CONFIRMED');
    expect(confirmedDTO.receiverUserId).toBe('user-receptor');

    expect(mockTransferRepository.transfers[0].status).toBe('CONFIRMED');
  });

  describe('StockService - Validación de Inputs (Fluent API)', () => {
    test('Debería arrojar error de validación si el proveedor está vacío o la cantidad de ítems es menor o igual a cero', () => {
      const invalidPurchase = {
        wholesaler: '',
        invoiceNumber: 'FC-123',
        paymentType: 'crédito',
        paymentStatus: 'pendiente',
        items: [
          { productId: 'prod-1', quantity: 0, purchasePrice: 100 }
        ]
      };

      expect(() => {
        stockService.registerPurchase(invalidPurchase);
      }).toThrow(/Validación fallida/);
    });

    test('Debería arrojar error de validación si se intenta trasbordar mercadería con cantidad negativa', () => {
      const invalidTransfer = {
        items: [{ productId: 'prod-1', quantity: -10 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-despachador'
      };

      expect(() => {
        stockService.dispatchTransfer(invalidTransfer);
      }).toThrow(/Validación fallida/);
    });
  });

  describe('StockService - Control de Perfiles de Usuario (Seguridad)', () => {
    test('Debería denegar el despacho de mercadería si el usuario no tiene rol de despachador o administrador', () => {
      const transferInput = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-receptor'
      };

      expect(() => {
        stockService.dispatchTransfer(transferInput);
      }).toThrow(/Permiso denegado: El usuario no tiene rol de despachador/);
    });

    test('Debería denegar la confirmación de mercadería si el usuario no tiene rol de receptor o administrador', () => {
      const pendingTransfer = new Transfer({
        id: 'trans-99',
        items: [{ productId: 'prod-1', quantity: 2 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-despachador',
        status: 'PENDING',
      });
      mockTransferRepository.transfers.push(pendingTransfer);

      expect(() => {
        stockService.confirmTransfer('trans-99', 'user-despachador');
      }).toThrow(/Permiso denegado: El usuario no tiene rol de receptor/);
    });

    test('Debería permitir el despacho y confirmación a usuarios con rol de ADMIN', () => {
      const transferInput = {
        items: [{ productId: 'prod-1', quantity: 1 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-admin'
      };

      const transfer = stockService.dispatchTransfer(transferInput);
      expect(transfer.status).toBe('PENDING');

      const confirmed = stockService.confirmTransfer(transfer.id, 'user-admin');
      expect(confirmed.status).toBe('CONFIRMED');
    });
  });

  describe('StockService - Control de Fechas de Vencimiento', () => {
    test('Debería guardar la fecha de vencimiento en el stock al registrar una compra', () => {
      const purchaseInput = {
        wholesaler: 'Pasifox',
        invoiceNumber: 'FC-888',
        paymentType: 'contado',
        paymentStatus: 'pagado',
        items: [
          { productId: 'prod-1', quantity: 5, purchasePrice: 800, expirationDate: '2026-12-31' }
        ]
      };

      stockService.registerPurchase(purchaseInput);

      const stock = mockStockRepository.getByProductAndLocation('prod-1', 'depósito');
      expect(stock.expirationDate).toBeDefined();
      expect(stock.expirationDate.toISOString().split('T')[0]).toBe('2026-12-31');
    });

    test('Debería retornar la lista de productos vencidos', () => {
      const today = new Date('2026-07-15');

      mockStockRepository.stocks = [
        new StockItem({ productId: 'prod-1', location: 'depósito', quantity: 5, expirationDate: '2026-07-01' }),
        new StockItem({ productId: 'prod-2', location: 'barra', quantity: 10, expirationDate: '2026-08-30' })
      ];

      const expired = stockService.getExpiredItems(today);
      expect(expired.length).toBe(1);
      expect(expired[0].productId).toBe('prod-1');
      expect(expired[0]).toBeInstanceOf(StockItemDTO);
      expect(expired[0].isExpired).toBe(true);
    });

    test('Debería arrojar un error si se intenta trasladar un producto que ya venció', () => {
      const today = new Date('2026-07-15');

      mockStockRepository.stocks = [
        new StockItem({ productId: 'prod-1', location: 'depósito', quantity: 5, expirationDate: '2026-07-01' })
      ];

      const transferInput = {
        items: [{ productId: 'prod-1', quantity: 2 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-despachador'
      };

      expect(() => {
        stockService.dispatchTransfer(transferInput, today);
      }).toThrow(/No se puede trasladar mercadería vencida/);
    });
  });

  describe('StockService - Margen de Precios y Ganancia', () => {
    test('Debería actualizar el costo del producto y calcular el precio de venta con el margen del 20% al registrar compra', () => {
      const purchaseInput = {
        wholesaler: 'Pasifox',
        invoiceNumber: 'FC-999',
        paymentType: 'contado',
        paymentStatus: 'pagado',
        items: [
          { productId: 'prod-1', quantity: 10, purchasePrice: 500 } // Costo anterior era 1000, nuevo costo es 500
        ]
      };

      stockService.registerPurchase(purchaseInput);

      const product = mockProductRepository.findById('prod-1');
      expect(product.cost).toBe(500);
      expect(product.price).toBe(600); // 500 * 1.20 = 600
    });
  });
});
