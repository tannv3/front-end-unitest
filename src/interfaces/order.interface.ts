import { Order } from '../models/order.model';

export interface IOrderRepository {
  create(order: Partial<Order>): Promise<Order>;
}

export interface IOrderValidator {
  validate(order: Partial<Order>): void;
  calculateTotalPrice(order: Partial<Order>, discount?: number): number;
} 