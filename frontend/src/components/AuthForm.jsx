"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react"
import Logo from "./Logo"
import axios from "axios"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const AuthForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isLogin = location.pathname === "/login"

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = "First name is required"
      }

      if (!formData.lastName) {
        newErrors.lastName = "Last name is required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)

      try {
        const baseUrl = `${API_URL}`
        let response

        if (isLogin) {
          response = await axios.post(
            `${baseUrl}/login`,
            {
              mail: formData.email,
              password: formData.password,
            },
            { withCredentials: true },
          )
          if (response.data === "Login successful") {
            navigate("/")
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, form: response.data }))
            setTimeout(() => {
              setErrors((prevErrors) => {
                const { form, ...rest } = prevErrors
                return rest
              })
            }, 3000)
          }
        } else {
          response = await axios.post(
            `${baseUrl}/signup`,
            {
              firstname: formData.firstName,
              lastname: formData.lastName,
              mail: formData.email,
              password: formData.password,
            },
            { withCredentials: true },
          )
          if (response.data === "User Created Login Again") {
            setErrors((prevErrors) => ({ ...prevErrors, form: response.data }))
            setTimeout(() => {
              setErrors((prevErrors) => {
                const { form, ...rest } = prevErrors
                return rest
              })
            }, 3000)
            navigate("/login")
          } else {
            setErrors((prevErrors) => ({ ...prevErrors, form: response.data }))
            setTimeout(() => {
              setErrors((prevErrors) => {
                const { form, ...rest } = prevErrors
                return rest
              })
            }, 3000)
          }
        }

        console.log("Server Response:", response.data)
      } catch (error) {
        console.error("Error during authentication:", error.response?.data || error.message)
        setErrors({ form: error.response?.data?.message || "Something went wrong" })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const toggleAuthMode = () => {
    setErrors((prevErrors) => {
      const { form, ...rest } = prevErrors
      return rest
    })
    navigate(isLogin ? "/signup" : "/login", {
      state: { direction: isLogin ? "right" : "left" },
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
            {isLogin ? "Welcome Back!" : "Join ExpenseManager"}
          </h2>
          <p className="text-gray-600">
            {isLogin ? "Sign in to manage your expenses" : "Start tracking your expenses today"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Error */}
          {errors.form && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium animate-in fade-in-0 slide-in-from-top-2 duration-300">
              {errors.form}
            </div>
          )}

          {/* Name Fields - Only for signup */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-indigo-500" />
                  </div>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                      errors.firstName ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Dhyey"
                  />
                </div>
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                      errors.lastName ? "border-red-300 bg-red-50" : "border-gray-200"
                    }`}
                    placeholder="Upadhyay"
                  />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.lastName}</p>}
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-5 w-5 text-indigo-500" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                  errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="dhyey@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-purple-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-gray-50/50 hover:bg-white ${
                  errors.password ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                isSubmitting ? "opacity-70 cursor-not-allowed transform-none" : ""
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                  <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  {isLogin ? "Sign In" : "Create Account"}
                </div>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={toggleAuthMode}
            className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold"
          >
            {isLogin ? "New to ExpenseManager? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
