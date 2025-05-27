"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowRight, TrendingUp, Wallet, Users, Award, ArrowDown, IndianRupee, CreditCard, PieChart } from "lucide-react"

const API_URL = import.meta.env.VITE_BACKEND_URL;
export default function Result() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [settlements, setSettlements] = useState([])
  const [userSpendings, setUserSpendings] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [groupName, setGroupName] = useState("")

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const resp = await axios.get(`${API_URL}/results/${id}`, { withCredentials: true })
        setSettlements(resp.data.settlements)
        setUserSpendings(resp.data.userSpendings)
        setGroupName(resp.data.groupName || "Group Expenses")
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching settlement data:", error)
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Calculate insights from the data
  const calculateInsights = () => {
    if (!userSpendings || Object.keys(userSpendings).length === 0) return null

    // Find highest spender
    let highestSpender = { name: "", amount: 0 }
    // Find highest payer
    let highestPayer = { name: "", amount: 0 }
    // Calculate total group spending
    let totalGroupSpending = 0
    // Calculate total transactions needed
    const totalTransactions = settlements.length

    Object.values(userSpendings).forEach((user) => {
      totalGroupSpending += user.total_spent

      if (user.total_spent > highestSpender.amount) {
        highestSpender = { name: user.name, amount: user.total_spent }
      }

      if (user.paid > highestPayer.amount) {
        highestPayer = { name: user.name, amount: user.paid }
      }
    })

    // Calculate average spending per person
    const averageSpending = totalGroupSpending / Object.keys(userSpendings).length

    return {
      highestSpender,
      highestPayer,
      totalGroupSpending,
      averageSpending,
      totalTransactions,
      memberCount: Object.keys(userSpendings).length,
    }
  }

  const insights = calculateInsights()

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Calculate balance status (positive, negative, or neutral)
  const getBalanceStatus = (mail) => {
    if (!userSpendings[mail]) return "neutral"

    const user = userSpendings[mail]
    const balance = user.paid - user.total_spent

    if (balance > 0) return "positive"
    if (balance < 0) return "negative"
    return "neutral"
  }

  // Get color based on balance status
  const getStatusColor = (status) => {
    switch (status) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // Get icon based on balance status
  const getStatusIcon = (status) => {
    switch (status) {
      case "positive":
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case "negative":
        return <ArrowDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f0f4f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans text-gray-800 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative group w-fit">
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mt-2">
                Settlement Results
              </h1>
              <div className="absolute -bottom-1 left-0 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 w-1/2 group-hover:w-full"></div>
            </div>
            <button
              onClick={() => navigate(`/mygroups/${id}`)}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-indigo-600 font-medium flex items-center gap-2 self-start"
            >
              <ArrowRight className="h-4 w-4" /> Back to Group
            </button>
          </div>
          <p className="text-lg text-gray-600 mb-2">{groupName}</p>
        </div>

        {/* Insights Cards */}
        {insights && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <InsightCard
              title="Total Group Spending"
              value={formatCurrency(insights.totalGroupSpending)}
              icon={<Wallet className="h-5 w-5 text-purple-500" />}
              color="bg-gradient-to-br from-purple-50 to-indigo-50"
            />
            <InsightCard
              title="Average Per Person"
              value={formatCurrency(insights.averageSpending)}
              icon={<Users className="h-5 w-5 text-indigo-500" />}
              color="bg-gradient-to-br from-indigo-50 to-blue-50"
            />
            <InsightCard
              title="Highest Spender"
              value={insights.highestSpender.name}
              subvalue={formatCurrency(insights.highestSpender.amount)}
              icon={<TrendingUp className="h-5 w-5 text-red-500" />}
              color="bg-gradient-to-br from-red-50 to-orange-50"
            />
            <InsightCard
              title="Highest Contributor"
              value={insights.highestPayer.name}
              subvalue={formatCurrency(insights.highestPayer.amount)}
              icon={<Award className="h-5 w-5 text-green-500" />}
              color="bg-gradient-to-br from-green-50 to-emerald-50"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settlements Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-indigo-600" />
                  Settlements
                </h2>
                <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">
                  {settlements.length} transactions
                </span>
              </div>

              {settlements.length > 0 ? (
                <div className="space-y-4">
                  {settlements.map((settlement, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center mb-3 sm:mb-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {getInitials(settlement.from.name)}
                        </div>
                        <div>
                          <p className="font-medium">{settlement.from.name}</p>
                          <p className="text-xs text-gray-500">{settlement.from.mail}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center my-2 sm:my-0">
                        <div className="flex items-center">
                          <ArrowRight className="h-5 w-5 text-indigo-600" />
                          <span className="mx-2 font-bold text-indigo-600">{formatCurrency(settlement.amount)}</span>
                        </div>
                        <span className="text-xs text-gray-500">needs to pay to:-</span>
                      </div>

                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {getInitials(settlement.to.name)}
                        </div>
                        <div>
                          <p className="font-medium">{settlement.to.name}</p>
                          <p className="text-xs text-gray-500">{settlement.to.mail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <IndianRupee className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No settlements needed! Everyone is square.</p>
                </div>
              )}
            </div>
          </div>

          {/* User Spending Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-indigo-600" />
                  Member Summary
                </h2>
                <span className="text-sm bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full">
                  {Object.keys(userSpendings).length} members
                </span>
              </div>

              <div className="space-y-4">
                {Object.values(userSpendings).map((user) => {
                  const balance = user.paid - user.total_spent
                  const status = getBalanceStatus(user.mail)

                  return (
                    <div
                      key={user.mail}
                      className="p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.mail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-indigo-50 rounded">
                          <p className="text-gray-500">Paid</p>
                          <p className="font-semibold">{formatCurrency(user.paid)}</p>
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <p className="text-gray-500">Spent</p>
                          <p className="font-semibold">{formatCurrency(user.total_spent)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-sm">Balance</span>
                        <div className={`flex items-center ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="font-bold ml-1">{formatCurrency(Math.abs(balance))}</span>
                          <span className="ml-1 text-xs">
                            {balance > 0 ? "(to receive)" : balance < 0 ? "(to pay)" : "(settled)"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Insight Card Component
function InsightCard({ title, value, subvalue, icon, color }) {
  return (
    <div className={`rounded-xl p-5 shadow-md ${color} hover:shadow-lg transition-all`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <h3 className="text-xl font-bold mt-1">{value}</h3>
          {subvalue && <p className="text-sm text-gray-500 mt-1">{subvalue}</p>}
        </div>
        <div className="p-2 rounded-full bg-white bg-opacity-60">{icon}</div>
      </div>
    </div>
  )
}

// Arrow Up Icon Component
function ArrowUp(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </svg>
  )
}
