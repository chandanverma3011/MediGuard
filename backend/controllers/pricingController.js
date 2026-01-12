const asyncHandler = require('express-async-handler');
const Batch = require('../models/Batch');
const { calculateBatchPricing } = require('../services/pricingService');

// @desc    Get pricing recommendations for all batches
// @route   GET /api/pricing/recommendations
// @access  Private/Admin (Internal Audit Use Only)
const getPricingRecommendations = asyncHandler(async (req, res) => {
    // 1. Fetch all batches with medicine details
    const batches = await Batch.find({}).populate('medicineId', 'name');

    // 2. Map through service logic
    const recommendations = batches.map(batch => {
        const pricingAnalysis = calculateBatchPricing(batch);

        return {
            batchId: batch._id,
            batchNumber: batch.batchNumber,
            medicineName: batch.medicineId?.name || 'Unknown',
            expiryDate: batch.expiryDate,
            stock: batch.stock,
            ...pricingAnalysis
        };
    });

    // 3. Optional: Filter for only interesting records (DISCOUNT_RECOMMENDED or STATUS changes)
    // For now, return all so standard audit sees everything.
    res.json(recommendations);
});

// @desc    Get pricing recommendation for a specific batch
// @route   GET /api/pricing/recommendations/:id
// @access  Private/Admin
const getBatchPricing = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id).populate('medicineId', 'name');

    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    const pricingAnalysis = calculateBatchPricing(batch);

    res.json({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        medicineName: batch.medicineId?.name || 'Unknown',
        expiryDate: batch.expiryDate,
        stock: batch.stock,
        ...pricingAnalysis
    });
});

module.exports = {
    getPricingRecommendations,
    getBatchPricing
};
