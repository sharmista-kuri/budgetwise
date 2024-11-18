import  { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { format, addMonths, parse } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const categories = ["Food", "Housing", "Utilities", "Transportation", "Entertainment", "Recurring", "Miscellaneous", "Healthcare", "Savings", "Taxes"];

const months = Array.from({ length: 12 }, (_, index) => format(addMonths(new Date(), index), "MMMM yyyy"));

const ExpensePredictor = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [predictions, setPredictions] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Parse the selected month into a Date object
    const startDate = parse(selectedMonth, "MMMM yyyy", new Date());

    //dummy data
    const nextThreeMonths = [1, 2, 3].map(offset => ({
      month: format(addMonths(startDate, offset), "MMMM yyyy"),
      amount: parseFloat(amount) + (Math.random() * 100 - 50) 
    }));
    
    setPredictions(nextThreeMonths);
  };

  const lineChartData = {
    labels: predictions ? predictions.map(data => data.month) : [],
    datasets: [
      {
        label: `${selectedCategory} Expenses Prediction`,
        data: predictions ? predictions.map(data => data.amount) : [],
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.2)',
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#FFFFFF',
        },
        grid: {
          color: '#333333',
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
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Predicted Expenses</h1>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8">
        <label className="block text-white mb-2">Select Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full p-2 bg-gray-900 text-white rounded-md mb-4"
          required
        >
          <option value="">Select Month</option>
          {months.map((month, index) => (
            <option key={index} value={month}>{month}</option>
          ))}
        </select>

        <label className="block text-white mb-2">Select Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 bg-gray-900 text-white rounded-md mb-4"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>

        <label className="block text-white mb-2">Enter Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-gray-900 text-white rounded-md mb-4"
          placeholder="Amount"
          required
        />

        <button
          type="submit"
          className="w-full p-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
        >
          Predict
        </button>
      </form>

      {predictions && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-indigo-400 mb-4 text-center">Next 3 Months Expense Prediction</h2>
          <Line data={lineChartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default ExpensePredictor;
