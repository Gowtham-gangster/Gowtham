import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardEnhancedProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
}

export const CardEnhanced = React.forwardRef<HTMLDivElement, CardEnhancedProps>(
  (
    {
      variant = 'glass',
      padding = 'md',
      hover = false,
      glow = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-xl transition-all duration-300 ease-out';
    
    const variants = {
      default: 'bg-background-secondary',
      glass: 'glass backdrop-blur-md bg-background-secondary/50 border border-white/10',
      elevated: 'bg-background-secondary shadow-lg',
      bordered: 'bg-background-secondary border-2 border-violet-600/30',
    };
    
    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          hover && 'hover:scale-[1.02] hover:shadow-glow hover:-translate-y-1 cursor-pointer',
          glow && 'shadow-glow',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardEnhanced.displayName = "CardEnhanced";
