const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profile: {
        monthlyIncome: {
            type: Number,
            default: 0,
            min: 0
        },
        savingsGoal: {
            type: Number,
            default: 0,
            min: 0
        },
        targetExpenses: {
            type: Map,
            of: Number,
            default: {
                'Rent': 0,
                'Food': 0,
                'Travel': 0,
                'Shopping': 0,
                'Entertainment': 0,
                'Utilities': 0
            }
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Remove password when sending user data
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);