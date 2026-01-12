const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Batch = require('../models/Batch');
const Medicine = require('../models/Medicine');
const { getBatchStatus } = require('../utils/alertCalculator');

// @desc    Sell medicine (FIFO stock deduction)
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
    const { medicineId, quantity } = req.body;

    if (!medicineId || !quantity || quantity <= 0) {
        res.status(400);
        throw new Error('Please provide valid medicine ID and quantity');
    }

    // 1. Fetch all batches for the medicine, sorted by expiry date (FIFO)
    // Only fetch batches that are not expired and have stock > 0
    const batches = await Batch.find({
        medicineId,
        stock: { $gt: 0 },
        expiryDate: { $gt: new Date() } // Prevent selling expired batches
    }).sort({ expiryDate: 1 });

    // 2. Calculate total available stock
    const totalStock = batches.reduce((acc, batch) => acc + batch.stock, 0);

    if (totalStock < quantity) {
        res.status(400);
        throw new Error(`Insufficient stock. Available: ${totalStock}, Requested: ${quantity}`);
    }

    let remainingQuantity = quantity;
    const saleItems = [];

    try {
        // 3. FIFO Logic: Iterate batches and deduct stock
        for (const batch of batches) {
            if (remainingQuantity <= 0) break;

            // SAFETY CHECK: Prevent sale of expired items
            // Double check expiry dynamically even if query filtered it
            if (getBatchStatus(batch.expiryDate) === 'EXPIRED' || batch.isLocked) {
                console.warn(`Attempted sale of expired/locked batch: ${batch.batchNumber}`);
                continue; // Skip this batch
            }

            let deductAmount = 0;

            if (batch.stock >= remainingQuantity) {
                console.log(`[DEBUG] Batch ${batch.batchNumber}: Stock ${batch.stock} >= Requested ${remainingQuantity}. Deducting full amount.`);
                // This batch can fulfill the remaining order
                deductAmount = remainingQuantity;
                batch.stock -= deductAmount;
                remainingQuantity = 0;
            } else {
                console.log(`[DEBUG] Batch ${batch.batchNumber}: Stock ${batch.stock} < Requested ${remainingQuantity}. Emptying batch.`);
                // Take everything from this batch and continue to next
                deductAmount = batch.stock;
                batch.stock = 0; // Empty the batch
                remainingQuantity -= deductAmount;
            }

            if (batch.stock === 0) {
                console.log(`[DEBUG] Batch ${batch.batchNumber} is empty. Deleting...`);
                await Batch.deleteOne({ _id: batch._id });

                // Check if any other batches exist for this medicine
                const remainingBatches = await Batch.countDocuments({ medicineId: batch.medicineId });
                if (remainingBatches === 0) {
                    console.log(`[DEBUG] No batches remaining for medicine ${batch.medicineId}. Deleting medicine...`);
                    await Medicine.findByIdAndDelete(batch.medicineId);
                }
            } else {
                console.log(`[DEBUG] Saving Batch ${batch.batchNumber}. New Stock: ${batch.stock}`);
                // Save batch updates sequentially
                await batch.save();
            }

            // Note: cachedStatus is managed by Scheduler, not Sales logic
            // We do NOT update status to 'Low Stock' here to avoid conflict with Expiry Status

            console.log(`[DEBUG] Saving Batch ${batch.batchNumber}. New Stock: ${batch.stock}`);
            // Save batch updates sequentially
            await batch.save();

            saleItems.push({
                batchId: batch._id,
                batchNumber: batch.batchNumber,
                quantity: deductAmount
            });
        }

        // 4. Create Sale Record
        const sale = await Sale.create({
            medicineId,
            items: saleItems,
            totalQuantity: quantity,
            soldBy: req.user._id
        });

        res.status(201).json(sale);

    } catch (error) {
        res.status(500);
        throw new Error('Sale failed: ' + error.message);
    }
});

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
    const sales = await Sale.find()
        .populate('medicineId', 'name category')
        .populate('soldBy', 'name email')
        .sort({ saleDate: -1 });
    res.json(sales);
});

module.exports = {
    createSale,
    getSales
};
