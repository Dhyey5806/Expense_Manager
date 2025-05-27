"use client"

import { useState, useEffect, useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { User, LogOut, Users, UserPlus } from "lucide-react"
import Logo from "./Logo"
import axios from "axios"
import { toast } from "react-toastify"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const Navbar = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)

  const userMenuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/add", label: "Add Expense" },
    { path: "/update", label: "Update" },
    { path: "/view", label: "View" },
    { path: "/ai-analysis", label: "AI Analysis" },
  ]

  async function handleSignOut() {
    setShowUserMenu(false)
    try {
      const resp = await axios.get(`${API_URL}/signout`, { withCredentials: true })
      toast(resp.data.message)
      navigate("/login")
    } catch (err) {
      console.error("Error in signout", err)
    }
  }

  const activeClass =
    "text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold border-b-2 border-indigo-500"
  const inactiveClass = "text-gray-700 hover:text-indigo-600 transition-colors font-medium"

  return (
    <nav className="bg-white shadow-md border-b border-gray-100 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink to="/dashboard" className="flex items-center">
              <Logo />
            </NavLink>
          </div>

          {/* Nav Items - Desktop only */}
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `font-medium transition-colors py-2 px-1 ${isActive ? activeClass : inactiveClass}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Menu - Always visible */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
            >
              <User size={18} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                {/* Mobile view: Show all navItems */}
                <div className="block md:hidden border-b border-gray-100 pb-1 mb-1">
                  <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Navigation</div>
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                      onClick={() => setShowUserMenu(false)}
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                {/* Groups and Friends - All views */}
                <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Social</div>
                <NavLink
                  to="/create/groups"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Groups
                </NavLink>
                <NavLink
                  to="/friends"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Friends
                </NavLink>

                {/* Sign Out */}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
