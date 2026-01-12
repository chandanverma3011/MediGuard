const express = require('express');
const router = express.Router();
const { getDriftEvents, getMedicineDriftHistory, getLossForecast } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/demand-drift', protect, getDriftEvents);
router.get('/demand-drift/:medicineId', protect, getMedicineDriftHistory);
router.get('/loss-forecast', protect, getLossForecast);

module.exports = router;
