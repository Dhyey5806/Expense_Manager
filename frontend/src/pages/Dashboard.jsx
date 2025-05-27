"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, TrendingUp, Wallet, Target, Award } from "lucide-react"
import { Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import AnimatedWelcome from "./AnimatedWelcome"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)

const API_URL = import.meta.env.VITE_BACKEND_URL;
const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalMonthly: 0,
    averageDaily: 0,
    topCategory: { name: "", amount: 0 },
    biggestExpense: { description: "", amount: 0, date: "" },
    total_trend: "",
    total_trend_val: 0,
    average_trend: "",
    average_trend_val: 0,
  })
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] })
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] })
  const [uname, setUname] = useState("")

  const navigate = useNavigate()

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
        setUname(resp.data.firstname)
        const fetchedExpenses = resp.data.expense
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        const currentYear = currentDate.getFullYear()

        const currentMonthExpenses = fetchedExpenses.filter((exp) => {
          const date = new Date(exp.date)
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        })

        const totalMonthly = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        const today = currentDate.getDate()
        const averageDaily = totalMonthly / today

        const categoryTotals = {}
        currentMonthExpenses.forEach((exp) => {
          if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0
          categoryTotals[exp.category] += exp.amount
        })

        const topCategoryName = Object.keys(categoryTotals).reduce(
          (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),
          "",
        )

        const biggestExpense = currentMonthExpenses.reduce((max, exp) => (exp.amount > max.amount ? exp : max), {
          amount: 0,
        })

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
        const dailyTotals = new Array(daysInMonth).fill(0)

        currentMonthExpenses.forEach((exp) => {
          const day = new Date(exp.date).getDate() - 1
          dailyTotals[day] += exp.amount
        })

        const lineLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1)
        setLineChartData({
          labels: lineLabels,
          datasets: [
            {
              label: "Daily Expenses (₹)",
              data: dailyTotals,
              fill: true,
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              borderColor: "rgba(99, 102, 241, 1)",
              pointBackgroundColor: "rgba(147, 51, 234, 1)",
              pointBorderColor: "rgba(255, 255, 255, 1)",
              pointBorderWidth: 2,
              tension: 0.4,
            },
          ],
        })

        const categoryColors = [
          "rgba(99, 102, 241, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(6, 182, 212, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ]

        const pieLabels = Object.keys(categoryTotals)
        const pieAmounts = pieLabels.map((label) => categoryTotals[label])
        const pieColors = pieLabels.map((_, index) => categoryColors[index % categoryColors.length])

        setPieChartData({
          labels: pieLabels,
          datasets: [
            {
              data: pieAmounts,
              backgroundColor: pieColors,
              borderWidth: 0,
              hoverBorderWidth: 3,
              hoverBorderColor: "#ffffff",
            },
          ],
        })

        // Calculate previous month's expenses
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear

        const prevMonthExpenses = fetchedExpenses.filter((exp) => {
          const date = new Date(exp.date)
          return date.getMonth() === prevMonth && date.getFullYear() === prevYear
        })

        const totalPrevMonthly = prevMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
        const averagePrevDaily = totalPrevMonthly / daysInPrevMonth

        // Compare total expenses
        let total_trend = "equal"
        let total_trend_val = 0

        if (totalMonthly > totalPrevMonthly && totalPrevMonthly > 0) {
          total_trend = "up"
          total_trend_val = ((totalMonthly - totalPrevMonthly) / totalPrevMonthly) * 100
        } else if (totalMonthly < totalPrevMonthly && totalPrevMonthly > 0) {
          total_trend = "down"
          total_trend_val = ((totalPrevMonthly - totalMonthly) / totalPrevMonthly) * 100
        }

        // Compare average daily expenses
        let average_trend = "equal"
        let average_trend_val = 0

        if (averageDaily > averagePrevDaily && averagePrevDaily > 0) {
          average_trend = "up"
          average_trend_val = ((averageDaily - averagePrevDaily) / averagePrevDaily) * 100
        } else if (averageDaily < averagePrevDaily && averagePrevDaily > 0) {
          average_trend = "down"
          average_trend_val = ((averagePrevDaily - averageDaily) / averagePrevDaily) * 100
        }

        setDashboardData({
          totalMonthly,
          averageDaily: Math.round(averageDaily),
          topCategory: { name: topCategoryName, amount: categoryTotals[topCategoryName] },
          biggestExpense,
          total_trend,
          total_trend_val: Math.round(total_trend_val),
          average_trend,
          average_trend_val: Math.round(average_trend_val),
        })

        setIsLoading(false)
      } catch (err) {
        console.error(err)
        toast("Something went wrong. Please try again later.")
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Daily Expenses Trend",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#4f46e5",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(99, 102, 241, 0.1)",
        },
        ticks: {
          callback: (value) => "₹" + value,
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(99, 102, 241, 0.1)",
        },
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
    },
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          font: {
            size: 11,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Expense Distribution",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#7c3aed",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = Math.round((value / total) * 100)
            return `${label}: ₹${value} (${percentage}%)`
          },
        },
      },
    },
  }

  // Enhanced Stats Card component
  const StatsCard = ({ title, value, icon, gradient, trend, trendValue, isCategory = false }) => {
    return (
      <div className={`bg-white rounded-lg shadow-md border border-gray-100 p-4 ${gradient}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs text-gray-600 font-medium mb-1">{title}</p>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {isCategory ? value : `₹${value.toLocaleString("en-IN")}`}
            </h3>

            {trend && (
              <div
                className={`flex items-center text-xs font-medium ${trend === "up" ? "text-red-500" : "text-green-500"}`}
              >
                {trend === "up" ? <ArrowUp size={12} className="mr-1" /> : <ArrowDown size={12} className="mr-1" />}
                <span>{trendValue}% vs last month</span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-gray-50">{icon}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="relative group w-fit">
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins']">
              Dashboard
            </h1>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 w-1/2 group-hover:w-full"></div>
          </div>
        </div>

        {uname !== "" && <AnimatedWelcome name={uname} />}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard
            title="Total Expenses (Month)"
            value={dashboardData.totalMonthly}
            icon={<Wallet size={20} className="text-indigo-600" />}
            gradient="bg-indigo-50"
            trend={dashboardData.total_trend}
            trendValue={dashboardData.total_trend_val}
          />

          <StatsCard
            title="Average Daily"
            value={dashboardData.averageDaily}
            icon={<TrendingUp size={20} className="text-purple-600" />}
            gradient="bg-purple-50"
            trend={dashboardData.average_trend}
            trendValue={dashboardData.average_trend_val}
          />

          <StatsCard
            title="Top Category"
            value={dashboardData.topCategory.name}
            icon={<Target size={20} className="text-pink-600" />}
            gradient="bg-pink-50"
            isCategory={true}
          />

          <StatsCard
            title="Biggest Expense"
            value={dashboardData.biggestExpense.amount}
            icon={<Award size={20} className="text-orange-600" />}
            gradient="bg-orange-50"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                    <p className="text-indigo-600 font-medium text-sm">Loading chart data...</p>
                  </div>
                </div>
              ) : (
                <Line options={lineOptions} data={lineChartData} />
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-3"></div>
                    <p className="text-purple-600 font-medium text-sm">Loading chart data...</p>
                  </div>
                </div>
              ) : (
                <Pie options={pieOptions} data={pieChartData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
