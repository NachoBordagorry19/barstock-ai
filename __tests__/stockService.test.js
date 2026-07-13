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
});
