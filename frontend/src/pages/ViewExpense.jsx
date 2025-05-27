"use client"

import { useState, useEffect } from "react"
import { Calendar, Filter, Search, TrendingDown } from "lucide-react"
import categoriesData from "@/data/categories"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const ViewExpense = () => {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("current")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const categories = ["All", ...categoriesData]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      try {
        const resp = await axios.get(`${API_URL}/view`, { withCredentials: true })
        if (resp.data.message === "Unauthorized") {
          navigate("/login")
          return
        } else if (resp.data.message === "Internal Server Error try again") {
          toast(resp.data.message)
          return
        }

        const fetchedExpenses = resp.data.expense

        setTimeout(() => {
          let filteredExpenses = [...fetchedExpenses]

          if (filter === "current") {
            const currentDate = new Date()
            const currentMonth = currentDate.getMonth()
            const currentYear = currentDate.getFullYear()

            filteredExpenses = filteredExpenses.filter((expense) => {
              const expenseDate = new Date(expense.date)
              return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
            })
          }

          if (categoryFilter !== "all" && categoryFilter !== "All") {
            filteredExpenses = filteredExpenses.filter(
              (expense) => expense.category.toLowerCase() === categoryFilter.toLowerCase(),
            )
          }

          filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))

          setExpenses(filteredExpenses)
          setIsLoading(false)
        }, 100)
      } catch (err) {
        toast("Failed to fetch expenses")
        console.error(err)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filter, categoryFilter])

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-IN", options)
  }

  // Get category color
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div className="relative group w-fit">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins']">
              View Expenses
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 w-1/2 group-hover:w-full"></div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Calendar className="h-4 w-4 text-indigo-500" />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-sm"
              >
                <option value="current">Current Month</option>
                <option value="all">All Expenses</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-4 w-4 text-purple-500" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
              <Search className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="text-lg font-medium text-yellow-800 mb-1">No Expenses Found</h3>
            <p className="text-yellow-700 text-sm">Try adjusting your filters or add some expenses to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group expenses by date */}
            {(() => {
              const groupedExpenses = {}

              expenses.forEach((expense) => {
                const date = expense.date.split("T")[0]
                if (!groupedExpenses[date]) {
                  groupedExpenses[date] = []
                }
                groupedExpenses[date].push(expense)
              })

              return Object.keys(groupedExpenses)
                .sort((a, b) => new Date(b) - new Date(a))
                .map((date) => {
                  const dayExpenses = groupedExpenses[date]
                  const totalForDay = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)

                  return (
                    <div key={date}>
                      {/* Date Header */}
                      <div className="flex items-center justify-between mb-2 px-3">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                          <h2 className="text-sm font-medium text-gray-800">{formatDate(date)}</h2>
                        </div>
                        <div className="flex items-center bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                          <TrendingDown className="h-3 w-3 mr-1" />₹{totalForDay.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {/* Expenses for the day */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        {dayExpenses.map((expense, index) => (
                          <div
                            key={expense._id}
                            className={`p-3 hover:bg-gray-50 transition-colors ${
                              index !== dayExpenses.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex flex-col">
                                <div className="flex items-center mb-1">
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded border ${getCategoryColor(expense.category)}`}
                                  >
                                    {expense.category}
                                  </span>
                                </div>

                                <p
                                  className={`text-sm ${
                                    expense.description ? "text-gray-700" : "text-gray-400 italic"
                                  }`}
                                >
                                  {expense.description
                                    ? expense.description
                                    : expense.id
                                      ? `Expense #${expense.id}`
                                      : "No Description"}
                                </p>
                              </div>

                              <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                ₹{expense.amount.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewExpense
