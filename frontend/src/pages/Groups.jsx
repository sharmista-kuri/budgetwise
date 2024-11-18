import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createData } from "../services/firestoreService";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { collection, getDoc, doc, getDocs, query, where } from "firebase/firestore";

export default function Groups() {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]); // Holds only the user's friends
  const [showAddForm, setShowAddForm] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [formGroup, setFormGroup] = useState({
    groupName: "",
    description: "",
    members: [],
    memberIds:[]
  });

  useEffect(() => {
    if (user) {
      const loadGroupsAndFriends = async () => {
        // Fetch groups where the user is a member
        const groupData = await fetchUserGroups();
        setGroups(groupData);

        // Fetch friends of the current user
        const friendsData = await fetchUserFriends();
        setFriends(friendsData);
        setLoading(false);
      };

      loadGroupsAndFriends();
    }
  }, [user]);

  // Fetch groups where the user is a member
  const fetchUserGroups = async () => {
    const groupsRef = collection(db, "groups");
    const q = query(groupsRef, where("memberIds", "array-contains", user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  // Fetch friends of the current user
  const fetchUserFriends = async () => {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserName(userData.displayName);
      return userData.friends.map(friend => ({
        id: friend.friendId,
        displayName: friend.friendName,
      }));
    }
    return [];
  };

  const handleShowAddForm = () => setShowAddForm(!showAddForm);

  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setFormGroup(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberSelection = (e) => {
    const selectedFriendId = e.target.value;
    const selectedFriend = friends.find(friend => friend.id === selectedFriendId);
    if (selectedFriend && !formGroup.members.some(member => member.id === selectedFriendId)) {
      setFormGroup(prev => ({
        ...prev,
        members: [...prev.members, { id: selectedFriendId, name: selectedFriend.displayName }],
        memberIds: [...prev.memberIds, selectedFriendId]
      }));
    }
  };

  const removeMember = (memberId) => {
    setFormGroup(prev => ({
      ...prev,
      members: prev.members.filter(member => member.id !== memberId),
    }));
  };

  const handleAddGroup = async () => {
    
    const updatedFormGroup = {
      ...formGroup,
      members: [...formGroup.members, { id: user.uid, name: userName }],
      memberIds: [...formGroup.memberIds, user.uid],
    };
   
    setFormGroup(updatedFormGroup);

    await createData("groups", updatedFormGroup, user.uid);

    setGroups([...groups, updatedFormGroup]);

    setFormGroup({ groupName: "", description: "", members: [] });
    setShowAddForm(false);
};


  const handleGroupClick = (group) => {
    setGroupDetails(group);
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
          <span className="text-white text-6xl">Manage Your</span> <span className="text-6xl">Groups 👥</span>
        </motion.h1>

        {/* Add Group Button */}
        <div className="flex justify-end">
          <button
            onClick={handleShowAddForm}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md"
          >
            {showAddForm ? "Cancel" : "Add Group"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden">
              <div className="p-6">
                <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">Add New Group</motion.h3>
                <form className="space-y-4 mt-4">
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Group Name</label>
                    <input
                      type="text"
                      name="groupName"
                      value={formGroup.groupName}
                      onChange={handleGroupChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Description</label>
                    <input
                      type="text"
                      name="description"
                      value={formGroup.description}
                      onChange={handleGroupChange}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 dark:text-neutral-400">Add Members</label>
                    <select
                      onChange={handleMemberSelection}
                      className="w-full p-2 bg-gray-900 text-white rounded-md"
                    >
                      <option value="">Select a friend</option>
                      {friends.map(friend => (
                        <option key={friend.id} value={friend.id}>
                          {friend.displayName}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      {formGroup.members.map(member => (
                        <span key={member.id} className="inline-flex items-center bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-3 py-1 rounded-md mr-2">
                          {member.name}
                          <button onClick={() => removeMember(member.id)} className="ml-2 text-red-500 font-bold">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={handleShowAddForm}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-600 text-white"
                  >
                    Save Group
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      <ul className="max-w-2xl mx-auto w-full flex flex-col gap-4 mt-6">
        {groups.map(group => (
          <motion.div
            key={group.id}
            onClick={() => handleGroupClick(group)}
            className="p-4 flex justify-between items-center bg-gray-100 dark:bg-gray-800 rounded-xl cursor-pointer"
          >
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">{group.groupName}</h3>
              <p className="text-neutral-600 dark:text-neutral-400">{group.description}</p>
            </div>
          </motion.div>
        ))}
      </ul>

      {/* Group Details Card */}
      {groupDetails && (
        <div className="fixed inset-0 grid place-items-center z-[100]">
          <motion.div className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden p-6">
            <motion.h3 className="font-bold text-neutral-700 dark:text-neutral-200">{groupDetails.groupName}</motion.h3>
            <p className="text-neutral-600 dark:text-neutral-400">{groupDetails.description}</p>
            <h4 className="mt-4 font-semibold text-neutral-700 dark:text-neutral-200">Members:</h4>
            <ul>
              {groupDetails.members.map(member => (
                <li key={member.id} className="text-neutral-800 dark:text-neutral-200">
                  {member.name}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setGroupDetails(null)}
              className="mt-6 px-4 py-2 text-sm rounded-full font-bold bg-red-600 text-white"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
