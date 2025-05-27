"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Users, UserPlus, X, Check, ArrowLeft, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const CreateGroup = () => {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState("")
  const [friends, setFriends] = useState([])
  const [addedFriends, setAddedFriends] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setIsLoading(true)
        const resp = await axios.get(`${API_URL}/view`, {
          withCredentials: true,
        })
        const { friends } = resp.data.user
        setFriends(friends)
      } catch (err) {
        console.error("Error fetching friends:", err)
        setError("Failed to load friends. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [])

  // Change the toggleFriend function to use email instead of _id
  const toggleFriend = (friend) => {
    setAddedFriends((prev) =>
      prev.some((f) => f.email === friend.email) ? prev.filter((f) => f.email !== friend.email) : [...prev, friend],
    )
  }

  const handleCreateGroup = async () => {
    console.log("Trying to send req to backend for creation of group")
    try {
      const resp = await axios.post(
        `${API_URL}/groups/create`,
        {
          name: groupName,
          members: addedFriends,
        },
        { withCredentials: true },
      )
      console.log("Group created", resp.data.insertedGroup)

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        setGroupName("")
      }, 1500)

      setAddedFriends([])
    } catch (err) {
      console.error("Error creating group:", err)
      setError("Failed to create group. Please try again.")
    }
  }

  const getInitials = (name) => {
    if (!name) return ""
    const parts = name.split(" ")
    return parts.map((part) => part[0]?.toUpperCase()).join("")
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 rounded-lg border border-red-100 shadow-md">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-red-700 text-center mb-2">Error</h3>
        <p className="text-red-600 text-center mb-4">{error}</p>
        <div className="flex justify-center">
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white p-4">
      <div className="max-w-2xl mx-auto pt-6 pb-12 font-['Poppins']">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full border-t-4 border-indigo-500"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 text-center">
                  Group Created!
                </div>
                <div className="text-gray-600 text-center">
                  Your group "<span className="font-semibold">{groupName}</span>" was successfully created
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="relative inline-block">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mb-2">
              Create New Group
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 w-full"></div>
          </div>
          <p className="text-gray-600 mt-2">Create a group to share expenses with friends</p>
        </div>

        {/* View My Groups Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => navigate("/mygroups")}
            className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors font-medium shadow-md border border-indigo-100 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            View My Groups
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          {/* Group Name Input */}
          <div className="mb-8">
            <label className="block text-gray-700 mb-2 font-medium">Group Name</label>
            <input
              type="text"
              placeholder="Enter group name (e.g., Weekend Trip, Roommates)"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-800"
            />
          </div>

          {/* Added Members */}
          {addedFriends.length > 0 && (
            <div className="mb-8 p-5 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Added Members ({addedFriends.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {addedFriends.map((friend) => (
                  <div
                    key={friend.email} // Change key from _id to email
                    className="flex items-center bg-white px-3 py-2 rounded-full shadow-sm border border-indigo-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold mr-2">
                      {getInitials(friend.name)}
                    </div>
                    <span className="mr-2 text-gray-700 text-sm">{friend.name}</span>
                    <button
                      onClick={() => toggleFriend(friend)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      aria-label="Remove friend"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
              <UserPlus className="mr-2 h-5 w-5 text-indigo-600" />
              Select Friends
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600 font-medium">You haven't added any friends yet</p>
                <p className="text-sm text-gray-500 mt-1">Add friends to create a group</p>
                <button
                  onClick={() => navigate("/friends")}
                  className="mt-4 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                >
                  Go to Friends Page
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                {friends.map((friend) => (
                  <div
                    key={friend.email} // Change key from _id to email
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      addedFriends.some((f) => f.email === friend.email) // Change from _id to email
                        ? "bg-purple-50 border border-purple-200"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold mr-3 flex-shrink-0">
                        {getInitials(friend.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate">{friend.name}</div>
                        <div className="text-xs text-gray-500 truncate">{friend.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFriend(friend)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        addedFriends.some((f) => f.email === friend.email)
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      aria-label={addedFriends.some((f) => f.email === friend.email) ? "Remove friend" : "Add friend"}
                    >
                      <span className="text-white font-bold">
                        {addedFriends.some((f) => f.email === friend.email) ? "−" : "+"}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || addedFriends.length === 0}
            className={`w-full py-4 px-4 rounded-xl font-bold text-white transition-colors ${
              !groupName.trim() || addedFriends.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md"
            }`}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateGroup
