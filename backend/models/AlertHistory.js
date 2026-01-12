const mongoose = require('mongoose');

const alertHistorySchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    previousStatus: {
        type: String,
        required: true
    },
    newStatus: {
        type: String,
        required: true
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String, // e.g., "Automatic Escalation", "Manual Override" (if ever allowed)
        default: "Automatic Escalation"
    }
});

module.exports = mongoose.model('AlertHistory', alertHistorySchema);
