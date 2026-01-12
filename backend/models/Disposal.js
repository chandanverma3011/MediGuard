const mongoose = require('mongoose');

const disposalSchema = new mongoose.Schema({
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    batchNumber: {
        type: String,
        required: true
    },
    quantityDisposed: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    method: {
        type: String,
        enum: ['INCINERATION', 'RETURN_TO_SUPPLIER', 'OTHER'],
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Must be an Admin
        required: true
    },
    disposedAt: {
        type: Date,
        default: Date.now,
        immutable: true // Compliance: Disposal timestamp cannot be changed
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Disposal', disposalSchema);
