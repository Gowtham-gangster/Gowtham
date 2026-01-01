import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonEnhancedProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const ButtonEnhanced = React.forwardRef<HTMLButtonElement, ButtonEnhancedProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-[1.02]';
    
    const variants = {
      primary: 'bg-gradient-to-r from-violet-600 to-magenta-600 text-white hover:shadow-glow hover:from-violet-500 hover:to-magenta-500 focus:ring-violet-500',
      secondary: 'bg-background-secondary text-white hover:bg-background-tertiary border border-gray-700 hover:border-gray-600 focus:ring-violet-500',
      outline: 'border-2 border-violet-600 text-violet-400 hover:bg-violet-600/10 hover:border-violet-500 focus:ring-violet-500',
      ghost: 'text-violet-400 hover:bg-violet-600/10 hover:text-violet-300 focus:ring-violet-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-glow-danger focus:ring-red-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm h-8',
      md: 'px-4 py-2 text-base h-10',
      lg: 'px-6 py-3 text-lg h-12',
      xl: 'px-8 py-4 text-xl h-14',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon && <span className="mr-2 flex items-center">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2 flex items-center">{rightIcon}</span>}
      </button>
    );
  }
);

ButtonEnhanced.displayName = "ButtonEnhanced";
