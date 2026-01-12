const express = require('express');
const router = express.Router();
const { getPricingRecommendations, getBatchPricing } = require('../controllers/pricingController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// STRICT: Admin Only. Internal Audit System.
router.get('/recommendations', protect, authorizeRoles('admin', 'pharmacist'), getPricingRecommendations);
router.get('/recommendations/:id', protect, authorizeRoles('admin', 'pharmacist'), getBatchPricing);

module.exports = router;
