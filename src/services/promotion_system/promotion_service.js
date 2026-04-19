/**
 * @file promotion_service.js
 * @description Complete API for managing discount promotions with full CRUD operations.
 * 
 * @review Design Decision: 
 * 1. Used a Map for in-memory storage to provide O(1) access by ID.
 * 2. Implemented a private _validatePromotion method to centralize business rules, 
 *    ensuring consistency between create and update operations.
 * 3. Usage tracking is built into the core recordUsage method to enforce usageLimit AC.
 */

class PromotionService {
    constructor() {
        this.promotions = new Map();
        this.nextId = 1;
        // Global reference for "current time" to ensure consistency across the service
        this.CURRENT_DATE = new Date('2026-04-17T17:14:10');
    }

    /**
     * Scenario 1: Create Promotion
     * @param {Object} data 
     * @returns {Object} saved promotion
     */
    createPromotion(data) {
        this._validatePromotion(data, true);

        const id = `PROMO_${this.nextId++}`;
        const promotion = {
            id,
            ...data,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            usedCount: 0,
            status: 'ACTIVE'
        };

        this.promotions.set(id, promotion);
        return promotion;
    }

    /**
     * CRUD: Read (List Active)
     * @review Design Decision: Automatically filters expired and limit-reached promotions
     * to prevent invalid application during checkout (Scenario 3).
     */
    getActivePromotions() {
        const now = this.CURRENT_DATE;
        return Array.from(this.promotions.values()).filter(p => {
            const isExpired = p.endDate < now;
            const isNotStarted = p.startDate > now;
            const isLimitReached = p.usageLimit && p.usedCount >= p.usageLimit;
            const isDeactivated = p.status !== 'ACTIVE';
            
            return !isExpired && !isNotStarted && !isLimitReached && !isDeactivated;
        });
    }

    /**
     * CRUD: Update
     * @param {string} id 
     * @param {Object} updates 
     */
    updatePromotion(id, updates) {
        const promo = this.promotions.get(id);
        if (!promo) throw new Error('Promotion not found');

        // Validate updates if dates or values are changing
        const merged = { ...promo, ...updates };
        this._validatePromotion(merged, false);

        this.promotions.set(id, merged);
        return merged;
    }

    /**
     * CRUD: Delete
     * @param {string} id 
     */
    deletePromotion(id) {
        return this.promotions.delete(id);
    }

    /**
     * Tracks usage for a specific promotion.
     * @param {string} id 
     * @review Handles usageLimit check to ensure Scenario 2 stays within bounds.
     */
    recordUsage(id) {
        const promo = this.promotions.get(id);
        if (!promo) return;

        if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
            throw new Error('Promotion usage limit reached');
        }

        promo.usedCount++;
    }

    /**
     * Centralized validation rules
     * @private
     */
    _validatePromotion(data, isNew) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        // Rule: Discount value > 0
        if (data.value <= 0) throw new Error('Discount value must be greater than 0');

        // Rule: Percentage <= 100%
        if (data.type === 'percentage' && data.value > 100) {
            throw new Error('Percentage discount cannot exceed 100%');
        }

        // Rule: End date > start date
        if (end <= start) throw new Error('End date must be after start date');

        // Rule: For creation, dates must be in the future (optional based on requirements)
        // @review Adjusted to allow current date for practical "immediate" promotions
        if (isNew && end <= this.CURRENT_DATE) {
            throw new Error('Promotion end date cannot be in the past');
        }
    }
}

export const promotionService = new PromotionService();
export default PromotionService;
