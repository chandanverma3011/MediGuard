const express = require('express');
const router = express.Router();
const { disposeBatch, getDisposalHistory } = require('../controllers/disposalController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Robust Role-Based Access Control
router.route('/')
    .post(protect, authorizeRoles('admin'), disposeBatch)  // Only Admins can dispose
    .get(protect, authorizeRoles('admin'), getDisposalHistory); // Only Admins can view audit logs

module.exports = router;
