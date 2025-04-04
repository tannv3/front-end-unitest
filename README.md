## Test Case Checklist
This document provides a comprehensive checklist for testing the Order and Payment services.

### Order Service Test Cases
#### OrderValidator
- Validate order with valid items:
  Verify that the order passes validation when it contains valid items.

- Throw error when items are missing:
  Verify that an error is thrown if the order contains no items.

- Throw error when items have invalid price or quantity:
  Verify that an error is thrown when any item has an invalid price or quantity.

- Calculate total price correctly:
  Verify that the total price is calculated correctly.

- Apply discount correctly:
  Verify that the discount is applied correctly.

- Return 0 when discount is greater than total price:
  Verify that the total price becomes 0 if the discount exceeds the calculated total.

#### OrderRepository
- Create order successfully:
  Verify that an order is created successfully and the API call returns the expected order.

#### CouponService
- Validate coupon successfully:
  Verify that a valid coupon is correctly validated.

- Throw error for invalid coupon:
  Verify that an error is thrown for an invalid coupon.

#### OrderService
- Process order successfully without coupon:
  Verify that an order is processed successfully when no coupon is provided.

- Process order successfully with coupon:
  Verify that an order is processed successfully when a valid coupon is applied.

- Handle validation errors:
  Verify that errors during order validation are handled correctly.

- Handle coupon validation errors:
  Verify that errors during coupon validation are handled correctly.

###  Payment Service Test Cases

- Verify that all payment methods are returned if totalPrice <= 300000.

- Verify that the AUPAY payment method is excluded if totalPrice > 300000.

- Verify that both PAYPAY and AUPAY are excluded if totalPrice > 500000.

- Verify correct behavior when totalPrice = 0, returning all payment methods.

- Verify correct behavior when totalPrice < 0, returning all payment methods.

- Verify that the payment link is opened in a new tab when processing a payment via link.

- Verify handling when totalPrice is an invalid value (e.g., null, undefined, or a non-number).

- Verify that payViaLink correctly handles cases when the order is invalid (e.g., missing an id or totalPrice).

- Verify that buildPaymentMethod works correctly if the list of payment methods changes (e.g., adding or removing a payment method).

## Coverage Result
<img width="1676" alt="Screenshot 2025-04-04 at 13 03 54" src="https://github.com/user-attachments/assets/e1a287a4-575a-438f-9010-ba4ace344dfa" />

