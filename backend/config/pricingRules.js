/**
 * CENTRALIZED PRICING CONFIGURATION
 * Strict audit-only rules for internal pricing recommendations.
 */

const PRICING_RULES = {
    // Window in days before expiry where discounts are considered
    // User Requirement: "applicable for expiring within 10 to 15 days"
    DISCOUNT_WINDOW_START: 15,
    DISCOUNT_WINDOW_END: 10,

    // Stock Thresholds for Dynamic Margin
    // If Stock > HIGH_STOCK_THRESHOLD, we use LOWER margin (Clearance)
    HIGH_STOCK_THRESHOLD: 50,

    // Dynamic Margins (Cost-Plus Targets)
    // "Not more than 30%"
    MARGIN_LOW_STOCK: 0.30,  // 30% Margin if we have few items
    MARGIN_HIGH_STOCK: 0.15, // 15% Margin if we have many items (Clearance)

    // Status Enums for Output
    STATUS: {
        SAFE: 'SAFE',
        DISCOUNT_RECOMMENDED: 'DISCOUNT_RECOMMENDED',
        MARGIN_PROTECTED: 'MARGIN_PROTECTED',
        NOT_APPLICABLE: 'NOT_APPLICABLE',
        EXPIRED: 'EXPIRED'
    }
};

module.exports = PRICING_RULES;
