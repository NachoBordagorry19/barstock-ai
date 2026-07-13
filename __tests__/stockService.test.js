import { Product } from '../lib/domain/Product';
import { Purchase } from '../lib/domain/Purchase';
import { Transfer } from '../lib/domain/Transfer';
import { PurchaseDTO, TransferDTO } from '../lib/dtos/StockDTOs';
import { StockService } from '../lib/services/StockService';

describe('StockService - Arquitectura Limpia (Domain / DTO / Repositorios) (TDD)', () => {
  let mockProductRepository;
  let mockPurchaseRepository;
  let mockMovementRepository;
  let mockStockRepository;
  let mockTransferRepository;
  let stockService;

  beforeEach(() => {
    // Repositorio de Productos maneja entidades de Dominio 'Product'
    mockProductRepository = {
      products: [
        new Product({ id: 'prod-1', name: 'Coca Cola 1L', stock: 10, price: 1200 }),
        new Product({ id: 'prod-2', name: 'Fernet Branca 750ml', stock: 5, price: 14700 }),
      ],
      findById: jest.fn((id) => mockProductRepository.products.find(p => p.id === id)),
      save: jest.fn((product) => {
        // Validamos que se guarde una entidad de Dominio, no un DTO
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

    mockStockRepository = {
      stocks: [
        { productId: 'prod-1', location: 'depósito', quantity: 10 },
        { productId: 'prod-1', location: 'barra', quantity: 2 },
      ],
      getByProductAndLocation: jest.fn((productId, location) => {
        return mockStockRepository.stocks.find(
          s => s.productId === productId && s.location === location
        ) || { productId, location, quantity: 0 };
      }),
      save: jest.fn((stock) => {
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

    // Inyección de dependencias
    stockService = new StockService(
      mockProductRepository,
      mockPurchaseRepository,
      mockMovementRepository,
      mockStockRepository,
      mockTransferRepository
    );
  });

  test('Debería mapear DTO a Entidad de Dominio en Compra, guardarla en repositorio y retornar PurchaseDTO a la UI', () => {
    // La UI envía datos planos (DTO de entrada implícito)
    const purchaseInput = {
      wholesaler: 'Pasifox',
      invoiceNumber: 'FC-0001-00002345',
      paymentType: 'crédito',
      paymentStatus: 'pendiente',
      items: [
        { productId: 'prod-1', quantity: 20, purchasePrice: 800 },
        { productId: 'prod-2', quantity: 10, purchasePrice: 11000 },
      ]
    };

    const resultDTO = stockService.registerPurchase(purchaseInput);

    // 1. El servicio debe retornar un PurchaseDTO
    expect(resultDTO).toBeInstanceOf(PurchaseDTO);
    expect(resultDTO.wholesaler).toBe('Pasifox');
    expect(resultDTO.invoiceNumber).toBe('FC-0001-00002345');

    // 2. El repositorio debe haber recibido una instancia de Purchase
    expect(mockPurchaseRepository.save).toHaveBeenCalled();
    const savedArg = mockPurchaseRepository.save.mock.calls[0][0];
    expect(savedArg).toBeInstanceOf(Purchase);

    // 3. El stock de Coca (10 + 20 = 30) y Fernet (5 + 10 = 15) debe actualizarse usando métodos de Dominio
    const updatedCoca = mockProductRepository.products.find(p => p.id === 'prod-1');
    expect(updatedCoca.stock).toBe(30);
  });

  test('Debería manejar el ciclo de vida del traslado mediante Transfer (Dominio) y retornar TransferDTO', () => {
    // 1. DESPACHAR
    const transferInput = {
      items: [{ productId: 'prod-1', quantity: 5 }],
      originLocation: 'depósito',
      destinationLocation: 'barra',
      senderUserId: 'user-envia'
    };

    const dispatchedDTO = stockService.dispatchTransfer(transferInput);

    expect(dispatchedDTO).toBeInstanceOf(TransferDTO);
    expect(dispatchedDTO.status).toBe('PENDING');

    const savedTransferInRepo = mockTransferRepository.transfers[0];
    expect(savedTransferInRepo).toBeInstanceOf(Transfer);

    // 2. CONFIRMAR
    const confirmedDTO = stockService.confirmTransfer(dispatchedDTO.id, 'user-recibe');

    expect(confirmedDTO).toBeInstanceOf(TransferDTO);
    expect(confirmedDTO.status).toBe('CONFIRMED');
    expect(confirmedDTO.receiverUserId).toBe('user-recibe');

    expect(mockTransferRepository.transfers[0].status).toBe('CONFIRMED');
  });

  describe('StockService - Validación de Inputs (Fluent API)', () => {
    test('Debería arrojar error de validación si el proveedor está vacío o la cantidad de ítems es menor o igual a cero', () => {
      const invalidPurchase = {
        wholesaler: '', // Inválido (vacío)
        invoiceNumber: 'FC-123',
        paymentType: 'crédito',
        paymentStatus: 'pendiente',
        items: [
          { productId: 'prod-1', quantity: 0, purchasePrice: 100 } // Inválido (cero o menor)
        ]
      };

      expect(() => {
        stockService.registerPurchase(invalidPurchase);
      }).toThrow(/Validación fallida/);
    });

    test('Debería arrojar error de validación si se intenta trasbordar mercadería con cantidad negativa', () => {
      const invalidTransfer = {
        items: [{ productId: 'prod-1', quantity: -10 }], // Inválido
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-envia'
      };

      expect(() => {
        stockService.dispatchTransfer(invalidTransfer);
      }).toThrow(/Validación fallida/);
    });
  });
});
