const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    items: [{
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: true
        },
        batchNumber: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    totalQuantity: {
        type: Number,
        required: true
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    saleDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sale', saleSchema);
