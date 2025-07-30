interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ 
  message = '読み込み中...', 
  size = 'md',
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  }

  return (
    <div className={`text-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
      <p className="text-gray-600">{message}</p>
    </div>
  )
}