import * as React from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

/**
 * Show a toast notification with enhanced styling
 */
export const showToast = ({ type, title, message, duration = 3000 }: ToastProps) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />,
    error: <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />,
    info: <Info className="h-5 w-5 text-blue-500" aria-hidden="true" />,
  };

  const ariaLabels = {
    success: 'Success notification',
    error: 'Error notification',
    warning: 'Warning notification',
    info: 'Information notification',
  };
  
  toast.custom(
    (t) => (
      <div
        className={cn(
          'glass backdrop-blur-md bg-background-secondary/90 border border-white/10',
          'rounded-lg shadow-glow p-4 flex items-start gap-3 max-w-md',
          'animate-in slide-in-from-top-5 duration-200'
        )}
        role="alert"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
        aria-label={ariaLabels[type]}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white">{title}</h4>
          {message && <p className="text-sm text-gray-400 mt-1">{message}</p>}
        </div>
        <button
          onClick={() => toast.dismiss(t)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    ),
    { duration }
  );
};

/**
 * Convenience functions for different toast types
 */
export const toastSuccess = (title: string, message?: string, duration?: number) => {
  showToast({ type: 'success', title, message, duration });
};

export const toastError = (title: string, message?: string, duration?: number) => {
  showToast({ type: 'error', title, message, duration });
};

export const toastWarning = (title: string, message?: string, duration?: number) => {
  showToast({ type: 'warning', title, message, duration });
};

export const toastInfo = (title: string, message?: string, duration?: number) => {
  showToast({ type: 'info', title, message, duration });
};
