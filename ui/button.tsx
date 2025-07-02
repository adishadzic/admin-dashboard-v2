import * as React from 'react'

export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline'
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const variantClass = variantClasses[variant] ?? variantClasses.primary

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClass} ${className}`}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
