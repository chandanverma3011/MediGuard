const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['EXPIRY', 'low_stock'],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Batch',
            required: false, // Optional, in case we have generic notifications later
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Notification', notificationSchema);
