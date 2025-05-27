"use client"

import { useState, useEffect } from "react"
import { UserPlus, Users, CheckCircle, PlusCircle, UserX, Heart, Sparkles, Star } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import { toast } from "react-toastify"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const Friends = () => {
  const [activeTab, setActiveTab] = useState("add")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [friends, setFriends] = useState([])
  const [showPopup, setShowPopup] = useState({ visible: false, type: "", friendName: "" })

  useEffect(() => {
    // Clear search state when switching tabs
    setSearchQuery("")
    setSearchResult(null)
    setHasSearched(false)
  }, [activeTab])

  useEffect(() => {
    async function getdata() {
      const resp = await axios.get(`${API_URL}/view`, { withCredentials: true })

      console.log("User found:", resp.data.user)
      const { friends } = resp.data.user
      setFriends(friends)
    }
    getdata()
  }, [])

  const handleSearch = async () => {
    setHasSearched(true)

    if (!searchQuery.trim()) {
      setSearchResult(null)
      return
    }

    try {
      const resp = await axios.get(`${API_URL}/user/find?mail=${searchQuery.trim()}`, {
        withCredentials: true,
      })

      if (resp.data.message === "You cant write your own mail :)") {
        toast(resp.data.message)
        return
      }
      console.log("User found:", resp.data.user)
      const { firstname, lastname, mail, friends } = resp.data.user
      const temp = {
        name: `${firstname} ${lastname}`,
        email: mail,
        avatar: `${firstname[0].toUpperCase()}${lastname[0].toUpperCase()}`,
      }

      setSearchResult(temp || null)
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("User not found on backend")
        setSearchResult(null)
      } else {
        console.error("Error fetching user:", error)
      }
    }
  }

  const handleAddFriend = async () => {
    if (!searchResult) return

    const isAlreadyFriend = friends.some((f) => f.email === searchResult.email)
    if (isAlreadyFriend) return

    try {
      const resp = await axios.post(
        `${API_URL}/add/friend`,
        { mail: searchResult.email, name: searchResult.name },
        { withCredentials: true },
      )
      setFriends((prev) => [...prev, { name: searchResult.name, email: searchResult.email }])
      setSearchResult(null)
      setSearchQuery("")
      setHasSearched(false)
      setShowPopup({ visible: true, type: "added", friendName: searchResult.name })

      setTimeout(() => setShowPopup({ visible: false, type: "", friendName: "" }), 1500)
    } catch (err) {
      console.error("Error while adding frined", err)
    }
  }

  const handleRemoveFriend = async (email, name) => {
    try {
      console.log("sending req to backend to delete..")
      const resp = await axios.delete(`${API_URL}/friend/delete/${email}`, { withCredentials: true })
      setFriends((prev) => prev.filter((friend) => friend.email !== email))
      setShowPopup({ visible: true, type: "removed", friendName: name })
      setTimeout(() => setShowPopup({ visible: false, type: "", friendName: "" }), 1500)
    } catch (err) {
      console.error("Failed to delete friend:", err.response?.data)
    }
  }

  const isAlreadyFriend = (email) => {
    console.log(`In frontend checking if ${email} is frined or not..`)
    return friends.some((f) => f.email === email)
  }

  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((part) => part[0]?.toUpperCase())
          .join("")
      : ""

  // Floating particles animation
  const FloatingParticle = ({ delay = 0, duration = 3 }) => (
    <motion.div
      className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-30"
      animate={{
        y: [-20, -100],
        x: [0, Math.random() * 100 - 50],
        opacity: [0, 0.6, 0],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        bottom: 0,
      }}
    />
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.5} duration={3 + Math.random() * 2} />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-indigo-300 to-purple-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        {/* Sparkle Effects */}
        <motion.div
          className="absolute top-1/3 right-1/4"
          animate={{
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: 2,
          }}
        >
          <Sparkles className="w-6 h-6 text-indigo-300 opacity-40" />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 left-1/4"
          animate={{
            scale: [0, 1, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: 1,
          }}
        >
          <Star className="w-4 h-4 text-purple-300 opacity-40" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto pt-8 pb-12 px-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 font-['Poppins'] mb-2">
              Friends Hub
            </h1>
            <motion.div
              className="absolute -top-2 -right-2"
              animate={{
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-500" fill="currentColor" />
            </motion.div>
          </div>
          <p className="text-gray-600 text-base md:text-lg">Connect, share, and split expenses with your squad! 🚀</p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("add")}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center shadow-lg ${
              activeTab === "add"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-200"
                : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200"
            }`}
          >
            <UserPlus className="mr-2" size={18} />
            <span>Find Friends</span>
            {activeTab === "add" && (
              <motion.div
                className="ml-2"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Sparkles size={14} />
              </motion.div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab("view")}
            className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center shadow-lg ${
              activeTab === "view"
                ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-purple-200"
                : "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200"
            }`}
          >
            <Users className="mr-2" size={18} />
            <span>My Squad ({friends.length})</span>
            {activeTab === "view" && friends.length > 0 && (
              <motion.div
                className="ml-2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
              >
                <Heart size={14} fill="currentColor" />
              </motion.div>
            )}
          </motion.button>
        </motion.div>

        {/* Add Friend Tab */}
        {activeTab === "add" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl border border-white/50"
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <div className="mr-3">🔍</div>
                Discover New Friends
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                Search by email and expand your expense-sharing circle!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-6">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter friend's email... ✨"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-base md:text-lg bg-white/70 backdrop-blur-sm"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center shadow-lg font-bold"
              >
                <span>Search</span>
                <span className="ml-2">🚀</span>
              </motion.button>
            </div>

            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-6 p-4 md:p-6 border-2 border-indigo-100 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg flex-shrink-0">
                      {searchResult.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-lg md:text-xl text-gray-800 truncate">{searchResult.name}</p>
                      <p className="text-xs md:text-sm text-gray-600 flex items-center truncate">
                        📧 {searchResult.email}
                      </p>
                    </div>
                  </div>

                  {isAlreadyFriend(searchResult.email) ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-2 bg-green-100 px-3 md:px-4 py-2 rounded-full border border-green-200 flex-shrink-0"
                    >
                      <CheckCircle className="text-green-500" size={16} />
                      <span className="text-xs md:text-sm text-green-700 font-bold whitespace-nowrap">
                        Already Besties! 💚
                      </span>
                    </motion.div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddFriend}
                      className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl hover:from-green-500 hover:to-green-700 transition-all flex items-center space-x-2 shadow-lg font-bold flex-shrink-0"
                    >
                      <PlusCircle size={16} />
                      <span className="text-sm">Add to Squad</span>
                      <span>🎉</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}

            {!searchResult && hasSearched && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 p-6 md:p-8 border-2 border-dashed border-gray-300 rounded-2xl text-center bg-gray-50"
              >
                <div className="text-4xl md:text-6xl mb-4">😔</div>
                <p className="text-gray-600 font-bold text-base md:text-lg mb-2">Oops! No friend found</p>
                <p className="text-sm text-gray-500">Double-check the email or invite them to join! 📧</p>
              </motion.div>
            )}

            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <div className="text-3xl md:text-4xl mb-3">🔍✨</div>
                <p className="text-gray-600 font-medium text-sm md:text-base">
                  Ready to find your expense-sharing buddies?
                </p>
                <p className="text-xs md:text-sm text-gray-500 mt-2">Type an email above and hit search! 🚀</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* View Friends Tab */}
        {activeTab === "view" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-xl border border-white/50"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                  <div className="mr-3">👥</div>
                  Your Squad ({friends.length})
                </h2>
                <p className="text-gray-600 text-sm md:text-base">Your awesome expense-sharing crew!</p>
              </div>
              {friends.length > 0 && <div className="text-xl md:text-2xl">🎉</div>}
            </div>

            {friends.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 md:py-16"
              >
                <div className="text-4xl md:text-6xl mb-6">😊</div>
                <p className="text-gray-600 font-bold text-lg md:text-xl mb-3">Your squad is waiting to be built!</p>
                <p className="text-gray-500 mb-6 text-sm md:text-base px-4">
                  Add friends to start sharing expenses and having fun together 🎊
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("add")}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 md:px-8 py-3 rounded-xl font-bold shadow-lg"
                >
                  Find Friends Now! 🚀
                </motion.button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend.email}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="p-4 md:p-5 border-2 border-gray-100 rounded-2xl bg-gradient-to-br from-white to-indigo-50 flex flex-col sm:flex-row sm:items-center sm:justify-between shadow-lg hover:shadow-xl transition-all space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg flex-shrink-0">
                        {getInitials(friend.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 text-base md:text-lg truncate">{friend.name}</p>
                        <p className="text-xs text-gray-600 flex items-center truncate">📧 {friend.email}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRemoveFriend(friend.email, friend.name)}
                      className="text-white bg-gradient-to-r from-red-400 to-red-500 px-3 md:px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg font-bold hover:from-red-500 hover:to-red-600 flex-shrink-0 w-full sm:w-auto"
                      title="Remove from squad"
                    >
                      <UserX size={14} />
                      <span className="text-sm">Remove</span>
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Success/Remove Popup */}
        <AnimatePresence>
          {showPopup.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.5, rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`bg-white p-6 md:p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border-t-4 ${
                  showPopup.type === "added" ? "border-green-500" : "border-red-500"
                }`}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: showPopup.type === "added" ? [0, 15, -15, 0] : [0, -15, 15, 0],
                  }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-6xl mb-4"
                >
                  {showPopup.type === "added" ? "🎉" : "👋"}
                </motion.div>
                <h3 className="font-bold text-xl md:text-2xl mb-2 text-gray-800">
                  {showPopup.type === "added" ? "Squad Member Added!" : "Friend Removed"}
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                  <span className="font-semibold">{showPopup.friendName}</span>{" "}
                  {showPopup.type === "added" ? "joined your squad! 🚀" : "left your squad 😢"}
                </p>
                <div className="mt-4 text-xl md:text-2xl">{showPopup.type === "added" ? "💚" : "💔"}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Friends
