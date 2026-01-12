const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    batchNumber: {
        type: String,
        required: true
    },
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        required: true,
        default: 0 // Default 0 for existing records to avoid migration fail
    },
    mrp: {
        type: Number,
        required: true,
        default: 0
    },
    cachedStatus: {
        type: String,
        enum: ['SAFE', 'WARNING', 'URGENT', 'CRITICAL', 'EXPIRED', 'DISPOSED'],
        default: 'SAFE'
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    disposalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disposal'
    }
});

module.exports = mongoose.model('Batch', batchSchema);
