import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api';
import { getTransactions, getSummary } from '../../services/api';
import TransactionForm from '../transactions/TransactionForm';
import TransactionList from '../transactions/TransactionList';
import './Dashboard.css';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        monthlyIncome: 0,
        savingsGoal: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categories: {}
    });
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/signin');
    }, [navigate]);

    const fetchProfile = useCallback(async () => {
        try {
            const response = await getProfile();
            setUser(response.data.user);
            setProfile(response.data.user.profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 401) {
                handleLogout();
            }
        }
    }, [handleLogout]);

    const fetchTransactions = useCallback(async () => {
        try {
            const data = await getTransactions();
            setTransactions(data || []);
            
            const now = new Date();
            const summaryData = await getSummary(now.getMonth() + 1, now.getFullYear());
            setSummary(summaryData.summary || {});
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await fetchProfile();
            await fetchTransactions();
        };
        loadData();
    }, [fetchProfile, fetchTransactions]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await updateProfile(profile);
            setSuccess('Profile updated successfully!');
            setProfile(response.data.profile);
            setShowProfileForm(false);
            
            const storedUser = JSON.parse(localStorage.getItem('user'));
            storedUser.profile = response.data.profile;
            localStorage.setItem('user', JSON.stringify(storedUser));
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: parseFloat(e.target.value) || 0
        });
    };

    if (loading && !user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="nav-brand">
                    <h1>💰 Finance Tracker</h1>
                </div>
                <div className="nav-menu">
                    <span className="nav-email">{user?.email}</span>
                    <button 
                        className="profile-btn"
                        onClick={() => setShowProfileForm(!showProfileForm)}
                    >
                        Profile
                    </button>
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-main">
                <h2>Welcome to Your Dashboard</h2>
                <p className="dashboard-subtitle">Module 2: Expense & Income Tracking</p>

                {showProfileForm && (
                    <div className="profile-section">
                        <h3>Update Your Profile</h3>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-group">
                                <label>Monthly Income ($)</label>
                                <input
                                    type="number"
                                    name="monthlyIncome"
                                    value={profile.monthlyIncome}
                                    onChange={handleChange}
                                    min="0"
                                    step="100"
                                    placeholder="Enter your monthly income"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Savings Goal ($)</label>
                                <input
                                    type="number"
                                    name="savingsGoal"
                                    value={profile.savingsGoal}
                                    onChange={handleChange}
                                    min="0"
                                    step="100"
                                    placeholder="Enter your savings goal"
                                />
                            </div>
                            
                            <button 
                                type="submit" 
                                className="save-btn"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                            <button 
                                type="button" 
                                className="cancel-btn"
                                onClick={() => setShowProfileForm(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )}

                {/* Profile Summary */}
                <div className="profile-summary">
                    <h3>Your Profile Summary</h3>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <span className="card-label">Email</span>
                            <span className="card-value">{user?.email}</span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">Role</span>
                            <span className="card-value capitalize">{user?.role}</span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">Monthly Income</span>
                            <span className="card-value">${profile.monthlyIncome?.toLocaleString()}</span>
                        </div>
                        <div className="summary-card">
                            <span className="card-label">Savings Goal</span>
                            <span className="card-value">${profile.savingsGoal?.toLocaleString()}</span>
                        </div>
                    </div>
                    <button 
                        className="edit-profile-btn"
                        onClick={() => setShowProfileForm(true)}
                    >
                        Edit Profile
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="summary-cards">
                    <div className="summary-card income">
                        <h3>Total Income</h3>
                        <p className="amount">${summary.totalIncome?.toFixed(2)}</p>
                    </div>
                    <div className="summary-card expense">
                        <h3>Total Expenses</h3>
                        <p className="amount">${summary.totalExpense?.toFixed(2)}</p>
                    </div>
                    <div className="summary-card balance">
                        <h3>Balance</h3>
                        <p className="amount">${summary.balance?.toFixed(2)}</p>
                    </div>
                </div>

                {/* Transaction Form and List */}
                <div className="dashboard-content">
                    <TransactionForm onTransactionAdded={fetchTransactions} />
                    <TransactionList 
                        transactions={transactions} 
                        onTransactionUpdated={fetchTransactions}
                    />
                </div>
            </div>

            {/* Bottom Navigation with Links to all modules */}
            <div className="bottom-nav">
                <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    Dashboard
                </Link>
                <Link to="/transactions" className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}>
                    Transactions
                </Link>
                <Link to="/budget" className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
                    Budget
                </Link>
                <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                    Profile
                </Link>
                <Link to="/charts" className={`nav-item ${location.pathname === '/charts' ? 'active' : ''}`}>
    Charts
</Link>
            </div>
        </div>
    );
};

export default Dashboard;