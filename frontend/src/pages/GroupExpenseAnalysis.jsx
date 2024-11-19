import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { fetchGroupExpenseDetails } from "../services/firestoreService";

const GroupExpenseAnalysis = () => {
  const [userId, setUserId] = useState(null); // To store authenticated user's ID
  const [groupwiseExpenses, setGroupwiseExpenses] = useState([]); // To store fetched group expenses
  const [predictions, setPredictions] = useState([]); // To store prediction results
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error state

  // Authenticate user and set the user ID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set user ID if authenticated
      } else {
        setUserId(null); // Clear user ID if not authenticated
        console.warn("No user authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch group expenses when userId is available
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        if (!userId) {
          console.warn("No user ID found");
          return;
        }
        console.log("Fetching groupwise expenses for userId:", userId);

        // Replace with your `fetchGroupwiseExpenses` implementation
        const expensesResponse = await fetchGroupExpenseDetails(userId);

        if (expensesResponse && expensesResponse.data) {
          setGroupwiseExpenses(expensesResponse.data);
        } else {
          console.warn("No expenses found for the user.");
        }
      } catch (error) {
        console.error("Error fetching groupwise expenses:", error);
        setError("Failed to fetch group expenses. Please try again later.");
      }
    };

    if (userId) {
      fetchExpenses();
    }
  }, [userId]);

  // Fetch predictions when group expenses are available
  useEffect(() => {
    const fetchPredictions = async () => {
      console.log(groupwiseExpenses);
      if (!groupwiseExpenses || groupwiseExpenses.length === 0) {
        console.warn("No expenses available for prediction.");
        return;
      }

      try {
        setLoading(true);
        const payload = { data: groupwiseExpenses };
        console.log("Payload to API:", payload);
        const response = await axios.post("http://52.91.96.86:8000/api/predict-anomalies/", {
          data: groupwiseExpenses,
        });

        if (response.data && response.data.predictions) {
          setPredictions(response.data.predictions);
        } else {
          console.warn("Prediction API returned no results.");
          setPredictions([]);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setError("Failed to fetch predictions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (groupwiseExpenses.length > 0) {
      fetchPredictions();
    }
  }, [groupwiseExpenses]);

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Group Expense Analysis</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {groupwiseExpenses.length > 0 && predictions.length > 0 ? (
            <ul>
              {groupwiseExpenses.map((expense, index) => (
                <li
                  key={index}
                  className={`p-4 mb-2 rounded-md ${
                    predictions[index] === -1
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  <p>
                    <strong>Category:</strong> {expense.Category}
                  </p>
                  <p>
                    <strong>Total Expense:</strong> {expense["Total Expense"]}
                  </p>
                  <p>
                    <strong>Group Size:</strong> {expense["Group Size"]}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {predictions[index] === -1
                      ? "Anomalous Expense"
                      : "Normal Expense Pattern"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available for analysis.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupExpenseAnalysis;
