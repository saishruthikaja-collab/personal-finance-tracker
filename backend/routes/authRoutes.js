const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
});

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide all required fields' 
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                error: 'Passwords do not match' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'Password must be at least 6 characters' 
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'Email already registered' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword
        });

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error during signup' 
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/signin
// @access  Public
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Please provide email and password' 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid credentials' 
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error during login' 
        });
    }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { monthlyIncome, savingsGoal, targetExpenses } = req.body;
        
        const user = await User.findById(req.user._id);
        
        if (monthlyIncome !== undefined) {
            user.profile.monthlyIncome = monthlyIncome;
        }
        
        if (savingsGoal !== undefined) {
            user.profile.savingsGoal = savingsGoal;
        }
        
        if (targetExpenses) {
            user.profile.targetExpenses = targetExpenses;
        }

        await user.save();
        
        res.json({
            success: true,
            message: 'Profile updated successfully',
            profile: user.profile
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error' 
        });
    }
});

module.exports = router;