import React, { useState } from 'react';
import { createTransaction } from '../../services/api';
import './TransactionForm.css';

const TransactionForm = ({ onTransactionAdded }) => {
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const expenseCategories = ['Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const transactionData = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        try {
            await createTransaction(transactionData);
            
            setFormData({
                type: 'expense',
                amount: '',
                category: 'Food',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            
            onTransactionAdded();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transaction-form">
            <h3>Add Transaction</h3>
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                    />
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter description"
                    />
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Transaction'}
                </button>
            </form>
        </div>
    );
};

export default TransactionForm;