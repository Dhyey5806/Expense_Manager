"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import AiLoading from "../components/AiLoading"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  AlertTriangle,
  Lightbulb,
  Target,
  Sparkles,
  Database,
} from "lucide-react"

const API_URL = import.meta.env.VITE_BACKEND_URL;
const AIAnalysis = () => {
  const [cachedResp, setCachedResp] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [aiResponse, setAiResponse] = useState(null)

  useEffect(() => {
    async function fetchAIResponse() {
      try {
        const r = await axios.get(`${API_URL}/airesponse`, { withCredentials: true })
        setCachedResp(r.data.cached)
        setAiResponse(r.data.response)
        console.log(r.data.response)
      } catch (err) {
        console.error("Something went wrong", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAIResponse()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <AiLoading />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] font-sans p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading AI Analysis</h2>
            <p className="text-red-600">
              Something went wrong while fetching your AI insights. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Check if response is empty or insufficient data
  const isEmptyResponse = !aiResponse || Object.keys(aiResponse).length === 0

  if (isEmptyResponse) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] font-sans p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="relative group w-fit">
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mt-2">
                AI Expense Analysis
              </h1>
              <div className="absolute -bottom-1 left-0 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 w-1/2 group-hover:w-full"></div>
            </div>
          </div>

          {/* Insufficient Data Message */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Enough Data for AI Analysis</h2>
              <p className="text-gray-600 mb-6">
                Add at least 5 expenses to get personalized AI insights about your spending patterns.
              </p>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">What you'll get with more data:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-indigo-600 mr-2" />
                  Spending trend analysis
                </div>
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-purple-600 mr-2" />
                  Personalized savings suggestions
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  Unusual expense detection
                </div>
                <div className="flex items-center">
                  <Lightbulb className="h-4 w-4 text-green-600 mr-2" />
                  Smart budget recommendations
                </div>
              </div>
            </div>

            <button
              onClick={() => (window.location.href = "/add")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Add Your Expense
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative group w-fit">
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mt-2">
                AI Expense Analysis
              </h1>
              <div className="absolute -bottom-1 left-0 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 w-1/2 group-hover:w-full"></div>
            </div>

            {/* Response Type Badge */}
            <div className="flex items-center gap-2">
              {cachedResp ? (
                <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Database className="h-4 w-4 mr-1" />
                  Cached Response
                </div>
              ) : (
                <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Fresh AI Analysis
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Response Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white mr-4">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Your Personalized AI Insights</h2>
              <p className="text-gray-600 text-sm">
                {cachedResp ? "Previously generated analysis" : "Fresh insights based on your latest spending data"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Month Comparison */}
          {aiResponse.monthComparison && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Monthly Trends</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium text-red-800">Most Increased</span>
                  </div>
                  <p className="text-red-700 font-semibold mt-1">{aiResponse.monthComparison.mostIncreasedCategory}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <TrendingDown className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Most Decreased</span>
                  </div>
                  <p className="text-green-700 font-semibold mt-1">
                    {aiResponse.monthComparison.mostDecreasedCategory}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Spending Categories */}
          {aiResponse.topSpendingCategories && aiResponse.topSpendingCategories.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <IndianRupee className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Top Spending Categories</h3>
              </div>
              <div className="space-y-3">
                {aiResponse.topSpendingCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium text-gray-800">{category.category}</span>
                    <span className="font-bold text-purple-600">{formatCurrency(category.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Potential Savings */}
          {aiResponse.potentialSavings && aiResponse.potentialSavings.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <Target className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Potential Savings</h3>
              </div>
              <div className="space-y-3">
                {aiResponse.potentialSavings.map((saving, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                    <p className="text-green-800 text-sm">{saving}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unusual Expenses */}
          {aiResponse.unusualExpenses && aiResponse.unusualExpenses.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">Unusual Expenses</h3>
              </div>
              <div className="space-y-3">
                {aiResponse.unusualExpenses.map((expense, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-orange-800 text-sm">{expense}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget Suggestions - Full Width */}
        {aiResponse.budgetSuggestions && aiResponse.budgetSuggestions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex items-center mb-4">
              <Lightbulb className="h-5 w-5 text-indigo-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Smart Budget Suggestions</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiResponse.budgetSuggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-start">
                    <Lightbulb className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-indigo-800 text-sm">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAnalysis
