"use client"

import { useState, useEffect } from "react"
import { Brain, Sparkles, TrendingUp, DollarSign, Target, Lightbulb } from "lucide-react"

export default function AiLoading() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const messages = [
    {
      text: "AI gives you better responses when you write proper descriptions",
      icon: <Brain className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      text: "AI response may take time to generate your personalized insights",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-indigo-600",
    },
    {
      text: "Did you know? The 50/30/20 rule suggests 50% needs, 30% wants, 20% savings",
      icon: <Target className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      text: "Tracking small expenses can reveal surprising spending patterns",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-blue-600",
    },
    {
      text: "The average person makes 35,000 decisions per day, including spending choices",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-yellow-600",
    },
    {
      text: "AI analyzes your spending patterns to provide personalized recommendations",
      icon: <Brain className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      text: "Categorizing expenses helps identify areas for potential savings",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-emerald-600",
    },
    {
      text: "Monthly expense reviews can improve financial awareness by 40%",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-red-600",
    },
    {
      text: "AI is processing your expense data to find hidden insights",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-indigo-600",
    },
    {
      text: "Impulse purchases account for 40% of all money spent at grocery stores",
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-600",
    },
    {
      text: "The envelope method can help control spending in specific categories",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-cyan-600",
    },
    {
      text: "AI considers seasonal trends and personal habits in its analysis",
      icon: <Brain className="h-5 w-5" />,
      color: "text-purple-600",
    },
    {
      text: "Automating savings can increase your savings rate by 15%",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-600",
    },
    {
      text: "Your spending patterns reveal more than just financial habits",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-pink-600",
    },
    {
      text: "Almost done! AI is finalizing your personalized expense insights",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-indigo-600",
    },
  ]

useEffect(() => {
  const interval = setInterval(() => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentMessageIndex((prev) => {
        let next
        do {
          next = Math.floor(Math.random() * messages.length)
        } while (next === prev)
        return next
      })
      setIsVisible(true)
    }, 300)
  }, 6000)

  return () => clearInterval(interval)
}, [messages.length])


  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-auto">
        {/* AI Brain Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-20 h-20 border-4 border-transparent border-t-purple-500 border-r-indigo-500 rounded-full animate-spin"></div>

            {/* Inner pulsing circle */}
            <div className="absolute inset-2 w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="h-8 w-8 text-white" />
            </div>

            {/* Floating particles */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
            <div
              className="absolute -bottom-2 -left-2 w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute top-1/2 -left-4 w-2 h-2 bg-pink-400 rounded-full animate-bounce"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-['Poppins'] mb-2">
            AI Analysis in Progress
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse"
              style={{ width: "75%" }}
            ></div>
          </div>
        </div>

        {/* Rotating Messages */}
        <div className="text-center min-h-[80px] flex items-center justify-center">
          <div
            className={`transition-all duration-300 ${isVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2"}`}
          >
            <div className="flex items-center justify-center mb-3">
              <div className={`p-2 rounded-full bg-gray-100 mr-3 ${messages[currentMessageIndex].color}`}>
                {messages[currentMessageIndex].icon}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed font-medium">{messages[currentMessageIndex].text}</p>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center mt-6 space-x-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
      </div>
    </div>
  )
}
