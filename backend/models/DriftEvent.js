const mongoose = require('mongoose');

const driftEventSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    driftType: {
        type: String,
        enum: ['SURGE', 'DROP'],
        required: true
    },
    percentChange: {
        type: Number,
        required: true
    },
    baselineAvg: {
        type: Number,
        required: true
    },
    currentAvg: {
        type: Number,
        required: true
    },
    detectedAt: {
        type: Date,
        default: Date.now,
        index: true // Index for efficient time-based queries
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate alerts for the same medicine on the same day if needed
driftEventSchema.index({ medicineId: 1, detectedAt: 1 });

module.exports = mongoose.model('DriftEvent', driftEventSchema);
