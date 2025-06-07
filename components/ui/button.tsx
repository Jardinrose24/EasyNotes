import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      default: "bg-orange-600 text-white hover:bg-orange-700",
      outline: "border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 hover:text-white",
      ghost: "text-gray-400 hover:bg-gray-700 hover:text-white",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn(baseClasses, variants[variant], sizes[size], className),
        ref,
        ...props,
      })
    }

    return (
      <button className={cn(baseClasses, variants[variant], sizes[size], className)} ref={ref} {...props}>
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export { Button }
