'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  rounded?: boolean
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, rounded = true, variant = 'default', size = 'md', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 relative overflow-hidden"
    
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm", 
      lg: "px-6 py-3 text-base"
    }
    
    const variantClasses = {
      default: "text-white border border-white/10",
      ghost: "text-white/60 hover:text-white",
      outline: "border border-white/20 text-white"
    }
    
    const roundedClasses = rounded ? "rounded-lg" : ""

    return (
      <button
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          roundedClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
