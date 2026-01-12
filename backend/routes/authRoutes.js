const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getPendingUsers, approveUser, getUsers, deleteUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);

// Admin Only
router.get('/pending', protect, authorizeRoles('admin'), getPendingUsers);
router.put('/:id/approve', protect, authorizeRoles('admin'), approveUser);
router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
