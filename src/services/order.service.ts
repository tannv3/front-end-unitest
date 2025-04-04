import { Order } from '../models/order.model';
import { IPaymentService } from '../interfaces/payment.interface';
import { IOrderRepository, IOrderValidator } from '../interfaces/order.interface';
import { ICouponService } from '../interfaces/payment.interface';
import { PaymentMethod } from '../models/payment.model';

export class OrderValidator implements IOrderValidator {
  validate(order: Partial<Order>): void {
    if (!order.items?.length) {
      throw new Error('Order items are required');
    }

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }
  }

  calculateTotalPrice(order: Partial<Order>, discount: number = 0): number {
    const totalPrice = order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

    if (totalPrice <= 0) {
      throw new Error('Total price must be greater than 0');
    }

    const finalPrice = totalPrice - discount;
    return finalPrice < 0 ? 0 : finalPrice;
  }
}

export class OrderRepository implements IOrderRepository {
  private readonly baseUrl = 'https://67eb7353aa794fb3222a4c0e.mockapi.io/order';

  async create(order: Partial<Order>): Promise<Order> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      body: JSON.stringify(order),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}

export class CouponService implements ICouponService {
  private readonly baseUrl = 'https://67eb7353aa794fb3222a4c0e.mockapi.io/coupons';

  async validateCoupon(couponId: string): Promise<{ discount: number }> {
    const response = await fetch(`${this.baseUrl}/${couponId}`);
    const coupon = await response.json();

    if (!coupon) {
      throw new Error('Invalid coupon');
    }

    return { discount: coupon.discount };
  }
}

export class OrderService {
  constructor(
    private readonly paymentService: IPaymentService,
    private readonly orderValidator: IOrderValidator,
    private readonly orderRepository: IOrderRepository,
    private readonly couponService: ICouponService
  ) {}

  async process(order: Partial<Order>): Promise<void> {
    // Validate order
    this.orderValidator.validate(order);

    // Calculate total price with discount if coupon exists
    let discount = 0;
    if (order.couponId) {
      const coupon = await this.couponService.validateCoupon(order.couponId);
      discount = coupon.discount;
    }

    const totalPrice = this.orderValidator.calculateTotalPrice(order, discount);

    // Create order with payment method
    const orderPayload = {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice).split(',')[0] as PaymentMethod,
    };

    const createdOrder = await this.orderRepository.create(orderPayload);
    await this.paymentService.payViaLink(createdOrder);
  }
}
