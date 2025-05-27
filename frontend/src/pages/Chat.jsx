"use client"

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { PlusCircle, Users, IndianRupee, Calendar, X, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card } from "@/components/ui/card"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { io } from "socket.io-client"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import LoadingScreen from "../components/LoadingScreen"

const API_URL = import.meta.env.VITE_BACKEND_URL;
export default function Chat({ group }) {
  const [groupData, setGroupData] = useState({})
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({})
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showMembersMobile, setShowMembersMobile] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [onlineMail, setOnlineMail] = useState([])

  const [socket, setSocket] = useState("")
  const [socketId, setSocketId] = useState("")

  const navigate = useNavigate()

  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const expensesRef = useRef([])

  // Helper function to check if a member is online
  const isOnline = (email) => {
    return onlineMail.includes(email)
  }

  useEffect(() => {
    let socketConnected = false
    let dataFetched = false

    const newSocket = io(`${API_URL}`)
    setSocket(newSocket)
    console.log("lalala socket")

    function trySetLoadingFalse() {
      if (socketConnected && dataFetched) {
        setLoading(false)
      }
    }

    newSocket.on("connect", async () => {
      console.log("User Connected in Socket in frontend", newSocket.id)

      try {
        const resp = await axios.get(`${API_URL}/usermail`, { withCredentials: true })
        console.log(resp.data.mail)

        newSocket.emit("group-join", { id: id, mail: resp.data.mail })
        setSocketId(newSocket.id)
        socketConnected = true
      } catch (err) {
        console.error(err)
        setError(err)
      }
      trySetLoadingFalse()
    })

    newSocket.on("new-expense-came", (data) => {
      console.log(data.expense)
      setExpenses((prev) => [...prev, data.expense])

      toast.success("New Expense Added", {
        description: `${data.expense.paidBy.name} paid ${formatCurrency(data.expense.amount)} for ${data.expense.description}`,
        duration: 3000,
        position: "top-center",
        style: {
          background: "linear-gradient(to right, #4f46e5, #7c3aed)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
        },
        icon: <IndianRupee className="text-white" />,
      })

      console.log("Expense shown")
    })

    newSocket.on("online-users", (mails) => {
      console.log("Received online users:", mails)
      console.log(mails)
      setOnlineMail(mails) // Replace the whole array
    })

    newSocket.on("delete-expense-came", (data) => {
      console.log("Got backend's delete expense came", data)
      console.log("Before expense data is:-", expenses)

      setExpenses((prev) => {
        console.log("Before expense data is:-", prev)
        const updated = prev.filter((exp) => exp._id !== data.exp_id)
        console.log("Updated expenses after deletion:", updated)
        return updated
      })

      console.log("Updated expenses after deletion:", expenses)
      toast.error("Expense Deleted", {
        description: "An expense has been removed",
        duration: 3000,
        position: "top-center",
        style: {
          background: "linear-gradient(to right, #ef4444, #dc2626)",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
        },
        icon: <Trash2 className="text-white" />,
      })
    })

    async function groupdetails() {
      try {
        console.log("Sending req for group info to see the chat to backend")
        const resp = await axios.get(`${API_URL}/group/find/${id}`, { withCredentials: true })

        const fetchedGroup = resp.data.fetechedGroup

        setGroupData(fetchedGroup)
        setExpenses(fetchedGroup.expenses)

        setNewExpense({
          amount: "",
          description: "",
          paidBy: fetchedGroup.members[0].email, // use fetchedGroup here
          splitType: "EQUAL",
          splits: fetchedGroup.members.map((member) => ({
            name: member.name,
            mail: member.email,
            amount: 0,
          })),
        })

        dataFetched = true
        trySetLoadingFalse()
      } catch (err) {
        console.error("Error fetching group Info:", err)
        setError(err)
        navigate("/dashboard")
        // even in error case you might want to stop loading
        setLoading(false)
      }
    }
    groupdetails()

    return () => {
      newSocket.disconnect()
      console.log("Socket disconnected")
    }
  }, [])

  const chatEndRef = useRef(null)
  // Scroll to bottom when expenses change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [expenses])

  const handleAddExpense = async () => {
    const amount = Number.parseFloat(newExpense.amount)
    if (!newExpense.amount) {
      setValidationError("Please enter an amount.")
      return
    }

    if (amount <= 0) {
      setValidationError("Amount should be greater than 0.")
      return
    }

    if (!newExpense.description.trim()) {
      setValidationError("Please enter a description.")
      return
    }
    let splits = []
    console.log(newExpense)
    if (newExpense.splitType === "EQUAL") {
      const splitAmount = amount / groupData.members.length
      splits = groupData.members.map((member) => ({
        name: member.name,
        mail: member.email,
        amount: splitAmount,
      }))
    } else {
      const totalSplit = newExpense.splits.reduce((sum, s) => sum + Number(s.amount || 0), 0)
      const roundedTotal = Math.round(totalSplit * 100) / 100
      const roundedAmount = Math.round(amount * 100) / 100

      if (roundedTotal !== roundedAmount) {
        setValidationError("Total split amount does not match the expense amount.")
        return
      }

      splits = newExpense.splits
    }

    const paidByMember = groupData.members.find((member) => member.email === newExpense.paidBy)

    const expense = {
      amount,
      description: newExpense.description,
      paidBy: {
        name: paidByMember.name,
        mail: paidByMember.email,
      },
      splitType: newExpense.splitType,
      splits,
      date: new Date(),
    }

    try {
      const resp = await axios.post(
        `${API_URL}/group/addexpense`,
        { expense: expense, id: id },
        { withCredentials: true },
      )
      console.log("Expense Added with the new expense:-", resp.data.savedExpense)
      setExpenses([...expenses, resp.data.savedExpense])
      setShowExpenseForm(false)
      resetExpenseForm()

      socket.emit("view-expense", { expense: resp.data.savedExpense, id })
    } catch (err) {
      console.error("Error Adding the Expense:", err)
      setError(err)
    }
  }

  async function handleDeleteExpense(exp_id) {
    try {
      const resp = await axios.delete(`${API_URL}/group/expense/delete`, {
        data: {
          exp_id,
          id,
        },
        withCredentials: true,
      })

      console.log("Sending delete-expense to backend")
      socket.emit("delete-expense", { exp_id, id })
      setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp._id !== exp_id))
    } catch (err) {
      console.error("Error deleting expense:", err)
      setError(err)
    }
  }
  const resetExpenseForm = () => {
    setNewExpense({
      amount: "",
      description: "",
      paidBy: groupData.members[0].email,
      splitType: "EQUAL",
      splits: groupData.members.map((member) => ({
        name: member.name,
        mail: member.email,
        amount: 0,
      })),
    })
  }

  const handleSplitAmountChange = (email, value) => {
    const amount = value === "" ? 0 : Number.parseFloat(value)
    setNewExpense({
      ...newExpense,
      splits: newExpense.splits.map((split) => (split.mail === email ? { ...split, amount } : split)),
    })
  }

  const calculateTotalSplitAmount = () => {
    return newExpense.splits.reduce((sum, split) => sum + (split.amount || 0), 0)
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return <LoadingScreen />
  }
  if (error) {
    navigate("/mygroups")
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-[#f0f4f8] font-sans">
      <Toaster position="top-center" richColors closeButton />
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-80 flex-col border-r bg-white/80 backdrop-blur-sm shadow-md">
        <div className="p-4 border-b">
          <div className="relative group w-fit mb-2">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins']">
              {groupData.name}
            </h2>
            <div className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 w-1/2 group-hover:w-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            <Users className="inline-block mr-1 h-4 w-4" />
            {groupData.members?.length || 0} members
          </p>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Members</h3>
          <div className="space-y-3">
            {groupData.members?.map((member) => (
              <div key={member.email} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-3 ${
                    member.email === groupData.leader
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-yellow-400"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  }`}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <p className="text-sm font-medium">{member.name}</p>
                    {isOnline(member.email) && <span className="ml-2 text-xs text-green-600 font-medium">Online</span>}
                  </div>
                  <p className="text-xs text-gray-500">{member.email}</p>
                </div>
                {member.email === groupData.leader && (
                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Members Modal */}
      {showMembersMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {groupData.name}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Users className="inline-block mr-1 h-3 w-3" />
                    {groupData.members?.length || 0} members
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowMembersMobile(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Members List */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {groupData.members?.map((member) => (
                  <div key={member.email} className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white mr-3 flex-shrink-0 ${
                        member.email === groupData.leader
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-yellow-400"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      }`}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium text-gray-800 truncate">{member.name}</p>
                        {isOnline(member.email) && (
                          <span className="ml-2 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{member.email}</p>
                      {member.email === groupData.leader && (
                        <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <Button
                onClick={() => setShowMembersMobile(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 group relative overflow-hidden w-10 h-10"
              onClick={() => navigate("/mygroups")}
            >
              <ArrowLeft className="h-5 w-5 text-indigo-600 absolute transition-all duration-300 group-hover:translate-x-[-6px]" />
              <ArrowLeft className="h-5 w-5 text-indigo-600 absolute transition-all duration-300 translate-x-[6px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={() => setShowMembersMobile(true)}>
              <Users className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {groupData.name}
              </h1>
              <p className="text-sm text-gray-500">Expense Chat • {groupData.members?.length || 0} members</p>
            </div>
          </div>
          <Button
            onClick={() => navigate(`/mygroups/results/${id}`)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            Show Results
          </Button>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6 max-w-3xl mx-auto">
            {expenses.map((expense) => (
              <div key={expense._id} className="flex flex-col animate-in fade-in-0 slide-in-from-bottom-3 duration-300">
                <div className="flex items-center mb-2 group">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 ${
                      expense.paidBy.mail === groupData.leader
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-indigo-500 to-purple-500"
                    }`}
                  >
                    {getInitials(expense.paidBy.name)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{expense.paidBy.name}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-500"
                        onClick={() => handleDeleteExpense(expense._id)}
                      >
                        <Trash2 className="h-10 w-6" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">{format(new Date(expense.date), "MMM d, yyyy • h:mm a")}</p>
                  </div>
                </div>

                <Card className="p-4 ml-10 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center mr-3">
                        <IndianRupee className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{expense.description}</h3>
                        <p className="text-indigo-600 font-semibold">{formatCurrency(expense.amount)}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        expense.splitType === "EQUAL"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {expense.splitType}
                    </span>
                  </div>

                  <Separator className="my-3" />

                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {expense.paidBy.name} paid {formatCurrency(expense.amount)}
                    </p>
                    {expense.splits.map(
                      (split) =>
                        split.amount > 0 && (
                          <div key={split.mail} className="flex items-center justify-between text-sm">
                            <span>{split.name} spent</span>
                            <span className="font-medium">{formatCurrency(split.amount)}</span>
                          </div>
                        ),
                    )}
                  </div>
                </Card>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Add Expense Button */}
        <div className="p-4 border-t bg-white/80 backdrop-blur-sm">
          <Button
            onClick={() => setShowExpenseForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Add Expense
          </Button>
        </div>

        {/* Custom Modal for Add Expense */}
        {showExpenseForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    Add New Expense
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowExpenseForm(false)}
                    className="h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Add a new expense to split among group members.</p>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="pl-8 focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        type="text"
                        className="pl-9 focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={format(new Date(), "MMM d, yyyy")}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Input
                    placeholder="What was this expense for?"
                    className="focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">Paid by</label>
                  <select
                    value={newExpense.paidBy}
                    onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="" disabled>
                      Select member
                    </option>
                    {groupData.members?.map((member) => (
                      <option key={member.email} value={member.email}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 mb-1">Split Type</label>
                  <select
                    value={newExpense.splitType}
                    onChange={(e) => setNewExpense({ ...newExpense, splitType: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="EQUAL">Split Equally</option>
                    <option value="CUSTOM">Custom Split</option>
                  </select>
                </div>

                {newExpense.splitType === "CUSTOM" && (
                  <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Custom Split</h4>
                      <p
                        className={cn(
                          "text-xs",
                          calculateTotalSplitAmount() === Number.parseFloat(newExpense.amount)
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {formatCurrency(calculateTotalSplitAmount())} of{" "}
                        {formatCurrency(Number.parseFloat(newExpense.amount) || 0)}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {newExpense.splits?.map((split) => (
                        <div key={split.mail} className="flex items-center gap-2">
                          <div
                            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              split.mail === groupData.leader
                                ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                : "bg-gradient-to-r from-indigo-500 to-purple-500"
                            }`}
                          >
                            {getInitials(split.name)}
                          </div>
                          <span className="text-sm flex-1 truncate">
                            {split.name}
                            {split.mail === newExpense.paidBy && (
                              <span className="text-xs text-indigo-600 ml-2">(Paid)</span>
                            )}
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="w-24 focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={split.amount || ""}
                            onChange={(e) => handleSplitAmountChange(split.mail, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {validationError && <p className="text-sm text-red-600 font-medium px-4">{validationError}</p>}
              <div className="p-4 border-t flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExpenseForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddExpense}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                >
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>
        {`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }

        .expense-card-hover {
          transition: all 0.3s ease;
        }

        .expense-card-hover:hover {
          transform: translateY(-2px);
        }
        `}
      </style>
    </div>
  )
}
