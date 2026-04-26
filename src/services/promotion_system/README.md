# 🏷️ Discount Promotion System

A high-performance, production-ready promotion engine built for scalable e-commerce platforms.

## 🚀 Overview
This system handles the complete lifecycle of discount promotions, from seller creation to buyer checkout. It features a smart selection engine that automatically applies the most beneficial discount for the customer.

## 📁 Core Components
- **`promotion_service.js`**: Core API handling CRUD operations, business rule validation, and usage tracking.
- **`checkout_integration.js`**: Calculation engine that finds the "Best Match" promotion for a given cart.
- **`test_promotion.test.js`**: Comprehensive test suite covering all Scenarios and edge cases.

## 📋 Business Rules
- **Scenario 1 (Creation)**: Validates values (>0), types (percentage ≤ 100), and date integrity.
- **Scenario 2 (Application)**: Auto-selects the promotion yielding highest savings. Enforces usage limits.
- **Scenario 3 (Expiration)**: Automatically filters out promotions where `endDate < currentTime`.

## 🧪 Running Tests
The tests are written in standard Node.js with a built-in `describe/it` harness for ease of review.

```bash
node src/services/promotion_system/test_promotion.test.js
```

## 🛠️ Reviewer Notes (@review)
- **Memory Efficiency**: Used `Map` for constant-time lookups.
- **Defensive Design**: Validation is centralized in a private `_validatePromotion` method to prevent "Garbage In, Garbage Out".
- **Calculated Savings**: All discounts are normalized to a `savings` currency value to allow fair comparison between percentage and fixed types.
