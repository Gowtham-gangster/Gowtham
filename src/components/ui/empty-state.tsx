import * as React from "react";
import { ButtonEnhanced } from "./button-enhanced";

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

/**
 * EmptyState - Display when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => (
  <div 
    className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className || ''}`}
    role="status"
    aria-live="polite"
  >
    <div 
      className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mb-4 text-violet-400"
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 mb-6 max-w-md">{description}</p>
    {action && (
      <ButtonEnhanced 
        onClick={action.onClick}
        leftIcon={action.icon}
        aria-label={action.label}
      >
        {action.label}
      </ButtonEnhanced>
    )}
  </div>
);

EmptyState.displayName = "EmptyState";
