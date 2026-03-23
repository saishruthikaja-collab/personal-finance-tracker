const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Route files
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/savings', require('./routes/savingsRoutes'));

// Home route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to Personal Finance Tracker API',
        version: '1.0.0',
        modules: ['Authentication', 'Profile Management']
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 API URL: http://localhost:${PORT}`);
});
app.use('/api/transactions', require('./routes/transactionRoutes'));