import React, { useState } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, name, ...props }, ref) => {
    // 1. Add state to track visibility
    const [showPassword, setShowPassword] = useState(false);

    // 2. Check if the original intent was a password field
    const isPasswordField = type === 'password';

    // 3. Determine the actual type to render (text vs password)
    const inputType = isPasswordField && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        {/* Wrapper for relative positioning of the icon */}
        <div className="relative">
          <input
            type={inputType} // Use our calculated type
            name={name}
            id={name}
            className={clsx(
              'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-admin-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              // Add padding-right if it's a password field so text doesn't overlap the icon
              isPasswordField && 'pr-10', 
              className
            )}
            ref={ref}
            {...props}
          />

          {/* 4. Render the toggle button ONLY if it is a password field */}
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none"
              tabIndex={-1} // Prevent tab stopping on the icon
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input"; 