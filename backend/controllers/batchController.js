const asyncHandler = require('express-async-handler');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const { getBatchStatus } = require('../utils/expiryHelper');

// @desc    Get batches
// @route   GET /api/batches
// @access  Private
const getBatches = asyncHandler(async (req, res) => {
    // User Requirement: Hide batches with 0 stock unless they are Expired or Locked (Disposed)
    const batches = await Batch.find({
        $or: [
            { stock: { $gt: 0 } },
            { cachedStatus: 'EXPIRED' },
            { isLocked: true }
        ]
    }).populate('medicineId');

    res.status(200).json(batches);
});

// @desc    Add batch
// @route   POST /api/batches
// @access  Private
const addBatch = asyncHandler(async (req, res) => {
    const { batchNumber, medicineId, expiryDate, stock, costPrice, mrp } = req.body;

    if (!batchNumber || !medicineId || !expiryDate || stock === undefined) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    const cachedStatus = getBatchStatus(expiryDate);

    const batch = await Batch.create({
        batchNumber,
        medicineId,
        expiryDate,
        stock,
        costPrice: costPrice || 0,
        mrp: mrp || 0,
        cachedStatus
    });

    res.status(200).json(batch);
});

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private
const updateBatch = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    // If expiry is updated, recalculate status
    if (req.body.expiryDate) {
        req.body.cachedStatus = getBatchStatus(req.body.expiryDate);
    } else if (req.body.stock !== undefined) {
        // Stock update doesn't affect Expiry Status anymore (progressive expiry alert only)
    }

    const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    }).populate('medicineId');

    if (updatedBatch && updatedBatch.stock <= 0) {
        // User Requirement: "dont remove expired one remove stock with 0 only"
        // Only delete if it's SAFE (Active) and not Locked/Disposed
        const isExpired = updatedBatch.cachedStatus === 'EXPIRED';
        const isLocked = updatedBatch.isLocked;

        if (!isExpired && !isLocked) {
            const medicineId = updatedBatch.medicineId._id; // populated
            await updatedBatch.deleteOne();

            const remainingBatches = await Batch.countDocuments({ medicineId });
            if (remainingBatches === 0) {
                await Medicine.findByIdAndDelete(medicineId);
                return res.status(200).json({ message: 'Batch and Medicine removed (stock 0)', _id: req.params.id });
            }
            return res.status(200).json({ message: 'Batch removed (stock 0)', _id: req.params.id });
        }
    }

    res.status(200).json(updatedBatch);
});

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private
const deleteBatch = asyncHandler(async (req, res) => {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
        res.status(404);
        throw new Error('Batch not found');
    }

    const medicineId = batch.medicineId;
    await batch.deleteOne();

    const remainingBatches = await Batch.countDocuments({ medicineId });
    if (remainingBatches === 0) {
        await Medicine.findByIdAndDelete(medicineId);
    }

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getBatches,
    addBatch,
    updateBatch,
    deleteBatch,
};
