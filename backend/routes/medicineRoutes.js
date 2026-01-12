const express = require('express');
const router = express.Router();
const { getMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMedicines).post(protect, authorizeRoles('admin'), addMedicine);
router.route('/:id').put(protect, authorizeRoles('admin'), updateMedicine).delete(protect, authorizeRoles('admin'), deleteMedicine);

module.exports = router;
