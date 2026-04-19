import { promotionAPI } from './api';

class PromotionService {
    /**
     * Creates a new promotion via Backend API.
     * @param {Object} data 
     */
    async createPromotion(data) {
        // Validation handled on both sides for UX and Security
        this._validatePromotion(data);

        const payload = {
            name: data.name,
            discountType: data.type.toUpperCase(), // Match backend enum
            value: Number(data.value),
            startDate: data.startDate,
            endDate: data.endDate,
            usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
            scope: data.scope || 'all',
            createdBy: data.createdBy || 'SELLER', // Allow override for ADMIN
            sellerId: data.sellerId, // @review: Ensure sellerId is passed to backend
            usageType: data.usageType || 'MULTI_USE',
            validMonth: data.validMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        };

        const res = await promotionAPI.createPromotion(payload);
        return res.data;
    }

    /**
     * Lists ALL promotions for buyer checkout (includes admin + seller + welcome).
     */
    async getAllPromotions(userId = null, sellerIds = []) {
        const res = await promotionAPI.getAvailablePromotions(userId, sellerIds);
        return res.data;
    }

    /**
     * Lists ONLY the current seller's own promotions.
     * Used by the Seller Dashboard — will NOT include admin promotions.
     */
    async getSellerPromotions() {
        const res = await promotionAPI.getSellerPromotions();
        return res.data;
    }

    /**
     * Lists all admin-created promotions.
     * Used by the Admin Dashboard.
     */
    async getAdminPromotions() {
        const res = await promotionAPI.getAdminPromotions();
        return res.data;
    }

    /**
     * Deletes a promotion via Backend API.
     */
    async deletePromotion(id) {
        await promotionAPI.deletePromotion(id);
    }

    /**
     * Applies a promotion and returns calculated discount via Backend API.
     */
    async applyPromotion(promotionId, userId, subtotal) {
        const res = await promotionAPI.applyPromotion(promotionId, userId, subtotal);
        return res.data;
    }

    _validatePromotion(data) {
        if (!data.name || !data.type || data.value === undefined || !data.startDate || !data.endDate) {
            throw new Error('Missing required promotion fields');
        }
        if (data.value <= 0) {
            throw new Error('Discount value must be greater than 0');
        }
        if (data.type === 'percentage' && data.value > 100) {
            throw new Error('Percentage discount cannot exceed 100%');
        }
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        if (end <= start) {
            throw new Error('End date must be after start date');
        }
    }
}

export const promotionService = new PromotionService();
export default PromotionService;
