import { useState } from 'react';

const LoanEligibility = () => {
  const [formData, setFormData] = useState({
    gender: '',
    married: '',
    dependents: '',
    education: '',
    selfEmployed: '',
    applicantIncome: '',
    coapplicantIncome: '',
    loanAmount: '',
    loanAmountTerm: '',
    creditHistory: '',
    propertyArea: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // backend call
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 my-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Loan Eligibility Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-200">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Married</label>
          <select name="married" value={formData.married} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Marital Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Dependents</label>
          <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Education</label>
          <select name="education" value={formData.education} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Education</option>
            <option value="Graduate">Graduate</option>
            <option value="Not Graduate">Not Graduate</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Self Employed</label>
          <select name="selfEmployed" value={formData.selfEmployed} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Employment Status</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Applicant Income</label>
          <input type="number" name="applicantIncome" value={formData.applicantIncome} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Coapplicant Income</label>
          <input type="number" name="coapplicantIncome" value={formData.coapplicantIncome} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Loan Amount</label>
          <input type="number" name="loanAmount" value={formData.loanAmount} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Loan Amount Term (months)</label>
          <input type="number" name="loanAmountTerm" value={formData.loanAmountTerm} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md" />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Credit History</label>
          <select name="creditHistory" value={formData.creditHistory} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Credit History</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200">Property Area</label>
          <select name="propertyArea" value={formData.propertyArea} onChange={handleChange} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
            <option value="">Select Area</option>
            <option value="Urban">Urban</option>
            <option value="Semiurban">Semiurban</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        <button type="submit" className="w-full p-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">
          Check Loan Eligibility
        </button>
      </form>
    </div>
  );
};

export default LoanEligibility;
