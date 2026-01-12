const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');

// @desc    Get medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
});

// @desc    Add medicine
// @route   POST /api/medicines
// @access  Private
const addMedicine = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400);
        throw new Error('Please add a medicine name');
    }

    const medicine = await Medicine.create({
        name: req.body.name,
        category: req.body.category,
        manufacturer: req.body.manufacturer,
    });

    res.status(200).json(medicine);
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
const updateMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedMedicine);
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
const deleteMedicine = asyncHandler(async (req, res) => {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
        res.status(404);
        throw new Error('Medicine not found');
    }

    await medicine.deleteOne();

    res.status(200).json({ id: req.params.id });
});

module.exports = {
    getMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
};
