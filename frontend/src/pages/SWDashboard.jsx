import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);
  const [friendsBalance, setFriendsBalance] = useState([]);

  useEffect(() => {
    const fetchExpensesAndFriends = async () => {
      if (!user) return;

      const expensesRef = collection(db, 'expenses');
      const snapshot = await getDocs(expensesRef);

      let totalOwedAmount = 0;
      let totalOweAmount = 0;
      const balanceByFriend = {};

      snapshot.forEach((doc) => {
        const expense = doc.data();
        const { createdBy, payers } = expense;

        payers.forEach((payer) => {
          if (payer.userId === user.uid && !payer.settled) {
            if (createdBy !== user.uid) {
              totalOweAmount += payer.share;
              balanceByFriend[createdBy] = (balanceByFriend[createdBy] || 0) - payer.share;
            }
          } else if (createdBy === user.uid && payer.userId !== user.uid && !payer.settled) {
            totalOwedAmount += payer.share;
            balanceByFriend[payer.userId] = (balanceByFriend[payer.userId] || 0) + payer.share;
          }
        });
      });

      setTotalOwed(totalOwedAmount);
      setTotalOwe(totalOweAmount);

      // Fetch friends' names based on friend IDs in balanceByFriend

      const friendIds = Object.keys(balanceByFriend);
      if(friendIds.length >0){
      const friendsRef = collection(db, 'users');
      const friendsSnapshot = await getDocs(query(friendsRef, where('userId', 'in', friendIds)));

      const balanceList = friendsSnapshot.docs.map(doc => {
        const friendData = doc.data();
        return {
          friendId: friendData.userId,
          friendName: friendData.displayName,
          balance: balanceByFriend[friendData.userId],
        };
      });

      
      setFriendsBalance(balanceList);
    }
      setLoading(false);
    };

    fetchExpensesAndFriends();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="flex  gap-4 mb-8">
        <div className="bg-green-100 p-4 rounded shadow w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-green-600">Total Owed to You</h3>
          <p className="text-2xl">${totalOwed.toFixed(2)}</p>
        </div>
        <div className="bg-red-100 p-4 rounded shadow w-full md:w-1/2">
          <h3 className="text-xl font-semibold text-red-600">Total You Owe</h3>
          <p className="text-2xl">${totalOwe.toFixed(2)}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 text-white">Friends Balances</h3>
      <ul className="bg-white shadow rounded-lg p-4 space-y-4">
        {Object.keys(friendsBalance).length>0 ? friendsBalance.map((friend) => (
          <li key={friend.friendId} className="flex justify-between py-2 border-b last:border-0">
            <span className="font-medium">{friend.friendName}</span>
            <span
              className={`font-semibold ${
                friend.balance > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {friend.balance > 0 ? `Owes you $${friend.balance.toFixed(2)}` : `You owe $${Math.abs(friend.balance).toFixed(2)}`}
            </span>
          </li>
        )): "Every one is settled for now"}
      </ul>
    </div>
  );
};

export default Dashboard;
