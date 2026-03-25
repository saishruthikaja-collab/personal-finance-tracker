import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { getTransactions, getSummary } from '../../services/api';
import './Charts.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Charts = () => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categories: {}
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all transactions
      const transactionsData = await getTransactions();
      setTransactions(transactionsData || []);
      
      // Get current month summary
      const now = new Date();
      const summaryData = await getSummary(now.getMonth() + 1, now.getFullYear());
      setSummary(summaryData.summary || {});
      
      // Get monthly data for last 6 months
      const monthly = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      for (let i = 5; i >= 0; i--) {
        let month = currentMonth - i;
        let year = currentYear;
        if (month < 0) {
          month += 12;
          year--;
        }
        
        const monthData = await getSummary(month + 1, year);
        monthly.push({
          month: months[month],
          year: year,
          income: monthData.summary?.totalIncome || 0,
          expense: monthData.summary?.totalExpense || 0
        });
      }
      setMonthlyData(monthly);
      
    } catch (error) {
      console.error('Error fetching data for charts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pie Chart Data - Category-wise Spending
  const categoryData = {
    labels: Object.keys(summary.categories || {}),
    datasets: [
      {
        label: 'Spending by Category',
        data: Object.values(summary.categories || {}),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#C9CBCF', '#F7464A', '#46BFBD', '#FDB45C'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart - Monthly Comparison
  const monthlyComparisonData = {
    labels: monthlyData.map(m => `${m.month} ${m.year}`),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(m => m.income),
        backgroundColor: 'rgba(72, 187, 120, 0.6)',
        borderColor: '#48bb78',
        borderWidth: 1,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(m => m.expense),
        backgroundColor: 'rgba(245, 101, 101, 0.6)',
        borderColor: '#f56565',
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart - Income vs Expenses (Current Month)
  const incomeExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount ($)',
        data: [summary.totalIncome || 0, summary.totalExpense || 0],
        backgroundColor: ['#48bb78', '#f56565'],
        borderColor: ['#38a169', '#e53e3e'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16
        }
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading charts...</div>;
  }

  return (
    <div className="charts-container">
      <h2>Financial Trends & Visualization</h2>
      <p className="charts-subtitle">Module 4: Analyze your spending patterns</p>

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

      {/* Income vs Expenses Bar Chart */}
      <div className="chart-card">
        <h3>Income vs Expenses (Current Month)</h3>
        <div className="chart-container">
          <Bar data={incomeExpenseData} options={chartOptions} />
        </div>
      </div>

      {/* Pie Chart - Category Spending */}
      {Object.keys(summary.categories || {}).length > 0 ? (
        <div className="chart-card">
          <h3>Category-wise Spending</h3>
          <div className="chart-container pie-chart">
            <Pie data={categoryData} options={chartOptions} />
          </div>
        </div>
      ) : (
        <div className="chart-card">
          <h3>Category-wise Spending</h3>
          <p className="no-data">No expense data available. Add some transactions to see the chart!</p>
        </div>
      )}

      {/* Monthly Comparison Bar Chart */}
      <div className="chart-card">
        <h3>Monthly Spending Comparison (Last 6 Months)</h3>
        <div className="chart-container">
          <Bar data={monthlyComparisonData} options={chartOptions} />
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h4>📊 Financial Insights</h4>
        <ul>
          <li>Track your spending patterns month over month</li>
          <li>Identify categories where you spend the most</li>
          <li>Compare income vs expenses to maintain positive cash flow</li>
          <li>Set goals to reduce spending in high-cost categories</li>
        </ul>
      </div>
    </div>
  );
};

export default Charts;