import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchRecentTransactions, fetchExpensesByCategory, fetchTransactionsByMonth, fetchUpcomingRecurringPayments, fetchIncomesByCategory, fetchPastMonthsExpenses,fetchPastMonthsIncome,fetchIncomesByMonth } from '../services/firestoreService'; // Firestore service
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase'; 
import { format } from 'date-fns';
import { ShimmerThumbnail } from 'react-shimmer-effects';
import { motion } from 'framer-motion';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [user] = useAuthState(auth); 
  const [loading, setLoading] = useState(true);
  const [currentMonthData, setCurrentMonthData] = useState({ budget: 0, expenses: 0, savings: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [incomeByCategory, setIncomeByCategory] = useState([]);
  const [pastMonthsExpenses, setPastMonthsExpenses] = useState([]);
  const [pastMonthsIncome, setPastMonthsIncome] = useState([]);
  const [upcomingPayments, setUpcomingPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "MM"));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), "yyyy"));
 
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    if (user) {
      setLoading(true);
      const loadData = async () => {
        const month = selectedMonth.length ==2 ? selectedMonth : '0'+selectedMonth;
        const selectedMonthYear = `${month}-${selectedYear}`;
        // Fetch recent transactions
        const recent = await fetchRecentTransactions(user.uid);
        setRecentTransactions(recent);

        // Fetch expenses grouped by category
        const expensesCategory = await fetchExpensesByCategory(user.uid, selectedMonthYear);
        setExpensesByCategory(expensesCategory);
        
        // Fetch income grouped by category
        const incomeCategory = await fetchIncomesByCategory(user.uid, selectedMonthYear);
        setIncomeByCategory(incomeCategory);
        
        // Fetch current month data (budget, expenses, savings)
        const monthTransactions = await fetchTransactionsByMonth(user.uid, selectedMonthYear);
        const incomebymonth = await fetchIncomesByMonth(user.uid,selectedMonthYear); 
      
        const budget = incomebymonth.reduce((total,income) => total + parseInt(income.amount),0);
        const expenses = monthTransactions.reduce((total, transaction) => parseInt(total) + parseInt(transaction.amount), 0);
        const savings = budget - expenses;
        setCurrentMonthData({ budget, expenses, savings });

        const upcoming = await fetchUpcomingRecurringPayments(user.uid);
        setUpcomingPayments(upcoming);

        const monthYear = parseInt(selectedMonth) <5 ? "05-2024": selectedMonthYear
        const pastExpenses = await fetchPastMonthsExpenses(user.uid,monthYear);
        const pastIncome = await fetchPastMonthsIncome(user.uid,monthYear);
        setPastMonthsExpenses(pastExpenses);
        setPastMonthsIncome(pastIncome);

        setLoading(false);
      };

      loadData();
    }
  }, [user, selectedMonth, selectedYear]);

  if (loading) {
    return <div className='mt-[150px] ml-[30px] pr-[30px]'>
      <div className='flex justify-between'>
      <ShimmerThumbnail height={100} width={400}rounded/>
      <ShimmerThumbnail height={100} width={400} rounded />
      <ShimmerThumbnail height={100} width={400} rounded />
      </div>
      <div className='flex gap-[60px]'>
      <ShimmerThumbnail height={400} width={650} rounded />
      <ShimmerThumbnail height={400} width={650} rounded />
      </div>
      <div className='flex gap-[60px]'>
      <ShimmerThumbnail height={400} width={650} rounded />
      <ShimmerThumbnail height={400} width={650} rounded />
      </div>
    </div>
  }

  // Line chart data for expenses
  const monthIndex = parseInt(selectedMonth)-5;
  const lineChartData = {
    labels: months.slice(monthIndex, monthIndex+5), // Limit the chart to the last 5 months
    datasets: [
      {
        label: 'Expenses',
        data: pastMonthsExpenses,
        borderColor: '#f87171', // red line color
        backgroundColor: 'rgba(248, 113, 113, 0.2)',
        fill: true,
      },
    ],
  };

  // Bar chart data for savings
  const barChartData = {
    labels: months.slice(monthIndex, monthIndex+5), // Limit the chart to the last 5 months
    datasets: [
      {
        label: 'Savings',
        data: pastMonthsIncome,
        backgroundColor: '#4ade80', // green bars color
        borderColor: '#4ade80',
        borderWidth: 1,
      },
    ],
  };

  // Chart options for dark mode styling
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF', // White text in dark mode
        },
      },
      title: {
        display: true,
        text: 'Chart Title',
        color: '#FFFFFF',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#FFFFFF', // White text for axis labels
        },
        grid: {
          color: '#333333', // Dark grid lines
        },
      },
      y: {
        ticks: {
          color: '#FFFFFF',
        },
        grid: {
          color: '#333333',
        },
      },
    },
  };

  return (
    <div className="p-8 bg-black w-full min-h-screen">
      <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white">Track Your</span> Dashboard 📊
        </motion.h1>

      
      <div className="flex justify-end mb-6">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 bg-zinc-800 text-white rounded-md"
        >
          {months.map((month, index) => (
            <option key={index} value={index + 1}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 bg-zinc-800 text-white ml-4 rounded-md"
        >
          {Array.from(new Array(10), (v, k) => (
            <option key={k} value={new Date().getFullYear() - k}>
              {new Date().getFullYear() - k}
            </option>
          ))}
        </select>
      </div>
      
      {/* Cards for budget, expenses, and savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-800 shadow-md p-6 rounded-lg text-center text-white">
          <h3 className="text-lg font-semibold">Budget </h3>
          <p className="text-2xl font-bold text-indigo-400">${currentMonthData.budget}</p>
        </div>
        <div className="bg-zinc-800 shadow-md p-6 rounded-lg text-center text-white">
          <h3 className="text-lg font-semibold">Expenses </h3>
          <p className="text-2xl font-bold text-red-400">${currentMonthData.expenses}</p>
        </div>
        <div className="bg-zinc-800 shadow-md p-6 rounded-lg text-center text-white">
          <h3 className="text-lg font-semibold">Savings </h3>
          <p className="text-2xl font-bold text-green-400">${currentMonthData.savings}</p>
        </div>
      </div>

      {/* Line chart for expenses */}
      <div className='flex justify-between w-full'>
        <div className="bg-zinc-800 shadow-md p-6 rounded-lg mb-8 w-[48%] h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-white">Expenses Over the Last 5 Months</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>

        {/* Bar chart for savings */}
        <div className="bg-zinc-800 shadow-md p-6 rounded-lg w-[48%] h-[400px]">
          <h3 className="text-lg font-semibold mb-4 text-white">Savings Over the Last 5 Months</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className='flex w-full justify-between'> 
      
      
        {/* Incomes by Category */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-8 w-[48%] h-[350px]">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Income by Category </h2>
      {incomeByCategory.length > 0 ? (
        <ul>
          {incomeByCategory.map((income) => (
            <li key={income.category} className="mb-3">
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium text-white">{income.category}</p>
                <p className="text-lg font-bold text-green-500">${income.total}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No income available.</p>
      )}
    </div>
      {/* Expenses by Category */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-[48%] h-[350px]">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Expenses by Category</h2>
        {expensesByCategory.length > 0 ? (
          <ul>
            {expensesByCategory.map((expense) => (
              <li key={expense.category} className="mb-3">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium text-white">{expense.category}</p>
                  <p className="text-lg font-bold text-red-500">${expense.total}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No expenses available.</p>
        )}
      </div>
    </div>

    <div className='flex justify-between w-full'>
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-8 w-[48%] h-[400px]">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Recent 5 Transactions</h2>
        {recentTransactions.length > 0 ? (
          <ul>
            {recentTransactions.map((transaction) => (
              <li key={transaction.id} className="mb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-white">{transaction.category || "No Category"}</p>
                    <p className="text-sm text-gray-500">{format(new Date(transaction.date), "MM/dd/yyyy")}</p>
                  </div>
                  <p className={`text-lg font-bold ${transaction.type === "Income" ? 'text-green-500' : 'text-red-500'}`}>
                    ${transaction.amount}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent transactions available.</p>
        )}
      </div>

    {/* Upcoming Recurring Payments */}
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 w-[48%] h-[400px]">
      <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Upcoming 5 Recurring Payments</h2>
      {upcomingPayments.length > 0 ? (
        <ul>
          {upcomingPayments.map((payment) => (
            <li key={payment.id} className="mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-white">{payment.name || "No Category"}</p>
                  <p className="text-sm text-gray-500">{format(new Date(payment.startDate), "MM/dd/yyyy")}</p>
                </div>
                <p className="text-lg font-bold text-red-500">${payment.amount}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming recurring payments available.</p>
      )}
    </div>
    </div>
  </div>
  );
};

export default Dashboard;
