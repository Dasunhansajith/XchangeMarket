# Discount Promotion System

A production-grade promotion engine for an e-commerce platform, implemented as a modular service.

## Features
- **Promotion Management**: Create and validate promotions with support for percentage/fixed discounts, date ranges, and usage limits.
- **Smart Checkout**: Automatically identifies and applies the "Best Discount" (highest savings) from available active promotions.
- **Strict Validation**: Enforces business rules for discount values, dates, and caps fixed discounts at the cart subtotal.

## File Structure
- `promotion_service.js`: The core engine handling state and validation.
- `checkout_integration.js`: Integration logic for the checkout process.
- `test_promotion.js`: Comprehensive test suite.

## Validation Rules
1. **Value**: Must be > 0.
2. **Dates**: End Date > Start Date > Current Date (set to 2026-04-17).
3. **Percentage**: Capped at 100%.
4. **Checkout**: Fixed discounts cannot exceed the cart subtotal.
5. **Expiration**: Expired promotions are automatically excluded from checkout.

## How to Run Tests
The system is written in modern JavaScript (ES Modules). You can run the tests directly using Node.js:

```bash
node test_promotion.js
```

## Reviewer Notes
- **Defensive Coding**: The service uses JSDoc for type safety and throws descriptive errors for validation failures.
- **Design Decisions**: 
    - Used a `Map` for O(1) lookups of promotions.
    - Used an internal `getActivePromotions` filter to ensure checkout logic only ever sees valid, current promotions.
    - Separated calculation logic from state management for better testability.
