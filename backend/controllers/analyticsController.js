const asyncHandler = require('express-async-handler');
const DriftEvent = require('../models/DriftEvent');

// @desc    Get all demand drift events (Global View)
// @route   GET /api/analytics/demand-drift
// @access  Private (Admin/Pharmacist)
const getDriftEvents = asyncHandler(async (req, res) => {
    // Optional: Filter by type (?type=SURGE)
    const filter = {};
    if (req.query.type) {
        filter.driftType = req.query.type.toUpperCase();
    }

    const events = await DriftEvent.find(filter)
        .populate('medicineId', 'name category')
        .sort({ detectedAt: -1 })
        .limit(50); // specific limit to avoid overload

    res.json(events);
});

// @desc    Get drift history for a specific medicine
// @route   GET /api/analytics/demand-drift/:medicineId
// @access  Private
const getMedicineDriftHistory = asyncHandler(async (req, res) => {
    const events = await DriftEvent.find({ medicineId: req.params.medicineId })
        .sort({ detectedAt: -1 });

    res.json(events);
});

const lossForecastService = require('../utils/lossForecastService');

// @desc    Get inventory loss forecast (Internal Support)
// @route   GET /api/analytics/loss-forecast
// @access  Private (Admin Only - ideally)
const getLossForecast = asyncHandler(async (req, res) => {
    try {
        const forecast = await lossForecastService.generateForecast();
        res.json(forecast);
    } catch (error) {
        res.status(500);
        throw new Error('Loss forecast calculation failed');
    }
});

module.exports = {
    getDriftEvents,
    getMedicineDriftHistory,
    getLossForecast
};
