const mongoose = require('mongoose');

const medicineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
        },
        manufacturer: {
            type: String,
            required: [true, 'Please add a manufacturer'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Medicine', medicineSchema);
