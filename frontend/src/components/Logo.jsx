const LogoModern = ({ size = "md", showText = true, className = "" }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <div className="relative">
        <div className="relative">
          <span
            className={`font-extrabold ${sizeClasses[size]} text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600`}
          >
            EM
          </span>
          <div className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        </div>
      </div>

      {/* Logo Text */}
      {showText && (
        <div className={`font-semibold ${sizeClasses[size]} border-l-2 border-gray-200 pl-2 ml-1`}>
          <span className="font-bold text-indigo-600">Expense</span>
          <span className="text-purple-600">Manager</span>
        </div>
      )}
    </div>
  )
}

export default LogoModern
