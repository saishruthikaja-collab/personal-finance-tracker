import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api';
import { getTransactions, getSummary } from '../../services/api';
import TransactionForm from '../transactions/TransactionForm';
import TransactionList from '../transactions/TransactionList';
import './Dashboard.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    const [loading, setLoading] = useState(true);

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

    const handleExportCSV = () => {
        const allTransactions = transactions;
        
        if (allTransactions.length === 0) {
            alert('No transactions to export!');
            return;
        }
        
        const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];
        const rows = allTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type,
            t.category,
            t.amount,
            t.description || ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('CSV exported successfully!');
    };

    const handleExportPDF = () => {
        const allTransactions = transactions;
        
        if (allTransactions.length === 0) {
            alert('No transactions to export!');
            return;
        }
        
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Transaction Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Prepare table data
        const tableData = allTransactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.type.charAt(0).toUpperCase() + t.type.slice(1),
            t.category,
            `$${t.amount.toFixed(2)}`,
            t.description || '-'
        ]);
        
        // Add table using autoTable
        autoTable(doc, {
            startY: 40,
            head: [['Date', 'Type', 'Category', 'Amount', 'Description']],
            body: tableData,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [102, 126, 234] }
        });
        
        // Add summary
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Total Income: $${summary.totalIncome?.toFixed(2)}`, 14, finalY);
        doc.text(`Total Expenses: $${summary.totalExpense?.toFixed(2)}`, 14, finalY + 8);
        doc.text(`Balance: $${summary.balance?.toFixed(2)}`, 14, finalY + 16);
        
        // Save PDF
        doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
        alert('PDF exported successfully!');
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
                    <Link to="/profile" className="profile-btn">
                        Profile
                    </Link>
                    <button 
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                    <button className="export-btn" onClick={handleExportCSV}>
                        📥 Export CSV
                    </button>
                    <button className="pdf-btn" onClick={handleExportPDF}>
                        📄 Export PDF
                    </button>
                </div>
            </nav>

            <div className="dashboard-main">
                <h2>Welcome to Your Dashboard</h2>
                <p className="dashboard-subtitle">Module 2: Expense & Income Tracking</p>

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

            {/* Bottom Navigation - Backup removed */}
            <div className="bottom-nav">
                <Link to="/transactions" className={`nav-item ${location.pathname === '/transactions' ? 'active' : ''}`}>
                    Transactions
                </Link>
                <Link to="/budget" className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
                    Budget
                </Link>
                <Link to="/charts" className={`nav-item ${location.pathname === '/charts' ? 'active' : ''}`}>
                    Charts
                </Link>
                <Link to="/forum" className={`nav-item ${location.pathname === '/forum' ? 'active' : ''}`}>
                    Forum
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;