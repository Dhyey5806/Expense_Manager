"use client"

import { useState, useEffect } from "react"
import { toast, ToastContainer } from "react-toastify"
import {
  Pencil,
  Trash2,
  AlertCircle,
  Save,
  X,
  Edit3,
  Calendar,
  Tag,
  IndianRupee,
  FileText,
  CheckCircle,
} from "lucide-react"
import axios from "axios"
import ConfirmDialog from "./ConfirmDialog"
import { useNavigate } from "react-router-dom"
import categories from "@/data/categories"
import "react-toastify/dist/ReactToastify.css"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const UpdateExpense = () => {
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [editFormData, setEditFormData] = useState({
    category: "",
    amount: "",
    description: "",
    date: "",
  })
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const navigate = useNavigate()

  // Custom toast configurations
  const notifySuccess = (message) => {
    toast.success(message, {
      position: "bottom-right",
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
      position: "bottom-right",
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const resp = await axios.get(`${API_URL}/view`, { withCredentials: true })
        if (resp.data.message === "Unauthorized") {
          navigate("/login")
          return
        } else if (resp.data.message === "Internal Server Error try again") {
          notifyError("Failed to load expenses. Please try again.")
          return
        }
        const fetchedExpenses = resp.data.expense
        setTimeout(() => {
          const currentDate = new Date()
          const currentMonth = currentDate.getMonth()
          const currentYear = currentDate.getFullYear()

          const currentMonthExpenses = fetchedExpenses.filter((expense) => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
          })

          currentMonthExpenses.sort((a, b) => new Date(a.date) - new Date(b.date))

          setExpenses(currentMonthExpenses)
          setIsLoading(false)
        }, 100)
      } catch (err) {
        notifyError("Failed to fetch expenses")
        console.error(err)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleEdit = (id) => {
    const expenseToEdit = expenses.find((exp) => exp._id === id)
    setEditingExpenseId(id)
    setEditFormData({
      category: expenseToEdit.category,
      amount: expenseToEdit.amount,
      description: expenseToEdit.description,
      date: expenseToEdit.date.split("T")[0],
    })
  }

  const handleDelete = (id) => {
    setSelectedId(id)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    try {
      const resp = await axios.delete(`${API_URL}/delete/${selectedId}`, { withCredentials: true })
      if (resp.data.message === "Unauthorized") {
        navigate("/login")
        return
      }

      setExpenses((prev) => prev.filter((expense) => expense._id !== selectedId))
      notifySuccess("Expense deleted successfully")
      setConfirmOpen(false)
      setSelectedId(null)
    } catch (err) {
      notifyError("Failed to delete expense")
      console.error(err)
    }
  }

  const handleCancelDelete = () => {
    setConfirmOpen(false)
    setSelectedId(null)
  }

  const handleUpdate = async () => {
    const updatedExpense = {
      ...editFormData,
      amount: Number.parseFloat(editFormData.amount),
    }

    try {
      console.log("sending req to backend for update")
      const resp = await axios.put(`${API_URL}/update/${editingExpenseId}`, updatedExpense, {
        withCredentials: true,
      })
      if (resp.data.message === "Unauthorized") {
        navigate("/login")
        return
      }

      setExpenses(expenses.map((exp) => (exp._id === editingExpenseId ? { ...exp, ...updatedExpense } : exp)))
      notifySuccess(`Expense updated successfully! (₹${updatedExpense.amount})`)
      setEditingExpenseId(null)
    } catch (err) {
      notifyError("Failed to update expense")
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-IN", options)
  }

  const getCategoryColor = (category) => {
    const colors = {
      Food: "bg-red-100 text-red-800 border-red-200",
      Transportation: "bg-blue-100 text-blue-800 border-blue-200",
      Entertainment: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Shopping: "bg-teal-100 text-teal-800 border-teal-200",
      Utilities: "bg-purple-100 text-purple-800 border-purple-200",
      Rent: "bg-orange-100 text-orange-800 border-orange-200",
      Healthcare: "bg-green-100 text-green-800 border-green-200",
      Education: "bg-indigo-100 text-indigo-800 border-indigo-200",
      Travel: "bg-pink-100 text-pink-800 border-pink-200",
      Groceries: "bg-lime-100 text-lime-800 border-lime-200",
      Investment: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
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
        style={{ width: "auto", maxWidth: "60vw" }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="relative group w-fit">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins']">
              Update Expenses
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 w-1/2 group-hover:w-full"></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 flex items-center">
            <Edit3 className="h-4 w-4 mr-1 text-indigo-600" />
            Current month expenses
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
              <p className="text-indigo-600 font-medium text-sm">Loading expenses...</p>
            </div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-1">No Expenses Found</h3>
            <p className="text-yellow-700 text-sm">
              No expenses found for the current month. Add some expenses to get started!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {expenses.map((expense) => (
              <div key={expense._id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${getCategoryColor(expense.category)}`}
                      >
                        {expense.category}
                      </span>
                      <span className="text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {formatDate(expense.date)}
                      </span>
                    </div>
                    <p className={`text-sm ${expense.description ? "text-gray-700" : "text-gray-400 italic"}`}>
                      {expense.description ? expense.description : "No Description"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                    <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center">
                      <IndianRupee className="h-4 w-4 text-indigo-600 mr-1" />
                      {expense.amount.toLocaleString("en-IN")}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(expense._id)}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Edit Form */}
                {editingExpenseId === expense._id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit Expense
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          Category
                        </label>
                        <div className="relative">
                          <select
                            name="category"
                            value={editFormData.category}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none"
                          >
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              ></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          Amount (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-indigo-500 font-bold text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            name="amount"
                            value={editFormData.amount}
                            onChange={handleChange}
                            placeholder="Amount"
                            className="w-full pl-6 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          Description
                        </label>
                        <input
                          type="text"
                          name="description"
                          value={editFormData.description}
                          onChange={handleChange}
                          placeholder="Description"
                          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={handleUpdate}
                        className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Update
                      </button>
                      <button
                        onClick={() => setEditingExpenseId(null)}
                        className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <ConfirmDialog
              open={confirmOpen}
              title="Confirm Delete"
              message="Are you sure you want to delete this expense?"
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default UpdateExpense
