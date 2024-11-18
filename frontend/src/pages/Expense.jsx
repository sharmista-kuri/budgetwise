import { useState, useEffect } from 'react';
import AddExpenseCard from '../components/AddExpenseCard';
import { db } from '../firebase';
import { collection, query, where, getDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Expenses = () => {
  const [user] = useAuthState(auth);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showAddExpenseCard, setShowAddExpenseCard] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchExpenses = async () => {
      const expensesRef = collection(db, 'expenses');
      const expenseQuery = query(expensesRef, where('payerIds', 'array-contains', user.uid));
      const snapshot = await getDocs(expenseQuery);
      const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(fetchedExpenses);
      setLoading(false);
    };

    fetchExpenses();
  }, [user]);

  const handleSettle = async (expenseId, userId) => {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      const expenseDoc = await getDoc(expenseRef);

      if (expenseDoc.exists()) {
        const expenseData = expenseDoc.data();
        const updatedPayers = expenseData.payers.map(payer =>
          payer.userId === userId ? { ...payer, settled: true } : payer
        );

        await updateDoc(expenseRef, {
          payers: updatedPayers,
        });

        console.log('Expense settled successfully.');
      }
      setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.id === expenseId
            ? {
                ...expense,
                payers: expense.payers.map(payer =>
                  payer.userId === userId ? { ...payer, settled: true } : payer
                ),
              }
            : expense
        )
      );
    } catch (error) {
      console.error('Error settling expense:', error);
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddExpenseCard(true);
  };

  const handleSaveExpense = (updatedExpense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setShowAddExpenseCard(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Your Activity</h2>
      <div className='w-[80%] justify-center ml-[150px]'>
        <ul>
          {expenses.map((expense) => {
            const hasSettled = expense.payers.some((payer) => payer.settled);

            return (
              <li key={expense.id} className="mb-4 p-4 bg-white shadow rounded-lg">
                <h3 className="text-lg font-semibold">{expense.description}</h3>
                <p>Amount: ${expense.amount}</p>
                {/* <p>Date: {expense.date || 'N/A'}</p> Display the date */}
                <p>Created By: {expense.createdBy === user.uid ? 'You' : expense.createdByName}</p>

                <h4 className="mt-2 font-semibold">Participants:</h4>
                <ul>
                  {expense.payers.map((payer) => (
                    <li key={payer.userId} className="flex justify-between">
                      <span>{payer.name}</span>
                      <span>
                        {payer.settled ? (
                          <span className="text-green-600">Settled</span>
                        ) : (
                          <>
                            <span className="text-red-600">Owes ${payer.share}</span>
                            {payer.userId === user.uid && (
                              <button
                                onClick={() => handleSettle(expense.id, payer.userId)}
                                className="ml-2 text-blue-600 underline"
                              >
                                Settle
                              </button>
                            )}
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {(!hasSettled && expense.createdBy === user.uid) && (
                  <button
                    onClick={() => handleEditExpense(expense)}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Edit Expense
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {showAddExpenseCard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddExpenseCard
            editingExpense={editingExpense}
            onSave={handleSaveExpense}
            onClose={() => setShowAddExpenseCard(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Expenses;
