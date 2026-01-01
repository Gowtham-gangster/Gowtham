import * as React from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputEnhancedProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const InputEnhanced = React.forwardRef<HTMLInputElement, InputEnhancedProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      isLoading,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || React.useId();
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-white mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              'w-full px-4 py-3 bg-background-secondary border-2 rounded-lg',
              'text-white placeholder-gray-500',
              'transition-all duration-200',
              'focus:outline-none focus:border-violet-500 focus:shadow-glow',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error ? 'border-red-500' : 'border-gray-700',
              leftIcon && 'pl-10',
              (rightIcon || isLoading) && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />
          
          {(rightIcon || isLoading) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-500 flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

InputEnhanced.displayName = "InputEnhanced";
