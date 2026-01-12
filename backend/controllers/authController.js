const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Register new user (Pending Approval)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - Default is Pharmacist & Pending Approval
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'pharmacist',
        isApproved: false,
        status: 'pending'
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            message: 'Registration successful! Please wait for Admin approval.'
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Support both old boolean and new string status
        if (!user.isApproved && user.status !== 'approved') {
            res.status(401);
            throw new Error('Account pending approval. Please contact Administrator.');
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Get all pending users
// @route   GET /api/auth/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
    const users = await User.find({
        $or: [{ status: 'pending' }, { isApproved: false }]
    }).select('-password');
    res.json(users);
});

// @desc    Approve a user
// @route   PUT /api/auth/:id/approve
// @access  Private/Admin
const approveUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isApproved = true;
        user.status = 'approved';
        await user.save();
        res.json({ message: 'User approved' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Forgot Password - Terminate with Link in Console
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and save to DB
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set Expire (10 Minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create Reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`;

    console.log("==========================================");
    console.log("PASSWORD RESET LINK GENERATED:");
    console.log(resetUrl);
    console.log("==========================================");

    res.status(200).json({
        success: true,
        data: message,
        resetUrl: resetUrl
    });
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid token');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);

    // Clear fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: "Password Updated Success" });
});

module.exports = {
    registerUser,
    loginUser,
    getPendingUsers,
    approveUser,
    getUsers,
    deleteUser,
    forgotPassword,
    resetPassword
};
