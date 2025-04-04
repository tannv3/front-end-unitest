import { PaymentMethod } from "../models/payment.model";
import { Order } from '../models/order.model';
import { IPaymentMethod, IPaymentService } from '../interfaces/payment.interface';

class PayPayMethod implements IPaymentMethod {
  isApplicable(totalPrice: number): boolean {
    return totalPrice <= 500000;
  }

  getMethod(): string {
    return PaymentMethod.PAYPAY;
  }
}

class AuPayMethod implements IPaymentMethod {
  isApplicable(totalPrice: number): boolean {
    return totalPrice <= 300000;
  }

  getMethod(): string {
    return PaymentMethod.AUPAY;
  }
}

class CreditMethod implements IPaymentMethod {
  isApplicable(totalPrice: number): boolean {
    return true;
  }

  getMethod(): string {
    return PaymentMethod.CREDIT;
  }
}

export class PaymentService implements IPaymentService {
  private readonly paymentMethods: IPaymentMethod[] = [
    new CreditMethod(),
    new PayPayMethod(),
    new AuPayMethod(),
  ];

  buildPaymentMethod(totalPrice: number): string {
    const filteredMethods = this.paymentMethods
      .filter(method => method.isApplicable(totalPrice))
      .map(method => method.getMethod());

    return filteredMethods.join(',');
  }

  async payViaLink(order: Order): Promise<void> {
    window.open(`https://payment.example.com/pay?orderId=${order.id}`, '_blank');
  }
}
