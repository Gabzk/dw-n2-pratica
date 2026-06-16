import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
}

export default function Input({ label, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col w-full">
            <label htmlFor={props.id || props.name} className="font-semibold text-sm text-neutral-600 dark:text-neutral-300 mb-1.5 ml-1">
                {label}
            </label>
            <input
                {...props}
                className={`w-full bg-neutral-50 dark:bg-neutral-800 px-4 py-3 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-700 text-base rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm ${className}`}
            />
        </div>
    )
}