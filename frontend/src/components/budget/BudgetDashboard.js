import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../../services/api';
import { getSavings, createSavings, addToSavings, deleteSavings } from '../../services/api';
import './BudgetDashboard.css';

const BudgetDashboard = () => {
    const [budgets, setBudgets] = useState([]);
    const [savings, setSavings] = useState([]);
    const [showAddBudget, setShowAddBudget] = useState(false);
    const [showAddSavings, setShowAddSavings] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: 'Food & Dining',
        limit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const [newSavings, setNewSavings] = useState({
        name: 'Vacation Fund',
        targetAmount: '',
        currentAmount: 0,
        targetDate: new Date().toISOString().split('T')[0]
    });

    const budgetCategories = ['Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Rent', 'Utilities', 'Healthcare', 'Other'];
    const savingsOptions = ['Vacation Fund', 'Emergency Fund', 'Education Fund', 'Home Purchase', 'Car Fund', 'Retirement', 'Other'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const now = new Date();
            const budgetsData = await getBudgets(now.getMonth() + 1, now.getFullYear());
            setBudgets(budgetsData.budgets || []);

            const savingsData = await getSavings();
            setSavings(savingsData.savings || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddBudget = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', newBudget);
    
    try {
        console.log('Sending to API...');
        const response = await createBudget(newBudget);
        console.log('API response:', response);
        
        setShowAddBudget(false);
        fetchData();
    } catch (error) {
        console.error('Error in handleAddBudget:', error);
        alert('Error: ' + error.message);
    }
};

    const handleAddSavings = async (e) => {
        e.preventDefault();
        try {
            await createSavings(newSavings);
            setShowAddSavings(false);
            fetchData();
        } catch (error) {
            console.error('Error adding savings:', error);
        }
    };

    const handleAddToSavings = async (id) => {
        const amount = prompt('Enter amount to add:');
        if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
            try {
                await addToSavings(id, parseFloat(amount));
                fetchData();
            } catch (error) {
                console.error('Error adding to savings:', error);
            }
        }
    };

    const handleDeleteBudget = async (id) => {
        if (window.confirm('Delete this budget?')) {
            try {
                await deleteBudget(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting budget:', error);
            }
        }
    };

    const handleDeleteSavings = async (id) => {
        if (window.confirm('Delete this savings goal?')) {
            try {
                await deleteSavings(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting savings:', error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    return (
        <div className="dashboard">
            {/* Navigation Bar - Profile and Logout on right */}
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <h1>💰 Finance Tracker</h1>
                </div>
                <div className="nav-menu">
                    <button className="profile-btn">Profile</button>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-main">
                <h2>Budget & Savings Goals</h2>
                <p className="dashboard-subtitle">Module 3: Control spending and save money</p>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card" style={{ borderTop: '4px solid #48bb78' }}>
                        <h3>Total Budget</h3>
                        <p className="amount">${totalBudget.toFixed(2)}</p>
                    </div>
                    <div className="summary-card" style={{ borderTop: '4px solid #f56565' }}>
                        <h3>Total Spent</h3>
                        <p className="amount">${totalSpent.toFixed(2)}</p>
                    </div>
                    <div className="summary-card" style={{ borderTop: '4px solid #667eea' }}>
                        <h3>Remaining</h3>
                        <p className="amount">${totalRemaining.toFixed(2)}</p>
                    </div>
                </div>

                {/* Budgets Section */}
                <div className="profile-summary" style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Monthly Budgets</h3>
                        <button className="edit-profile-btn" onClick={() => setShowAddBudget(!showAddBudget)}>
                            {showAddBudget ? 'Cancel' : '+ Set Budget'}
                        </button>
                    </div>

                    {showAddBudget && (
                        <div className="profile-section" style={{ marginBottom: '20px' }}>
                            <form onSubmit={handleAddBudget} className="profile-form">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={newBudget.category}
                                        onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
                                        required
                                    >
                                        {budgetCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Monthly Limit ($)</label>
                                    <input
                                        type="number"
                                        value={newBudget.limit}
                                        onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddBudget(false)}>Cancel</button>
                            </form>
                        </div>
                    )}

                    <div className="summary-cards">
                        {budgets.length === 0 ? (
                            <div className="summary-card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                                <p>No budgets set. Click "Set Budget" to start.</p>
                            </div>
                        ) : (
                            budgets.map(budget => {
                                const spent = budget.spent || 0;
                                const remaining = budget.limit - spent;
                                const isExceeded = spent > budget.limit;
                                
                                return (
                                    <div key={budget._id} className="summary-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3>{budget.category}</h3>
                                            <button 
                                                onClick={() => handleDeleteBudget(budget._id)}
                                                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="amount" style={{ color: isExceeded ? '#f56565' : '#333' }}>
                                            ${remaining.toFixed(2)} remaining
                                        </p>
                                        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                                            Spent: ${spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                                        </p>
                                        {isExceeded && (
                                            <p style={{ color: '#f56565', fontSize: '13px', marginTop: '5px' }}>
                                                ⚠️ Exceeded by ${(spent - budget.limit).toFixed(2)}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Savings Goals Section */}
                <div className="profile-summary">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3>Savings Goals</h3>
                        <button className="edit-profile-btn" onClick={() => setShowAddSavings(!showAddSavings)}>
                            {showAddSavings ? 'Cancel' : '+ Add Goal'}
                        </button>
                    </div>

                    {showAddSavings && (
                        <div className="profile-section" style={{ marginBottom: '20px' }}>
                            <form onSubmit={handleAddSavings} className="profile-form">
                                <div className="form-group">
                                    <label>Goal Name</label>
                                    <select
                                        value={newSavings.name}
                                        onChange={(e) => setNewSavings({...newSavings, name: e.target.value})}
                                        required
                                    >
                                        {savingsOptions.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Target Amount ($)</label>
                                    <input
                                        type="number"
                                        value={newSavings.targetAmount}
                                        onChange={(e) => setNewSavings({...newSavings, targetAmount: e.target.value})}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Date</label>
                                    <input
                                        type="date"
                                        value={newSavings.targetDate}
                                        onChange={(e) => setNewSavings({...newSavings, targetDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <button type="submit" className="save-btn">Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddSavings(false)}>Cancel</button>
                            </form>
                        </div>
                    )}

                    <div className="summary-cards">
                        {savings.length === 0 ? (
                            <div className="summary-card" style={{ gridColumn: '1/-1', textAlign: 'center' }}>
                                <p>No savings goals. Click "Add Goal" to start.</p>
                            </div>
                        ) : (
                            savings.map(goal => {
                                const remaining = goal.targetAmount - goal.currentAmount;
                                const progress = (goal.currentAmount / goal.targetAmount * 100).toFixed(1);
                                
                                return (
                                    <div key={goal._id} className="summary-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3>{goal.name}</h3>
                                            <button 
                                                onClick={() => handleDeleteSavings(goal._id)}
                                                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px' }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <p className="amount">
                                            ${remaining.toFixed(2)} remaining
                                        </p>
                                        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
                                            ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)} ({progress}%)
                                        </p>
                                        <button 
                                            onClick={() => handleAddToSavings(goal._id)}
                                            className="edit-profile-btn"
                                            style={{ marginTop: '10px', width: '100%' }}
                                        >
                                            + Add Money
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BudgetDashboard;