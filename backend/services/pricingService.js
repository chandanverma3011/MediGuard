const { getBatchStatus } = require('../utils/alertCalculator');
const PRICING_RULES = require('../config/pricingRules');

/**
 * Pure function to calculate pricing recommendation.
 * Does NOT mutate data. Returns analysis object.
 * 
 * @param {Object} batch - Batch document
 * @returns {Object} Recommendation analysis
 */
const calculateBatchPricing = (batch) => {
    // 1. Initial Integrity Checks
    if (!batch || batch.costPrice === undefined || batch.mrp === undefined) {
        return {
            status: PRICING_RULES.STATUS.NOT_APPLICABLE,
            reason: 'Missing Cost Price or MRP data'
        };
    }

    const today = new Date();
    const expiry = new Date(batch.expiryDate);

    // Calculate difference in days (raw)
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 2. Expiry Check
    if (diffDays <= 0) {
        return {
            status: PRICING_RULES.STATUS.EXPIRED,
            reason: 'Batch is Expired. Cannot sell.',
            recommendation: null
        };
    }

    // 3. Window Check (10 to 15 days)
    // User Request: "applicable for expiring within 10 to 15 days"
    const inWindow = diffDays >= PRICING_RULES.DISCOUNT_WINDOW_END && diffDays <= PRICING_RULES.DISCOUNT_WINDOW_START;

    if (!inWindow) {
        return {
            status: PRICING_RULES.STATUS.SAFE,
            reason: `Days to expiry (${diffDays}) is outside 10-15 day window.`,
            originalMRP: batch.mrp,
            sellingPrice: batch.mrp
        };
    }

    // 4. Dynamic Margin Logic (Stock Based)
    // "set margin of that medicine according to stock but not more than 30%"
    let targetMarginPercent = PRICING_RULES.MARGIN_LOW_STOCK; // Default 30%
    if (batch.stock > PRICING_RULES.HIGH_STOCK_THRESHOLD) {
        targetMarginPercent = PRICING_RULES.MARGIN_HIGH_STOCK; // Drop to 15% for clearance
    }

    // 5. Calculate Recommended Price (Cost Plus)
    // Price = Cost + (Cost * Margin)
    const marginAmount = batch.costPrice * targetMarginPercent;
    let recommendedPrice = batch.costPrice + marginAmount;

    // 6. Sanity Checks
    // Ensure we don't exceed MRP (if Cost + Margin > MRP, something is weird, but we stick to MRP)
    if (recommendedPrice > batch.mrp) {
        recommendedPrice = batch.mrp;
    }

    // Ensure we don't go below Cost (Cost-Plus logic guarantees this, but good to be safe)
    if (recommendedPrice < batch.costPrice) {
        recommendedPrice = batch.costPrice; // Break-even floor
    }

    const discountAmount = batch.mrp - recommendedPrice;
    const discountPercent = Math.round((discountAmount / batch.mrp) * 100);

    return {
        status: PRICING_RULES.STATUS.DISCOUNT_RECOMMENDED,
        originalMRP: batch.mrp,
        costPrice: batch.costPrice,
        recommendedPrice: Math.round(recommendedPrice),
        effectiveDiscountPercent: discountPercent,
        projectedMarginPercent: Math.round(targetMarginPercent * 100),
        reason: `Expiring in ${diffDays} days. Stock is ${batch.stock} (Target Margin: ${targetMarginPercent * 100}%).`
    };
};

module.exports = { calculateBatchPricing };
