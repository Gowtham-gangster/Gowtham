import { EmptyState } from '@/components/ui/empty-state';
import { Bell, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

/**
 * NotificationsEmptyState - Enhanced empty state for notifications
 * Includes helpful guidance about notification types
 * Validates: Requirements 14.1, 14.2
 */
export const NotificationsEmptyState = () => {
  const { elderlyMode } = useStore();

  const notificationTypes = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Dose Reminders",
      description: "Get notified when it's time to take your medicine"
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: "Missed Doses",
      description: "Alerts when you miss a scheduled dose"
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Refill Warnings",
      description: "Reminders when your medicine stock is running low"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <EmptyState
        icon={<Bell className="w-8 h-8" />}
        title="No notifications yet"
        description="You'll receive notifications for dose reminders, missed doses, and refill warnings. Stay on top of your medication schedule."
      />

      {/* Notification Types */}
      <div className="max-w-3xl mx-auto">
        <h3 className={cn(
          "text-center text-lg font-semibold text-white mb-6",
          elderlyMode && "text-xl"
        )}>
          Types of notifications you'll receive
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notificationTypes.map((type, index) => (
            <div
              key={index}
              className={cn(
                "glass backdrop-blur-md bg-background-secondary/50 border border-white/10",
                "rounded-xl p-6 text-center transition-all duration-200",
                "hover:scale-105 hover:shadow-glow hover:border-violet-500/30"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-cyan-600/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                {type.icon}
              </div>
              <h4 className={cn(
                "font-semibold text-white mb-2",
                elderlyMode && "text-lg"
              )}>
                {type.title}
              </h4>
              <p className={cn(
                "text-sm text-gray-400",
                elderlyMode && "text-base"
              )}>
                {type.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Help Text */}
        <div className={cn(
          "mt-8 text-center text-sm text-gray-400",
          elderlyMode && "text-base"
        )}>
          <p>
            💡 <strong className="text-white">Pro Tip:</strong> Enable browser notifications to receive alerts even when the app is closed
          </p>
        </div>
      </div>
    </div>
  );
};

NotificationsEmptyState.displayName = "NotificationsEmptyState";
