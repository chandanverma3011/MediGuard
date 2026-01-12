const { ALERT_LEVELS, ALERT_THRESHOLDS } = require('../constants/alertLevels');

/**
 * Calculates the current alert status of a batch based on expiry date.
 * 
 * Logic:
 * - Calculate difference in days between now and expiry date.
 * - Map days remaining to ALERT_LEVELS.
 * - "Days remaining" is rounded down (Math.floor).
 * 
 * @param {Date|string} expiryDate 
 * @returns {string} One of ALERT_LEVELS
 */
const getBatchStatus = (expiryDate) => {
    const now = new Date();
    // Reset time components to compare dates only (start of day)
    now.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    // Difference in time
    const diffTime = expiry - now;
    // Difference in days (ceil ensures that if it expires tomorrow at noon, it's 1 day left)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return ALERT_LEVELS.EXPIRED; // Already passed
    if (diffDays <= ALERT_THRESHOLDS.CRITICAL_DAYS) return ALERT_LEVELS.CRITICAL;
    if (diffDays <= ALERT_THRESHOLDS.URGENT_DAYS) return ALERT_LEVELS.URGENT;
    if (diffDays <= ALERT_THRESHOLDS.WARNING_DAYS) return ALERT_LEVELS.WARNING;

    return ALERT_LEVELS.SAFE;
};

/**
 * Validates if a transition is allowed.
 * Used to enforce "No Downgrades" rule in scheduler.
 * 
 * @param {string} oldStatus 
 * @param {string} newStatus 
 * @returns {boolean}
 */
const isTransitionAllowed = (oldStatus, newStatus) => {
    const severity = {
        [ALERT_LEVELS.SAFE]: 0,
        [ALERT_LEVELS.WARNING]: 1,
        [ALERT_LEVELS.URGENT]: 2,
        [ALERT_LEVELS.CRITICAL]: 3,
        [ALERT_LEVELS.EXPIRED]: 4
    };

    // Only allow moving to higher severity or same
    return severity[newStatus] >= severity[oldStatus];
};

module.exports = {
    getBatchStatus,
    isTransitionAllowed
};
