const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Transaction routes working' });
});

// Create transaction - MODIFIED to work without user
router.post('/', async (req, res) => {
    try {
        // For testing, we'll use a default user ID
        // You can replace this with any valid user ID from your database
        const transactionData = {
            ...req.body,
            user: req.body.user || "65f0a1b2c3d4e5f6a7b8c9d0" // This is a placeholder
        };
        
        const transaction = new Transaction(transactionData);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all transactions - MODIFIED to get all (no user filter)
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update transaction
router.put('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(transaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        await Transaction.findByIdAndDelete(req.params.id);
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: error.message });
    }
});

// Summary - MODIFIED to work without user
router.get('/summary/overview', async (req, res) => {
    try {
        const { month, year } = req.query;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const transactions = await Transaction.find({
            date: { $gte: startDate, $lte: endDate }
        });
        
        let totalIncome = 0;
        let totalExpense = 0;
        const categories = {};
        
        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            }
        });
        
        res.json({
            summary: {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                categories
            }
        });
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;