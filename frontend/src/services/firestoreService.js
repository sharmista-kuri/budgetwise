
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc,limit,arrayRemove, arrayUnion } from "firebase/firestore";
import { db,auth } from "../firebase"; 
import { format,subMonths } from "date-fns"; 


export const fetchData = async (resourceName, userId) => {
  const dataCollection = collection(db, resourceName);
  const q = query(dataCollection, where("userId", "==", userId)); 
  const snapshot = await getDocs(q);
  const dataList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return dataList;
};


export const createData = async (resourceName, formData, userId) => {
  try {
    const dataCollection = collection(db, resourceName);
    const docRef = await addDoc(dataCollection, { ...formData, userId }); 
    return docRef.id; 
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};


export const editData = async (resourceName, docId, updatedData) => {
  try {
    const docRef = doc(db, resourceName, docId);
    await updateDoc(docRef, updatedData); 
  } catch (error) {
    console.error("Error updating document: ", error);
  }
};


export const deleteData = async (resourceName, docId) => {
  try {
    const docRef = doc(db, resourceName, docId);
    await deleteDoc(docRef);
    console.log(`Document with ID ${docId} deleted successfully`);
  } catch (error) {
    console.error("Error deleting document: ", error);
  }
};

export const fetchTransactionsByMonth = async (userId, month) => {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
  
    
    const monthTransactions = snapshot.docs
      .map(doc => doc.data())
      .filter(transaction => format(new Date(transaction.date), "MM-yyyy") === month);
  
    return monthTransactions;
  };


export const checkCategoryLimits = (transactions, categories) => {
    const alerts = [];
  
    categories.forEach((category) => {
      const categoryTransactions = transactions.filter(
        (transaction) => transaction.category === category.name
      );
  
      const totalExpense = categoryTransactions.reduce((acc, transaction) => acc + transaction.amount, 0);
  
      if (totalExpense >= 0.8 * category.limit) { 
        alerts.push(`You are approaching the limit for ${category.name}.`);
      }
    });
  
    return alerts;
  };
  
  export const fetchRecentTransactions = async (userId) => {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", userId), limit(5));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };
  

  export const fetchExpensesByCategory = async (userId,monthYear) => {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", userId) ,where('monthYear', '==', monthYear));
    const snapshot = await getDocs(q);
  
    
    const expensesByCategory = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!expensesByCategory[data.category]) {
        expensesByCategory[data.category] = 0;
      }
      expensesByCategory[data.category] += parseInt(data.amount);
    });
  
    
    const sortedExpenses = Object.entries(expensesByCategory).map(([category, total]) => ({
      category,
      total
    })).sort((a, b) => b.total - a.total);
  
    return sortedExpenses;
  };

  export const fetchUpcomingRecurringPayments = async (userId) => {
    const recurringPaymentsRef = collection(db, "recurringPayments");
    const q = query(
      recurringPaymentsRef,
      where("userId", "==", userId), 
      limit(5)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  export const fetchIncomesByCategory = async (userId, monthYear) => {
    try {
      const incomesRef = collection(db, 'incomes');
      const q = query(incomesRef, where('userId', '==', userId), where('monthYear', '==', monthYear));
      const snapshot = await getDocs(q);
  
      
      const incomeByCategory = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const { category, amount } = data;
  
        if (incomeByCategory[category]) {
          incomeByCategory[category] += parseInt(amount);
        } else {
          incomeByCategory[category] = parseInt(amount);
        }
      });
  
      return Object.keys(incomeByCategory).map((category) => ({
        category,
        total: incomeByCategory[category],
      }));
    } catch (error) {
      console.error('Error fetching incomes by category: ', error);
      return [];
    }
  };

  export const fetchIncomesByMonth  = async (userId, monthYear) => {
    try {
      const incomesRef = collection(db, 'incomes');
      const q = query(incomesRef, where('userId', '==', userId), where('monthYear', '==', monthYear));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc =>({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching incomes by category: ', error);
      return [];
    }
  };
  export const fetchExpensessByMonth  = async (userId, monthYear) => {
    try {
      const incomesRef = collection(db, 'transactions');
      const q = query(incomesRef, where('userId', '==', userId), where('monthYear', '==', monthYear));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc =>({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching incomes by category: ', error);
      return [];
    }
  };

  const getPastFiveMonths = (monthYear) => {
    const [month, year] = monthYear.split('-').map(Number);
    const startDate = new Date(year, month - 1); 
  
    return Array.from({ length: 5 }, (_, i) =>
      format(subMonths(startDate, i), 'MM-yyyy')
    ).reverse();
  };
  

  export const fetchPastMonthsExpenses = async (userId, monthYear) => {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
  
      const pastMonths = getPastFiveMonths(monthYear);
      const expenseByMonth = {};
  
      // Initialize expenseByMonth with past 5 months
      pastMonths.forEach((month) => {
        expenseByMonth[month] = 0;
      });
  
      // Group expenses by month
      snapshot.forEach((doc) => {
        const data = doc.data();
        const { amount, date } = data;
        const expenseMonthYear = format(new Date(date), 'MM-yyyy');
  
        if (expenseByMonth[expenseMonthYear] !== undefined) {
          expenseByMonth[expenseMonthYear] += parseFloat(amount);
        }
      });
  
      
      return pastMonths.map((month) => expenseByMonth[month]);
    } catch (error) {
      console.error('Error fetching past expenses: ', error);
      return [];
    }
  };
  

  export const fetchPastMonthsIncome = async (userId, monthYear) => {
    try {
      const incomesRef = collection(db, 'incomes');
      const q = query(incomesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
  
      const pastMonths = getPastFiveMonths(monthYear);
      const incomeByMonth = {};
  
      
      pastMonths.forEach((month) => {
        incomeByMonth[month] = 0;
      });
  
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const { amount, date } = data;
        const incomeMonthYear = format(new Date(date), 'MM-yyyy');
  
        if (incomeByMonth[incomeMonthYear] !== undefined) {
          incomeByMonth[incomeMonthYear] += parseFloat(amount);
        }
      });
  
      return pastMonths.map((month) => incomeByMonth[month]);
    } catch (error) {
      console.error('Error fetching past income: ', error);
      return [];
    }
  };

  export const fetchUsersExceptCurrent = async () => {
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userId', '!=', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching users: ", error);
      return [];
    }
  };
  
  export const fetchGroups = async (userId) => {
    try {
      const groupsRef = collection(db, 'groups');
      const q = query(groupsRef, where('memberIds', 'array-contains', userId));
      const snapshot = await getDocs(q);
  
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching groups: ", error);
      return [];
    }
  };

  export const settleExpense = async (expenseId, userId) => {
    const expenseRef = doc(db, 'expenses', expenseId);
    
    // Mark the user as settled in the expense document
    await updateDoc(expenseRef, {
      payers: arrayUnion({ userId, settled: true })
    });
  
    // Alternatively, if using structured data, locate the user entry in payers array and update only their status.
  };
  
  export const fetchAllExpensesByCategory = async (userId) => {
    const transactionsRef = collection(db, "transactions");
    const q = query(transactionsRef, where("userId", "==", userId)); // Only filter by userId
  
    try {
      const snapshot = await getDocs(q);
      const expensesByMonth = {};
  
      // Process each transaction to categorize by month and category
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const transactionMonth = format(new Date(data.date), "MM-yyyy");
  
        // Initialize the month if not already present
        if (!expensesByMonth[transactionMonth]) {
          expensesByMonth[transactionMonth] = {
            Food: 0,
            Housing: 0,
            Utilities: 0,
            Transportation: 0,
            Entertainment: 0,
            "Recurring Payments": 0,
            Miscellaneous: 0,
            Healthcare: 0,
            Savings: 0,
            Taxes: 0,
          };
        }
  
        // Add the expense to the relevant category within the month
        if (expensesByMonth[transactionMonth][data.category] !== undefined) {
          expensesByMonth[transactionMonth][data.category] += parseFloat(data.amount);
        }
      });
  
      // Convert the result into an array of arrays sorted by month
      const sortedMonths = Object.keys(expensesByMonth).sort((a, b) => new Date(a) - new Date(b));
      const formattedData = sortedMonths.map(month => Object.values(expensesByMonth[month]));
  
      return { data: formattedData };
    } catch (error) {
      console.error("Error fetching expenses by category and month:", error);
      return { data: [] };
    }
  };