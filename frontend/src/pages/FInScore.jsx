import  { useState, useEffect } from "react";
import { motion } from "framer-motion";

const FinScore = () => {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0); // For animated pointer

  const calculateScore = (totalIncome, totalExpenses, totalSavings) => {
    if(totalIncome== 0) return 0;
    const savingsRate = totalIncome ? totalSavings / totalIncome : 0;
    const expenseRate = totalIncome ? totalExpenses / totalIncome : 0;
    const savingsToExpenseRatio = totalExpenses ? totalSavings / totalExpenses : 0;

    const savingsRateScore = savingsRate * 100;
    const expenseRateScore = (1 - expenseRate) * 100;
    const savingsToExpenseScore = savingsToExpenseRatio * 100;

    let finalScore = 
      (savingsRateScore * 0.4) +
      (expenseRateScore * 0.35) +
      (savingsToExpenseScore * 0.25);
    finalScore = Math.round(finalScore);
      finalScore = Math.min(100, Math.max(0, finalScore));
    return finalScore;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const calculatedScore = calculateScore(income, expenses, income-expenses);
    setScore(calculatedScore);
  };

 
  useEffect(() => {
    // Animate pointer movement when score changes
    setDisplayScore(score);
  }, [score]);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-6xl font-bold text-center mb-6 text-white">Financial Health Score</h2>

      {/* Form for Income and Expenses */}
      <form onSubmit={handleCalculate} className="flex flex-col items-center mb-[100px]">
        <div className="flex gap-5">
        <div className="mb-4">
          <label className="block text-gray-700">Income</label>
          <input
            type="number"
            value={income}
            placeholder="0"
            onChange={(e) => setIncome((e.target.value))}
            className="p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Expenses</label>
          <input
            type="number"
            value={expenses}
            placeholder="0"
            onChange={(e) => setExpenses((e.target.value))}
            className="p-2 border rounded-md"
            required
          />
        </div>
        </div>
        <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md">
          Calculate Score
        </button>
      </form>

      {/* Score Bar with Description */}
      <div className=" relative  w-full h-10 rounded-full  bg-gray-200">
        {/* Background gradient for the score ranges */}
        <div className="absolute w-full h-full bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 opacity-80 rounded-full"></div>

        {/* Range Labels */}
        <div className="flex justify-between px-4 text-white font-semibold absolute w-full top-full mt-2 text-xs">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
          <span>70</span>
          <span>80</span>
          <span>90</span>
          <span>100</span>
        </div>

        {/* Financial Health Descriptions */}
        <div className="flex justify-between absolute w-full text-xs font-semibold text-center text-white -top-8">
          <span className="w-1/3 text-orange-500">Financially Vulnerable</span>
          <span className="w-1/3 text-purple-500">Financially Coping</span>
          <span className="w-1/3 text-blue-500">Financially Healthy</span>
        </div>

        {/* Animated Pointer */}
        <motion.div
          className="absolute top-0 w-6 h-6 bg-white rounded-full transform -translate-y-1/2"
          initial={{ left: "0%" }}
          animate={{ left: `${displayScore==100 ? displayScore-3 : displayScore}%` }}
          transition={{ duration: 1 }}
        >
          <span className="text-white text-xl font-bold absolute left-1/2 transform -translate-x-1/2 -translate-y-6">
            {score}
          </span>
        </motion.div>
      </div>

      {/* Score Interpretation */}
      <div className="text-center mt-12 text-2xl">
        <span className="text-white mr-2">Result:</span>
        {score < 40 && <span className="text-orange-500">Financially Vulnerable</span>}
        {score >= 40 && score < 80 && <span className="text-purple-500">Financially Coping</span>}
        {score >= 80 && <span className="text-blue-500">Financially Healthy</span>}
      </div>
    </div>
  );
};

export default FinScore;
