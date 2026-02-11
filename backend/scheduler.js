const cron = require('node-cron');
const Batch = require('./models/Batch');
const Medicine = require('./models/Medicine'); // Required for populate
const Notification = require('./models/Notification');
const { getBatchStatus, isTransitionAllowed } = require('./utils/alertCalculator');
const { ALERT_LEVELS } = require('./constants/alertLevels');
const AlertHistory = require('./models/AlertHistory');

const checkInventory = async () => {
    console.log('Running Progressive Inventory Check...');
    try {
        // Fetch all batches
        const batches = await Batch.find({ cachedStatus: { $ne: 'DISPOSED' } }).populate('medicineId');

        for (const batch of batches) {
            // 1. Calculate Dynamic Status (Source of Truth)
            const calculatedStatus = getBatchStatus(batch.expiryDate);
            const oldStatus = batch.cachedStatus || 'SAFE'; // Default fallback

            // 2. Check for Transition
            if (calculatedStatus !== oldStatus) {

                // 3. Enforce "No Downgrade" Rule
                if (isTransitionAllowed(oldStatus, calculatedStatus)) {
                    console.log(`Alert Escalation: Batch ${batch.batchNumber} | ${oldStatus} -> ${calculatedStatus}`);

                    // 4. Update Batch
                    batch.cachedStatus = calculatedStatus;

                    // 5. Handle Expiry Locking
                    if (calculatedStatus === ALERT_LEVELS.EXPIRED) {
                        batch.isLocked = true;
                        console.log(`LOCKED Batch ${batch.batchNumber} due to expiry.`);
                    }

                    // 6. Audit Log
                    await AlertHistory.create({
                        batchId: batch._id,
                        previousStatus: oldStatus,
                        newStatus: calculatedStatus,
                        reason: "Automatic Escalation System"
                    });

                    await batch.save();

                    // 7. Send Notifications (Only for significant escalations: URGENT, CRITICAL, EXPIRED)
                    if ([ALERT_LEVELS.URGENT, ALERT_LEVELS.CRITICAL, ALERT_LEVELS.EXPIRED].includes(calculatedStatus)) {
                        await createNotification(batch, calculatedStatus);
                    }

                } else {
                    console.warn(`Skipping invalid transition: Batch ${batch.batchNumber} tried ${oldStatus} -> ${calculatedStatus}`);
                }
            }
        }
    } catch (error) {
        console.error('Error in Inventory Check Job:', error.message);
    }
};

const createNotification = async (batch, status) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Deduplicate: Don't spam same alert on same day
        const exists = await Notification.findOne({
            batchId: batch._id,
            type: 'EXPIRY_ESCALATION',
            createdAt: { $gte: startOfDay }
        });

        if (!exists) {
            await Notification.create({
                type: 'EXPIRY_ESCALATION',
                message: `ALERT ESCALATION: Batch ${batch.batchNumber} of ${batch.medicineId ? batch.medicineId.name : 'Unknown Medicine'} is now ${status}`,
                batchId: batch._id,
                isRead: false
            });
        }
    } catch (err) {
        console.error("Failed to create notification", err);
    }
}

// Schedule task to run every day at midnight (0 0 * * *)
const startScheduler = () => {
    // Run once on startup
    checkInventory();

    // Progressive Alert Check: Every 6 hours
    cron.schedule('0 */6 * * *', checkInventory);

    // Demand Drift Analysis: Run Daily at 2 AM (Low traffic)
    // Runs 'detectDemandDrift()' to analyze consumption trends
    cron.schedule('0 2 * * *', () => {
        const { detectDemandDrift } = require('./utils/driftAnalysis');
        detectDemandDrift();
    });
};

module.exports = { startScheduler, checkInventory };
