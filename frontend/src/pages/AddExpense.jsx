"use client"

import { useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import { CalendarIcon, Tag, FileText, Sparkles, IndianRupee, CheckCircle, AlertCircle, Info } from "lucide-react"
import { format } from "date-fns"
import axios from "axios"
import categories from "@/data/categories"
import { useNavigate } from "react-router-dom"
import "react-toastify/dist/ReactToastify.css"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const AddExpense = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Custom toast configurations
  const notifySuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        background: "linear-gradient(to right, #f0f9ff, #e0f2fe)",
        color: "#0f172a",
        borderLeft: "4px solid #6366f1",
      },
      icon: <CheckCircle className="text-indigo-600 h-5 w-5" />,
    })
  }

  const notifyError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        background: "linear-gradient(to right, #fff1f2, #ffe4e6)",
        color: "#0f172a",
        borderLeft: "4px solid #e11d48",
      },
      icon: <AlertCircle className="text-red-600 h-5 w-5" />,
    })
  }

  const notifyInfo = (message) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        background: "linear-gradient(to right, #eff6ff, #dbeafe)",
        color: "#0f172a",
        borderLeft: "4px solid #8b5cf6",
      },
      icon: <Info className="text-purple-600 h-5 w-5" />,
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      notifyError("Please enter a valid amount")
      return
    }

    if (!formData.category) {
      notifyError("Please select a category")
      return
    }

    if (!formData.date) {
      notifyError("Please select a date")
      return
    }

    // Form submission
    setIsSubmitting(true)

    try {
      const resp = await axios.post(`${API_URL}/add`, formData, { withCredentials: true })
      const message = resp.data.message

      if (message === "Unauthorized") {
        notifyInfo("Session expired. Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        notifySuccess(`Expense added successfully! (₹${formData.amount})`)

        // Reset form
        setFormData({
          amount: "",
          category: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd"),
        })
      }
    } catch (error) {
      console.error("Error adding expense:", error)

      if (error.response && error.response.status === 401) {
        notifyInfo("Session expired. Redirecting to login...")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        notifyError(error.response?.data?.message || "Failed to add expense. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-6">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="shadow-md rounded-lg overflow-hidden"
        limit={3}
        style={{ width: "auto", maxWidth: "90vw" }}
      />

      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative group w-fit mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins']">
              Add New Expense
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 w-1/2 group-hover:w-full"></div>
          </div>
          <p className="text-gray-600 mt-2 text-sm">Track your spending with ease</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount Input */}
            <div className="space-y-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 flex items-center">
                <IndianRupee className="h-4 w-4 text-indigo-600 mr-1" />
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-500 font-bold">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 flex items-center">
                <Tag className="h-4 w-4 text-purple-600 mr-1" />
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Input */}
            <div className="space-y-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 flex items-center">
                <CalendarIcon className="h-4 w-4 text-indigo-600 mr-1" />
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CalendarIcon className="h-4 w-4 text-indigo-500" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  max={format(new Date(), "yyyy-MM-dd")}
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 flex items-center">
                <FileText className="h-4 w-4 text-purple-600 mr-1" />
                Description (Optional)
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add any additional details about this expense..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Adding...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Add Expense
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddExpense
