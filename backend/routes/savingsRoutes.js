const express = require('express');
const Savings = require('../models/Savings');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all savings goals
router.get('/', protect, async (req, res) => {
    try {
        const savings = await Savings.find({ user: req.user._id });
        
        const savingsWithProgress = savings.map(s => ({
            ...s.toObject(),
            remaining: s.targetAmount - s.currentAmount,
            progress: ((s.currentAmount / s.targetAmount) * 100).toFixed(1)
        }));

        res.json({ savings: savingsWithProgress });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create savings goal
router.post('/', protect, async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, targetDate } = req.body;

        const savings = await Savings.create({
            user: req.user._id,
            name,
            targetAmount,
            currentAmount: currentAmount || 0,
            targetDate
        });

        res.status(201).json(savings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add money to savings goal
router.put('/:id/add', protect, async (req, res) => {
    try {
        const { amount } = req.body;
        
        const savings = await Savings.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!savings) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        savings.currentAmount += amount;
        await savings.save();

        res.json(savings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete savings goal
router.delete('/:id', protect, async (req, res) => {
    try {
        await Savings.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        res.json({ message: 'Savings goal deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;