export const ALERT_LEVELS = {
    SAFE: 'SAFE',
    WARNING: 'WARNING',
    URGENT: 'URGENT',
    CRITICAL: 'CRITICAL',
    EXPIRED: 'EXPIRED'
};

export const getAlertColor = (status) => {
    switch (status) {
        case ALERT_LEVELS.SAFE:
            return 'badge-safe';
        case ALERT_LEVELS.WARNING:
            return 'badge-warning';
        case ALERT_LEVELS.URGENT:
            return 'badge-urgent';
        case ALERT_LEVELS.CRITICAL:
            return 'badge-critical';
        case ALERT_LEVELS.EXPIRED:
            return 'badge-expired';
        default:
            return 'badge-safe';
    }
};

export const getAlertLabel = (status) => {
    if (status === ALERT_LEVELS.SAFE) return 'Safe';
    if (status === ALERT_LEVELS.WARNING) return 'Expiring Soon (Warning)';
    if (status === ALERT_LEVELS.URGENT) return 'Expiring Soon (Urgent)';
    if (status === ALERT_LEVELS.CRITICAL) return 'Critical Expiry';
    if (status === ALERT_LEVELS.EXPIRED) return 'Expired';
    return status;
};
