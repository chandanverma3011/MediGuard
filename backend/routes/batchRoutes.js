const express = require('express');
const router = express.Router();
const { getBatches, addBatch, updateBatch, deleteBatch } = require('../controllers/batchController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBatches).post(protect, authorizeRoles('admin', 'pharmacist'), addBatch);
router.route('/:id').put(protect, authorizeRoles('admin', 'pharmacist'), updateBatch).delete(protect, authorizeRoles('admin'), deleteBatch);

module.exports = router;
