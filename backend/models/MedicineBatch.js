const mongoose = require('mongoose');

const medicineBatchSchema = mongoose.Schema(
    {
        batchNumber: {
            type: String,
            required: [true, 'Please add a batch number'],
            unique: true,
        },
        expiryDate: {
            type: Date,
            required: [true, 'Please add an expiry date'],
        },
        stock: {
            type: Number,
            required: [true, 'Please add stock quantity'],
        },
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Medicine',
        },
        status: {
            type: String,
            enum: ['Ok', 'Low Stock', 'Expiring Soon', 'Expired'],
            default: 'Ok',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('MedicineBatch', medicineBatchSchema);
