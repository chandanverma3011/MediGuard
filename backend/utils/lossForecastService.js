const mongoose = require('mongoose');
const Batch = require('../models/Batch');

/**
 * Service to calculate inventory loss forecast.
 * Intended for internal decision support only.
 */
class LossForecastService {

    /**
     * Generates a forecast of potential financial loss due to expiry.
     * @returns {Promise<Object>} Aggregated loss data and detailed batch breakdown.
     */
    async generateForecast() {
        const today = new Date();
        // Risk window: 30 days
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        try {
            const pipeline = [
                // STAGE 1: Filter eligible batches
                {
                    $match: {
                        stock: { $gt: 0 },              // Only items in stock
                        expiryDate: { $lte: thirtyDaysFromNow, $gt: today }, // Expiring within 30 days but NOT yet expired
                        cachedStatus: { $ne: 'EXPIRED' }, // Double check status
                        isLocked: { $ne: true }         // Exclude disposed/locked items
                    }
                },
                // STAGE 2: Lookup Medicine details (for name)
                {
                    $lookup: {
                        from: 'medicines',
                        localField: 'medicineId',
                        foreignField: '_id',
                        as: 'medicine'
                    }
                },
                { $unwind: '$medicine' },
                // STAGE 3: Calculate projected fields
                {
                    $addFields: {
                        daysToExpiry: {
                            $dateDiff: {
                                startDate: today,
                                endDate: '$expiryDate',
                                unit: 'day'
                            }
                        },
                        // Ensure costPrice exists, default to 0 if missing to prevent null errors
                        safeCostPrice: { $ifNull: ['$costPrice', 0] }
                    }
                },
                // STAGE 4: Calculate Loss & Assign Risk Level
                {
                    $addFields: {
                        estimatedLossValue: { $multiply: ['$stock', '$safeCostPrice'] },
                        riskLevel: {
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$daysToExpiry', 7] }, then: 'HIGH' },
                                    { case: { $lte: ['$daysToExpiry', 15] }, then: 'MEDIUM' },
                                    { case: { $lte: ['$daysToExpiry', 30] }, then: 'LOW' }
                                ],
                                default: 'UNKNOWN'
                            }
                        }
                    }
                },
                // STAGE 5: Project final shape
                {
                    $project: {
                        _id: 1,
                        batchNumber: 1,
                        medicineName: '$medicine.name',
                        medicineId: '$medicine._id',
                        expiryDate: 1,
                        stock: 1,
                        costPrice: '$safeCostPrice',
                        daysToExpiry: 1,
                        estimatedLossValue: 1,
                        riskLevel: 1,
                        explanation: {
                            $concat: [
                                'Expires in ',
                                { $toString: '$daysToExpiry' },
                                ' days. Risk: ',
                                { $literal: 'Potential loss of value.' }
                            ]
                        }
                    }
                },
                // STAGE 6: Sort by highest risk (lowest days) then highest value
                {
                    $sort: { daysToExpiry: 1, estimatedLossValue: -1 }
                }
            ];

            const detailedForecast = await Batch.aggregate(pipeline);

            // Compute Totals
            const summary = detailedForecast.reduce((acc, item) => {
                acc.totalPotentialLoss += item.estimatedLossValue;
                acc.totalBatchesAtRisk += 1;

                if (!acc.riskBreakdown[item.riskLevel]) {
                    acc.riskBreakdown[item.riskLevel] = 0;
                }
                acc.riskBreakdown[item.riskLevel] += item.estimatedLossValue;

                return acc;
            }, {
                totalPotentialLoss: 0,
                totalBatchesAtRisk: 0,
                riskBreakdown: { HIGH: 0, MEDIUM: 0, LOW: 0 }
            });

            return {
                meta: {
                    generatedAt: new Date(),
                    windowDays: 30,
                    currency: 'INR' // Assuming INR based on previous context
                },
                summary,
                details: detailedForecast
            };

        } catch (error) {
            console.error('Error generating loss forecast:', error);
            throw new Error('Failed to generate loss forecast');
        }
    }
}

module.exports = new LossForecastService();
