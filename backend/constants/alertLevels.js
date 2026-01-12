/**
 * Constants for Progressive Alert Escalation
 * Central source of truth for alert levels and thresholds.
 */

const ALERT_LEVELS = {
    SAFE: 'SAFE',           // > 30 days
    WARNING: 'WARNING',     // 16-30 days
    URGENT: 'URGENT',       // 8-15 days
    CRITICAL: 'CRITICAL',   // <= 7 days
    EXPIRED: 'EXPIRED'      // Date passed
};

const ALERT_THRESHOLDS = {
    WARNING_DAYS: 30,
    URGENT_DAYS: 15,
    CRITICAL_DAYS: 7
};

module.exports = {
    ALERT_LEVELS,
    ALERT_THRESHOLDS
};
