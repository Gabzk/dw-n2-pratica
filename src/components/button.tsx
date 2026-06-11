import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({ title, variant = 'primary', className = '', ...props }: ButtonProps) {
  const baseStyle = "w-full py-3.5 px-4 font-semibold text-base rounded-xl transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md flex items-center justify-center gap-2 cursor-pointer"
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500 dark:focus:ring-offset-neutral-900",
    secondary: "bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-400 text-neutral-800 focus:ring-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 dark:text-neutral-200 dark:focus:ring-offset-neutral-900",
    danger: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500 dark:focus:ring-offset-neutral-900"
  }

  return (
    <button
      {...props}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {title}
    </button>
  )
}