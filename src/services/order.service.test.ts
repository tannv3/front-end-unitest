import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from './order.service';
import { OrderValidator } from './order.service';
import { OrderRepository } from './order.service';
import { CouponService } from './order.service';
import { PaymentService } from './payment.service';
import { Order } from '../models/order.model';
import { PaymentMethod } from '../models/payment.model';

// Mock dependencies
const mockPaymentService = {
  buildPaymentMethod: vi.fn(),
  payViaLink: vi.fn(),
};

const mockOrderValidator = {
  validate: vi.fn(),
  calculateTotalPrice: vi.fn(),
};

const mockOrderRepository = {
  create: vi.fn(),
};

const mockCouponService = {
  validateCoupon: vi.fn(),
};

describe('OrderValidator', () => {
  let validator: OrderValidator;

  beforeEach(() => {
    validator = new OrderValidator();
  });

  it('should validate order with valid items', () => {
    const order = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
    };
    expect(() => validator.validate(order)).not.toThrow();
  });

  it('should throw error when items are missing', () => {
    const order = { items: [] };
    expect(() => validator.validate(order)).toThrow('Order items are required');
  });

  it('should throw error when items have invalid price or quantity', () => {
    const order = {
      items: [{ id: '1', productId: '1', price: 0, quantity: 1 }],
    };
    expect(() => validator.validate(order)).toThrow('Order items are invalid');
  });

  it('should calculate total price correctly', () => {
    const order = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
    };
    const totalPrice = validator.calculateTotalPrice(order);
    expect(totalPrice).toBe(200);
  });

  it('should apply discount correctly', () => {
    const order = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
    };
    const totalPrice = validator.calculateTotalPrice(order, 50);
    expect(totalPrice).toBe(150);
  });

  it('should return 0 when discount is greater than total price', () => {
    const order = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 1 }],
    };
    const totalPrice = validator.calculateTotalPrice(order, 150);
    expect(totalPrice).toBe(0);
  });
});

describe('OrderRepository', () => {
  let repository: OrderRepository;

  beforeEach(() => {
    repository = new OrderRepository();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should create order successfully', async () => {
    const mockOrder = { id: '1', items: [] };
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockOrder),
    });

    const result = await repository.create(mockOrder);
    expect(result).toEqual(mockOrder);
    expect(fetch).toHaveBeenCalledWith(
      'https://67eb7353aa794fb3222a4c0e.mockapi.io/order',
      expect.any(Object)
    );
  });
});

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(() => {
    service = new CouponService();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should validate coupon successfully', async () => {
    const mockCoupon = { discount: 50 };
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockCoupon),
    });

    const result = await service.validateCoupon('123');
    expect(result).toEqual({ discount: 50 });
  });

  it('should throw error for invalid coupon', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(null),
    });

    await expect(service.validateCoupon('123')).rejects.toThrow('Invalid coupon');
  });
});

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService(
      mockPaymentService as any,
      mockOrderValidator as any,
      mockOrderRepository as any,
      mockCouponService as any
    );
    vi.clearAllMocks();
  });

  it('should process order successfully without coupon', async () => {
    const mockOrder: Partial<Order> = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
    };
    const mockCreatedOrder = { id: '1', ...mockOrder };
    
    mockOrderValidator.calculateTotalPrice.mockReturnValue(200);
    mockPaymentService.buildPaymentMethod.mockReturnValue(PaymentMethod.CREDIT);
    mockOrderRepository.create.mockResolvedValue(mockCreatedOrder);

    await service.process(mockOrder);

    expect(mockOrderValidator.validate).toHaveBeenCalledWith(mockOrder);
    expect(mockOrderValidator.calculateTotalPrice).toHaveBeenCalledWith(mockOrder, 0);
    expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(200);
    expect(mockOrderRepository.create).toHaveBeenCalled();
    expect(mockPaymentService.payViaLink).toHaveBeenCalledWith(mockCreatedOrder);
  });

  it('should process order successfully with coupon', async () => {
    const mockOrder: Partial<Order> = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
      couponId: '123',
    };
    const mockCreatedOrder = { id: '1', ...mockOrder };
    
    mockCouponService.validateCoupon.mockResolvedValue({ discount: 50 });
    mockOrderValidator.calculateTotalPrice.mockReturnValue(150);
    mockPaymentService.buildPaymentMethod.mockReturnValue(PaymentMethod.CREDIT);
    mockOrderRepository.create.mockResolvedValue(mockCreatedOrder);

    await service.process(mockOrder);

    expect(mockOrderValidator.validate).toHaveBeenCalledWith(mockOrder);
    expect(mockCouponService.validateCoupon).toHaveBeenCalledWith('123');
    expect(mockOrderValidator.calculateTotalPrice).toHaveBeenCalledWith(mockOrder, 50);
    expect(mockPaymentService.buildPaymentMethod).toHaveBeenCalledWith(150);
    expect(mockOrderRepository.create).toHaveBeenCalled();
    expect(mockPaymentService.payViaLink).toHaveBeenCalledWith(mockCreatedOrder);
  });

  it('should handle validation errors', async () => {
    const mockOrder: Partial<Order> = {
      items: [],
    };
    
    mockOrderValidator.validate.mockImplementation(() => {
      throw new Error('Validation error');
    });

    await expect(service.process(mockOrder)).rejects.toThrow('Validation error');
  });

  it('should handle coupon validation errors', async () => {
    const mockOrder: Partial<Order> = {
      items: [{ id: '1', productId: '1', price: 100, quantity: 2 }],
      couponId: '123',
    };
    
    // Clear all mocks first
    vi.clearAllMocks();
    
    // Mock validate to not throw error
    mockOrderValidator.validate.mockImplementation(() => {});
    mockOrderValidator.calculateTotalPrice.mockReturnValue(200);
    mockPaymentService.buildPaymentMethod.mockReturnValue(PaymentMethod.CREDIT);
    mockCouponService.validateCoupon.mockRejectedValue(new Error('Invalid coupon'));

    await expect(service.process(mockOrder)).rejects.toThrow('Invalid coupon');
  });
});
