const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Rent', 'Utilities', 'Healthcare', 'Other'],
        required: true
    },
    limit: {
        type: Number,
        required: true,
        min: 0
    },
    spent: {
        type: Number,
        default: 0
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    alerts: [{
        message: String,
        date: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }]
});

module.exports = mongoose.model('Budget', budgetSchema);