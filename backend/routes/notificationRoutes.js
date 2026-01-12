const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
        notification.isRead = true;
        const updatedNotification = await notification.save();
        res.json(updatedNotification);
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
}));

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, asyncHandler(async (req, res) => {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
}));

module.exports = router;
