const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Batch = require('../models/Batch');
const Disposal = require('../models/Disposal');
const { getBatchStatus } = require('../utils/alertCalculator');

// @desc    Dispose of an expired batch (Admin only)
// @route   POST /api/disposals
// @access  Private/Admin
const disposeBatch = asyncHandler(async (req, res) => {
    const { batchId, reason, method } = req.body;

    if (!batchId || !reason || !method) {
        res.status(400);
        throw new Error('Please provide batch ID, reason, and method');
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const batch = await Batch.findById(batchId).session(session);

        if (!batch) {
            res.status(404);
            throw new Error('Batch not found');
        }

        // 1. Validation: Prevent accidental re-disposal
        if (batch.cachedStatus === 'DISPOSED') {
            res.status(400);
            throw new Error('Batch is already disposed');
        }

        // 2. Validation: Ensure batch is actually expired (Backend Source of Truth)
        // We do NOT rely on cachedStatus here. We re-calculate.
        const currentStatus = getBatchStatus(batch.expiryDate);
        if (currentStatus !== 'EXPIRED' && currentStatus !== 'CRITICAL') {
            // Note: Allowing CRITICAL for proactive disposal if needed, 
            // but strict requirement says "Only EXPIRED". Let's stick to strict requirement.
            if (currentStatus !== 'EXPIRED') {
                res.status(400);
                throw new Error('Compliance Violation: Only EXPIRED batches can be disposed.');
            }
        }

        // 3. Create Audit Record
        const disposal = await Disposal.create([{
            batchId: batch._id,
            medicineId: batch.medicineId,
            batchNumber: batch.batchNumber,
            quantityDisposed: batch.stock, // Snapshot of stock at time of disposal
            reason,
            method,
            approvedBy: req.user._id
        }], { session });

        // 4. Update Batch State (Immutable Locking)
        batch.stock = 0; // Remove from inventory
        batch.cachedStatus = 'DISPOSED';
        batch.isLocked = true; // Permanently lock
        batch.disposalId = disposal[0]._id;

        await batch.save({ session });

        await session.commitTransaction();
        res.status(201).json(disposal[0]);

    } catch (error) {
        await session.abortTransaction();
        console.error(`Disposal Failed for Batch ${batchId}:`, error);
        res.status(error.statusCode || 500);
        throw error;
    } finally {
        session.endSession();
    }
});

// @desc    Get disposal audit log
// @route   GET /api/disposals
// @access  Private/Admin
const getDisposalHistory = asyncHandler(async (req, res) => {
    const history = await Disposal.find({})
        .populate('medicineId', 'name')
        .populate('approvedBy', 'name email')
        .sort({ disposedAt: -1 });

    res.json(history);
});

module.exports = {
    disposeBatch,
    getDisposalHistory
};
