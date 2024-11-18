"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";

export default function Friends() {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  

  useEffect(() => {
    if (user) {
      const loadFriends = async () => {
        // Fetch user data including friends array
        const userDoc = await fetchData("users", user.uid);
        setUserData(userDoc[0]);

        if (userDoc[0]?.friends) {
          setFriends(userDoc[0].friends); // Set friends from user data
        }

        // Fetch pending friend requests
        const requestsData = await fetchPendingFriendRequests(user.uid);
        setRequests(requestsData);

        setLoading(false);
      };

      loadFriends();
    }
  }, [user]);

  const fetchPendingFriendRequests = async (userId) => {
    const requestsRef = collection(db, "friendRequests");
    const q = query(requestsRef, where("toUserId", "==", userId), where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchTerm) return;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("displayName", "==", searchTerm));
    const snapshot = await getDocs(q);

    const results = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((result) => !friends.some((friend) => friend.friendId === result.id));

    setSearchResults(results);
  };

  const handleAddFriendRequest = async (friendId, friendName) => {
    const requestRef = collection(db, "friendRequests");
    await addDoc(requestRef, {
      fromUserId: user.uid,
      fromUserName: userData.displayName,
      toUserId: friendId,
      toUserName: friendName,
      status: "pending",
    });

    setSearchResults(searchResults.filter((result) => result.id !== friendId));
  };

  const handleAcceptRequest = async (requestId, requesterId, requesterName) => {
    // Add each user to the other's friends array
    const userRef = doc(db, "users", user.uid);
    const requesterRef = doc(db, "users", requesterId);

    await updateDoc(userRef, {
      friends: arrayUnion({ friendId: requesterId, friendName: requesterName }),
    });

    await updateDoc(requesterRef, {
      friends: arrayUnion({ friendId: user.uid, friendName: userData.displayName }),
    });

    // Update friend request status to accepted
    const requestDoc = doc(db, "friendRequests", requestId);
    await updateDoc(requestDoc, { status: "accepted" });

    setRequests(requests.filter((request) => request.id !== requestId));
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    const userRef = doc(db, "users", user.uid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
      friends: arrayRemove({ friendId, friendName }),
    });

    await updateDoc(friendRef, {
      friends: arrayRemove({ friendId: user.uid, friendName: userData.displayName }),
    });

    setFriends(friends.filter((friend) => friend.friendId !== friendId));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="relative">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-extrabold text-center text-indigo-400 mt-8 mb-6"
        >
          <span className="text-white text-6xl">Manage Your</span> <span className="text-6xl">Friends 👥</span>
        </motion.h1>

        {/* Search Bar */}
        <div className="flex justify-center mt-4">
          <input
            type="text"
            placeholder="Search for users..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 rounded-md w-1/2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
          />
          <button
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md ml-2"
          >
            Search
          </button>
        </div>
        

        {/* Search Results */}4
        {searchResults.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold text-center text-indigo-600">Search Results</h2>
            <ul className="max-w-2xl mx-auto w-full gap-4 mt-4">
              {searchResults.map((result) => (
                <motion.div
                  key={result.id}
                  className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{result.displayName}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">{result.email}</p>
                  </div>
                  <button
                    onClick={() => handleAddFriendRequest(result.id, result.displayName)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Add Friend
                  </button>
                </motion.div>
              ))}
            </ul>
          </div>
        )}

        {/* Friend Requests */}
        {requests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-center text-indigo-600">Friend Requests</h2>
            <ul className="flex flex-col max-w-2xl mx-auto w-full gap-4 mt-4">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl"
                >
                  <div>
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{request.fromUserName}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400">Request from {request.fromUserName}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptRequest(request.id, request.fromUserId, request.fromUserName)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
                  >
                    Accept
                  </button>
                </motion.div>
              ))}
            </ul>
          </div>
        )}

        {/* Friends List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-center text-indigo-600">Your Friends</h2>
          <ul className="flex flex-col max-w-2xl mx-auto w-full gap-4 mt-4">
            {friends.map((friend) => (
              <motion.div
                key={friend.friendId}
                className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl"
              >
                <div>
                  <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{friend.friendName}</h3>
                </div>
                <button
                  onClick={() => handleRemoveFriend(friend.friendId, friend.friendName)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                >
                  Remove Friend
                </button>
              </motion.div>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
