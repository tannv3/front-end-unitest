import { Order } from '../models/order.model';

export interface IPaymentMethod {
  isApplicable(totalPrice: number): boolean;
  getMethod(): string;
}

export interface IPaymentService {
  buildPaymentMethod(totalPrice: number): string;
  payViaLink(order: Order): Promise<void>;
}

export interface ICouponService {
  validateCoupon(couponId: string): Promise<{ discount: number }>;
} 