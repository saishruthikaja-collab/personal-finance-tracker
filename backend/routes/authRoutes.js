const express = require('express');
const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
});

// Simple signup
router.post('/signup', (req, res) => {
    res.json({ message: 'Signup endpoint working', data: req.body });
});

// Simple signin
router.post('/signin', (req, res) => {
    res.json({ message: 'Signin endpoint working', data: req.body });
});

module.exports = router;