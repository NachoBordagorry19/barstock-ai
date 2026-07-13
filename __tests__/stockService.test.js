import { StockService } from '../lib/services/StockService';

describe('StockService - Registro de Compras (TDD)', () => {
  let mockProductRepository;
  let mockPurchaseRepository;
  let mockMovementRepository;
  let stockService;

  beforeEach(() => {
    // Definimos repositorios mockeados en memoria siguiendo el patrón Repository (SOLID)
    mockProductRepository = {
      products: [
        { id: 'prod-1', name: 'Coca Cola 1L', stock: 10, price: 1200 },
        { id: 'prod-2', name: 'Fernet Branca 750ml', stock: 5, price: 14700 },
      ],
      findById: jest.fn((id) => mockProductRepository.products.find(p => p.id === id)),
      save: jest.fn((product) => {
        const index = mockProductRepository.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          mockProductRepository.products[index] = product;
        } else {
          mockProductRepository.products.push(product);
        }
        return product;
      }),
    };

    mockPurchaseRepository = {
      purchases: [],
      save: jest.fn((purchase) => {
        purchase.id = `purch-${mockPurchaseRepository.purchases.length + 1}`;
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

    // Inyectamos las dependencias en el servicio (Dependency Inversion Principle)
    stockService = new StockService(
      mockProductRepository,
      mockPurchaseRepository,
      mockMovementRepository
    );
  });

  test('Debería registrar una compra a un mayorista y actualizar el stock de los productos', () => {
    const purchaseData = {
      wholesaler: 'Pasifox',
      invoiceNumber: 'FC-0001-00002345',
      paymentType: 'crédito', // 'contado' o 'crédito'
      paymentStatus: 'pendiente', // 'pagado' o 'pendiente'
      items: [
        { productId: 'prod-1', quantity: 20, purchasePrice: 800 },
        { productId: 'prod-2', quantity: 10, purchasePrice: 11000 },
      ]
    };

    const registeredPurchase = stockService.registerPurchase(purchaseData);

    // 1. Debe retornar la compra registrada con un ID asignado y campos correctos
    expect(registeredPurchase).toBeDefined();
    expect(registeredPurchase.id).toBeDefined();
    expect(registeredPurchase.wholesaler).toBe('Pasifox');
    expect(registeredPurchase.invoiceNumber).toBe('FC-0001-00002345');
    expect(registeredPurchase.paymentStatus).toBe('pendiente');

    // 2. Debe guardarse en el repositorio de compras
    expect(mockPurchaseRepository.save).toHaveBeenCalled();
    expect(mockPurchaseRepository.purchases.length).toBe(1);

    // 3. Debe actualizar los stocks de los productos en el repositorio
    expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-1');
    expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-2');
    expect(mockProductRepository.save).toHaveBeenCalledTimes(2);

    const updatedCoca = mockProductRepository.products.find(p => p.id === 'prod-1');
    const updatedFernet = mockProductRepository.products.find(p => p.id === 'prod-2');

    // Coca: stock inicial 10 + 20 comprados = 30
    expect(updatedCoca.stock).toBe(30);
    // Fernet: stock inicial 5 + 10 comprados = 15
    expect(updatedFernet.stock).toBe(15);

    // 4. Debe registrar un movimiento de tipo 'INGRESAR' en el historial de movimientos
    expect(mockMovementRepository.save).toHaveBeenCalledTimes(2);
    expect(mockMovementRepository.movements[0]).toMatchObject({
      productId: 'prod-1',
      quantity: 20,
      type: 'INGRESAR',
      origin: 'Pasifox',
    });
  });

  describe('Transferencia entre ubicaciones con doble confirmación', () => {
    let mockStockRepository;
    let mockTransferRepository;

    beforeEach(() => {
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

      mockTransferRepository = {
        transfers: [],
        save: jest.fn((transfer) => {
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

      // Inyectamos también los nuevos repositorios en el servicio
      stockService = new StockService(
        mockProductRepository,
        mockPurchaseRepository,
        mockMovementRepository,
        mockStockRepository,
        mockTransferRepository
      );
    });

    test('Debería registrar un envío de mercadería (pendiente) y restar del origen, pero no sumar al destino todavía', () => {
      const transferData = {
        items: [{ productId: 'prod-1', quantity: 5 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-envia'
      };

      const transfer = stockService.dispatchTransfer(transferData);

      // 1. Debe estar en estado PENDING
      expect(transfer).toBeDefined();
      expect(transfer.id).toBeDefined();
      expect(transfer.status).toBe('PENDING');
      expect(transfer.senderUserId).toBe('user-envia');

      // 2. Debe restar stock del origen (10 - 5 = 5)
      const originStock = mockStockRepository.getByProductAndLocation('prod-1', 'depósito');
      expect(originStock.quantity).toBe(5);

      // 3. NO debe sumar stock al destino todavía (sigue en 2)
      const destStock = mockStockRepository.getByProductAndLocation('prod-1', 'barra');
      expect(destStock.quantity).toBe(2);
    });

    test('Debería confirmar una transferencia pendiente, sumando al destino y registrando el receptor', () => {
      // Primero creamos una transferencia pendiente en el repositorio
      const pendingTransfer = {
        id: 'trans-1',
        items: [{ productId: 'prod-1', quantity: 5 }],
        originLocation: 'depósito',
        destinationLocation: 'barra',
        senderUserId: 'user-envia',
        status: 'PENDING',
      };
      mockTransferRepository.transfers.push(pendingTransfer);

      const confirmed = stockService.confirmTransfer('trans-1', 'user-recibe');

      // 1. El estado debe ser CONFIRMED y guardar quién lo recibió
      expect(confirmed.status).toBe('CONFIRMED');
      expect(confirmed.receiverUserId).toBe('user-recibe');

      // 2. Debe sumar stock al destino (2 + 5 = 7)
      const destStock = mockStockRepository.getByProductAndLocation('prod-1', 'barra');
      expect(destStock.quantity).toBe(7);

      // 3. Debe registrar un movimiento de stock para la barra
      expect(mockMovementRepository.save).toHaveBeenCalled();
    });
  });
});
