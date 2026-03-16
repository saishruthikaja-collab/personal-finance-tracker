import React, { useState } from 'react';
import { deleteTransaction, updateTransaction } from '../../services/api';
import './TransactionList.css';

const TransactionList = ({ transactions, onTransactionUpdated }) => {
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(id);
                onTransactionUpdated();
            } catch (error) {
                console.error('Error deleting:', error);
            }
        }
    };

    const handleEdit = (transaction) => {
        setEditingId(transaction._id);
        setEditForm({
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description || '',
            date: new Date(transaction.date).toISOString().split('T')[0]
        });
    };

    const handleUpdate = async (id) => {
        try {
            await updateTransaction(id, {
                ...editForm,
                amount: parseFloat(editForm.amount)
            });
            setEditingId(null);
            onTransactionUpdated();
        } catch (error) {
            console.error('Error updating:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    const expenseCategories = ['Food', 'Rent', 'Travel', 'Shopping', 'Entertainment', 'Utilities', 'Healthcare', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    return (
        <div className="transaction-list">
            <h3>Recent Transactions</h3>
            
            {transactions.length === 0 ? (
                <p className="no-transactions">No transactions yet</p>
            ) : (
                transactions.map(transaction => (
                    <div key={transaction._id} className={`transaction-item ${transaction.type}`}>
                        {editingId === transaction._id ? (
                            <div className="edit-form">
                                <input
                                    type="number"
                                    value={editForm.amount}
                                    onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                                    step="0.01"
                                />
                                <select
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                >
                                    {(transaction.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    placeholder="Description"
                                />
                                <input
                                    type="date"
                                    value={editForm.date}
                                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                />
                                <div className="edit-actions">
                                    <button onClick={() => handleUpdate(transaction._id)}>Save</button>
                                    <button onClick={() => setEditingId(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="transaction-info">
                                    <span className="transaction-category">{transaction.category}</span>
                                    <span className="transaction-description">{transaction.description || 'No description'}</span>
                                    <span className="transaction-date">{formatDate(transaction.date)}</span>
                                </div>
                                <div className="transaction-amount">
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                                <div className="transaction-actions">
                                    <button onClick={() => handleEdit(transaction)}>Edit</button>
                                    <button onClick={() => handleDelete(transaction._id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default TransactionList;