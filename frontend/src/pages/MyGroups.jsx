import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_URL;
const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [umail, setUmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deletingGroupId, setDeletingGroupId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const fetchedGroup = await axios.get(`${API_URL}/view/group`, { withCredentials: true });
        setGroups(fetchedGroup.data.groups);
        setUmail(fetchedGroup.data.mail);
      } catch (err) {
        console.error('Error fetching groups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const calculateTotalExpenses = (expenses) => expenses.reduce((total, expense) => total + expense.amount, 0);
  const totalExpenses = groups.reduce((total, group) => total + group.expenses.length, 0);
  const totalAmount = groups.reduce((total, group) => total + calculateTotalExpenses(group.expenses), 0);

  const confirmDeleteGroup = (groupId) => {
    setGroupToDelete(groupId);
    setShowModal(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowModal(false);
    setDeletingGroupId(groupToDelete);

    setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/delete/group/${groupToDelete}`, { withCredentials: true });
        setGroups(prev => prev.filter(group => group._id !== groupToDelete));
      } catch (err) {
        console.error('Error deleting group:', err);
      } finally {
        setDeletingGroupId(null);
        setGroupToDelete(null);
      }
    }, 300); // Allow animation to play
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f0f4f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="relative group w-fit">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mt-2">
                My Groups
              </h1>
              <div className="absolute -bottom-1 left-0 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 w-1/2 group-hover:w-full"></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
              <StatCard label="Groups Joined" value={groups.length} color="indigo" />
              <StatCard label="Total Expenses" value={totalExpenses} color="purple" />
              <StatCard label="Total Amount" value={`₹${totalAmount}`} color="pink" />
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isAdmin = group.leader === umail;
            const isDeleting = deletingGroupId === group._id;

            return (
              <div
                key={group._id}
                className={`relative rounded-xl p-6 transition-all duration-300 ${
                  hoveredGroup === group._id
                    ? 'bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-102 z-10'
                    : 'bg-white/80 backdrop-blur-sm shadow-md hover:shadow-xl'
                } ${isDeleting ? 'animate-fadeOut' : ''}`}
                onMouseEnter={() => setHoveredGroup(group._id)}
                onMouseLeave={() => setHoveredGroup(null)}
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{group.name}</h2>
                    <p className="text-sm text-gray-500">
                      {group.expenses.length} expenses • ₹{calculateTotalExpenses(group.expenses)}
                    </p>
                  </div>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 3).map((member, i) => (
                      <Avatar key={i} member={member} leader={group.leader} />
                    ))}
                    {group.members.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                        +{group.members.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Group Details */}
                {hoveredGroup === group._id && (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    <MemberList members={group.members} leader={group.leader} />
                    <LastActivity expenses={group.expenses} />

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/mygroups/${group._id}`)}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all"
                      >
                        View Details
                      </button>

                      <div
                        onClick={() => isAdmin && confirmDeleteGroup(group._id)}
                        title={isAdmin ? "Delete group" : "Only admin can delete group"}
                        className={`p-2 rounded-lg transition-all ${
                          isAdmin
                            ? "cursor-pointer text-red-500 hover:bg-red-50"
                            : "cursor-not-allowed text-gray-400"
                        }`}
                      >
                        <Trash2 />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* No Groups Message */}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">You haven't joined any groups yet</div>
            <button
              onClick={() => navigate('/create/groups')}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-md transition-all"
            >
              Create New Group
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
            <div className="text-red-500 mb-4 animate-pulse text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Are you sure you want to delete this group?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This action is irreversible. All related data will be permanently deleted.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeleteConfirmed}
                className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); height: 0; margin: 0; padding: 0; }
        }

        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-out forwards; overflow: hidden; }
        .scale-102 { transform: scale(1.02); }
        `}
      </style>
    </div>
  );
};

// Reusable Components
const StatCard = ({ label, value, color }) => (
  <div className={`rounded-2xl bg-white shadow-lg px-5 py-4 flex flex-col justify-center items-center hover:scale-105 transition-transform`}>
    <span className={`text-xl font-bold text-${color}-600`}>{value}</span>
    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</span>
  </div>
);

const Avatar = ({ member, leader }) => (
  <div
    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
      member.email === leader
        ? 'ring-2 ring-yellow-400 bg-gradient-to-r from-amber-500 to-orange-500'
        : 'bg-gradient-to-r from-indigo-500 to-purple-500'
    }`}
  >
    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
  </div>
);

const MemberList = ({ members, leader }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-500 mb-1">Members</h3>
    <div className="space-y-2">
      {members.map((member) => (
        <div key={member.email} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs mr-2 ${
              member.email === leader
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="text-gray-700">
              {member.name}
              {member.email === leader && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Admin</span>
              )}
            </span>
          </div>
          <span className="text-xs text-gray-500 hidden sm:inline">{member.email}</span>
        </div>
      ))}
    </div>
  </div>
);

const LastActivity = ({ expenses }) => {
  if (expenses.length === 0) {
    return <p className="text-sm text-gray-400 py-2">No transactions yet</p>;
  }

  const latest = expenses[0];
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-500 mb-1">Last Activity</h3>
      <div className="py-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 font-medium">
              {latest.paidBy.name} paid ₹{latest.amount}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(latest.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            latest.splitType === 'EQUAL' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
          }`}>
            {latest.splitType}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Split between {latest.splits.length} members
        </div>
      </div>
    </div>
  );
};

export default MyGroups;
