const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const Batch = require('../models/Batch');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
    const totalMedicines = await Medicine.countDocuments();
    const totalBatches = await Batch.countDocuments();

    // Low Stock (Independent check)
    const lowStock = await Batch.countDocuments({ stock: { $lt: 50 } });

    // Dynamic Aggregation for Expiry Alerts (Source of truth is Date, not status field)
    const now = new Date();

    const alertStats = await Batch.aggregate([
        {
            $project: {
                daysRemaining: {
                    $divide: [
                        { $subtract: ["$expiryDate", now] },
                        1000 * 60 * 60 * 24
                    ]
                }
            }
        },
        {
            $bucket: {
                groupBy: "$daysRemaining",
                boundaries: [-Infinity, 0, 8, 16, 31, Infinity],
                default: "SAFE",
                output: {
                    count: { $sum: 1 }
                }
            }
        }
    ]);

    // Map bucket results to readable keys
    // Boundaries: 
    // < 0: Expired
    // 0 - 7: Critical
    // 8 - 15: Urgent
    // 16 - 30: Warning
    // > 30: Safe

    const statsMap = {};
    alertStats.forEach(bucket => {
        let key = 'SAFE';
        if (bucket._id === -Infinity) key = 'EXPIRED';
        else if (bucket._id === 0) key = 'CRITICAL';
        else if (bucket._id === 8) key = 'URGENT';
        else if (bucket._id === 16) key = 'WARNING';

        statsMap[key] = bucket.count;
    });

    res.json({
        totalMedicines,
        totalBatches,
        lowStock,
        expiringSoon: (statsMap.CRITICAL || 0) + (statsMap.URGENT || 0) + (statsMap.WARNING || 0), // Aggregate "Soon"
        alertBreakdown: statsMap
    });
}));

module.exports = router;
