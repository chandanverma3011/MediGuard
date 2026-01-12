const Sale = require('../models/Sale');
const DriftEvent = require('../models/DriftEvent');
const Medicine = require('../models/Medicine');

/**
 * Detects abnormal changes in medicine consumption trends.
 * 
 * Logic:
 * 1. BASELINE: Average daily sales from [Days -21 to -8] (Typical demand)
 * 2. CURRENT: Average daily sales from [Days -7 to Now] (Recent demand)
 * 3. COMPARE: If percent difference > 25% => ALERT
 * 
 * This uses MongoDB Aggregation to avoid loading all sales into memory.
 */
const detectDemandDrift = async () => {
    console.log('Running Demand Drift Analysis...');

    // Time Windows
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const twentyOneDaysAgo = new Date(today);
    twentyOneDaysAgo.setDate(today.getDate() - 21);

    try {
        const driftCandidates = await Sale.aggregate([
            // 1. Filter Sales within the analysis window (Last 21 days)
            {
                $match: {
                    createdAt: { $gte: twentyOneDaysAgo }
                }
            },
            // 2. Unwind items to analyze per-medicine
            { $unwind: "$items" },
            // 3. Group by Medicine + Date to get Daily Totals
            {
                $group: {
                    _id: {
                        medicineId: "$items.medicineId",
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        }
                    },
                    dailyQuantity: { $sum: "$items.quantity" }
                }
            },
            // 4. Project date back to date object for comparison
            {
                $project: {
                    medicineId: "$_id.medicineId",
                    date: { $dateFromString: { dateString: "$_id.date" } },
                    dailyQuantity: 1
                }
            },
            // 5. Group by Medicine to calculate Averages (Baseline vs Current)
            {
                $group: {
                    _id: "$medicineId",
                    baselineTotal: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$date", twentyOneDaysAgo] },
                                        { $lt: ["$date", sevenDaysAgo] }
                                    ]
                                },
                                "$dailyQuantity",
                                0
                            ]
                        }
                    },
                    currentTotal: {
                        $sum: {
                            $cond: [
                                { $gte: ["$date", sevenDaysAgo] },
                                "$dailyQuantity",
                                0
                            ]
                        }
                    },
                    // Count days with sales to normalize? 
                    // Better: We divide by fixed window size to assume 0 on missing days.
                }
            },
            // 6. Calculate Fixed Window Averages (Baseline: 14 days, Current: 7 days)
            {
                $project: {
                    baselineAvg: { $divide: ["$baselineTotal", 14] },
                    currentAvg: { $divide: ["$currentTotal", 7] }
                }
            },
            // 7. Filter: Ignore low volume items to avoid noise
            // (e.g., going from 0.1 to 0.2 avg is mathematically 100% diff but operationally irrelevant)
            {
                $match: {
                    $or: [
                        { baselineAvg: { $gte: 1 } }, // At least 1 sale/day historically
                        { currentAvg: { $gte: 1 } }   // or sudden spike to 1 sale/day
                    ]
                }
            },
            // 8. Calculate Percent Change
            {
                $project: {
                    baselineAvg: 1,
                    currentAvg: 1,
                    percentChange: {
                        $cond: [
                            { $eq: ["$baselineAvg", 0] },
                            100, // Infinite increase if baseline was 0
                            {
                                $multiply: [
                                    { $divide: [{ $subtract: ["$currentAvg", "$baselineAvg"] }, "$baselineAvg"] },
                                    100
                                ]
                            }
                        ]
                    }
                }
            },
            // 9. Alert Thresholds: Change >= 25% or <= -25%
            {
                $match: {
                    $or: [
                        { percentChange: { $gte: 25 } },
                        { percentChange: { $lte: -25 } }
                    ]
                }
            }
        ]);

        // Process Candidates
        for (const candidate of driftCandidates) {
            const medicine = await Medicine.findById(candidate._id);
            if (!medicine) continue;

            const driftType = candidate.percentChange > 0 ? 'SURGE' : 'DROP';

            // Check for recent alert to suppress duplicates (last 24h)
            const recentAlert = await DriftEvent.findOne({
                medicineId: candidate._id,
                driftType: driftType,
                detectedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (!recentAlert) {
                await DriftEvent.create({
                    medicineId: candidate._id,
                    driftType,
                    percentChange: parseFloat(candidate.percentChange.toFixed(2)),
                    baselineAvg: parseFloat(candidate.baselineAvg.toFixed(2)),
                    currentAvg: parseFloat(candidate.currentAvg.toFixed(2)),
                });
                console.log(`[DRIFT ALERT] ${driftType} detected for ${medicine.name}: ${candidate.percentChange.toFixed(1)}%`);
            }
        }

    } catch (error) {
        console.error("Drift Analysis Failed:", error);
    }
};

module.exports = { detectDemandDrift };
