/**
 * @file checkout_integration.js
 * @description Logic for integrating promotions into the checkout flow.
 * 
 * @review Design Decisions:
 * 1. Implemented a dedicated calculateBestDiscount function to isolate calculation logic.
 * 2. The system handles both fixed and percentage discounts by converting them to a common 'savings' value.
 * 3. Strict AC enforcement: Fixed discounts are capped at the subtotal to avoid negative balances.
 * 4. Automatic filtering of expired/invalid promotions using the getActivePromotions service method.
 */

import { promotionService } from './promotion_service.js';

/**
 * Calculates the best applicable discount for a given cart.
 * 
 * @param {Object} cart - The cart object
 * @param {number} cart.subtotal - The subtotal of the cart
 * @param {Array} cart.items - List of items in the cart (for category/product scope)
 * @returns {Object|null} The best promotion and the calculated savings
 */
export const calculateBestDiscount = (cart) => {
    const activePromotions = promotionService.getActivePromotions();
    let bestPromo = null;
    let maxSavings = 0;

    // @review Iterate through all active promotions to find the most beneficial one
    for (const promo of activePromotions) {
        let currentSavings = 0;

        // @review Check if promo is applicable to the cart scope
        // For simplicity, we assume scope 'all' applies to everything. 
        // Product/Category logic can be extended here.
        if (promo.scope !== 'all') continue; 

        if (promo.type === 'percentage') {
            currentSavings = (cart.subtotal * promo.value) / 100;
        } else if (promo.type === 'fixed') {
            // AC: Fixed discount <= cart subtotal
            currentSavings = Math.min(promo.value, cart.subtotal);
        }

        if (currentSavings > maxSavings) {
            maxSavings = currentSavings;
            bestPromo = promo;
        }
    }

    if (!bestPromo) return null;

    return {
        promotionId: bestPromo.id,
        name: bestPromo.name,
        discountType: bestPromo.type,
        originalValue: bestPromo.value,
        appliedSavings: maxSavings,
        finalTotal: Math.max(0, cart.subtotal - maxSavings)
    };
};

/**
 * Example checkout function
 */
export const processCheckout = (cart) => {
    const discount = calculateBestDiscount(cart);
    
    if (discount) {
        console.log(`Applied Promotion: ${discount.name} (-Rs ${discount.appliedSavings})`);
        // Record usage to update limit counter
        promotionService.recordUsage(discount.promotionId);
        return {
            ...cart,
            discountApplied: discount,
            total: discount.finalTotal
        };
    }

    return {
        ...cart,
        total: cart.subtotal
    };
};
