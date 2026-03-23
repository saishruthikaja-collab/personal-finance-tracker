const express = require('express');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Get all budgets with spending tracking
router.get('/', protect, async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentDate = new Date();
        const queryMonth = month || currentDate.getMonth() + 1;
        const queryYear = year || currentDate.getFullYear();

        let budgets = await Budget.find({
            user: req.user._id,
            month: queryMonth,
            year: queryYear
        });

        const startDate = new Date(queryYear, queryMonth - 1, 1);
        const endDate = new Date(queryYear, queryMonth, 0);

        const transactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: startDate, $lte: endDate }
        });

        const spending = {};
        transactions.forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        });

        const updatedBudgets = [];
        for (let budget of budgets) {
            const spent = spending[budget.category] || 0;
            
            if (spent > budget.limit && !budget.alerts.some(a => a.message.includes('exceeded'))) {
                budget.alerts.push({
                    message: `⚠️ You've exceeded your ${budget.category} budget by $${(spent - budget.limit).toFixed(2)}!`,
                    date: new Date(),
                    read: false
                });
            }

            budget.spent = spent;
            await budget.save();
            
            updatedBudgets.push({
                ...budget.toObject(),
                remaining: budget.limit - spent,
                percentage: ((spent / budget.limit) * 100).toFixed(1),
                status: spent > budget.limit ? 'exceeded' : 'good'
            });
        }

        res.json({ budgets: updatedBudgets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or update budget
router.post('/', protect, async (req, res) => {
    try {
        const { category, limit, month, year } = req.body;

        let budget = await Budget.findOne({
            user: req.user._id,
            category,
            month,
            year
        });

        if (budget) {
            budget.limit = limit;
            await budget.save();
        } else {
            budget = await Budget.create({
                user: req.user._id,
                category,
                limit,
                month,
                year,
                spent: 0
            });
        }

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete budget
router.delete('/:id', protect, async (req, res) => {
    try {
        await Budget.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        res.json({ message: 'Budget deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;