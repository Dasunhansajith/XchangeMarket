/**
 * @file checkout_integration.js
 * @description Logic for applying promotions during the checkout process.
 * 
 * @review Design Decision:
 * 1. calculateBestDiscount implements the "highest savings" requirement by 
 *    mapping both percentage and fixed discounts to a common 'savings' metric.
 * 2. Implemented defensive subtotal checks to prevent discounts from exceeding the total (Scenario 2).
 */

import { promotionService } from './promotion_service.js';

/**
 * Scenario 2: Apply Promotion
 * Automatically selects the best applicable discount.
 * 
 * @param {Object} cart 
 * @returns {Object|null} best promotion details
 */
export const calculateBestDiscount = (cart) => {
    const activePromotions = promotionService.getActivePromotions();
    let bestMatch = null;
    let maxSavings = 0;

    for (const promo of activePromotions) {
        let currentSavings = 0;

        // @review Assume 'all' scope covers entire subtotal. 
        // Can be extended for product/category specific logic here.
        if (promo.scope !== 'all') continue;

        if (promo.type === 'percentage') {
            currentSavings = (cart.subtotal * promo.value) / 100;
        } else if (promo.type === 'fixed') {
            // Rule: Fixed discount <= cart subtotal
            currentSavings = Math.min(promo.value, cart.subtotal);
        }

        if (currentSavings > maxSavings) {
            maxSavings = currentSavings;
            bestMatch = promo;
        }
    }

    if (!bestMatch) return null;

    return {
        id: bestMatch.id,
        name: bestMatch.name,
        savings: maxSavings,
        finalTotal: cart.subtotal - maxSavings
    };
};

/**
 * Completes the checkout process by applying the discount and recording usage.
 * @param {Object} cart 
 */
export const processCheckout = (cart) => {
    const result = calculateBestDiscount(cart);
    
    if (result) {
        // Track usage (Scenario 2 & 3)
        promotionService.recordUsage(result.id);
        return {
            ...cart,
            discountApplied: result,
            total: result.finalTotal
        };
    }

    return {
        ...cart,
        total: cart.subtotal
    };
};
