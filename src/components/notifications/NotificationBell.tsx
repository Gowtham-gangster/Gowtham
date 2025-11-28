import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDistanceToNow } from 'date-fns';

const notificationTypeIcons = {
  DOSE_DUE: '💊',
  MISSED_DOSE: '⚠️',
  REFILL_WARNING: '📦',
  CAREGIVER_ALERT: '👥'
};

const notificationTypeColors = {
  DOSE_DUE: 'bg-primary/10 border-primary/20',
  MISSED_DOSE: 'bg-destructive/10 border-destructive/20',
  REFILL_WARNING: 'bg-warning/10 border-warning/20',
  CAREGIVER_ALERT: 'bg-secondary/10 border-secondary/20'
};

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { notifications, markNotificationRead, clearNotifications, elderlyMode } = useStore();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={elderlyMode ? 24 : 20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center animate-pulse-soft">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearNotifications}
                className="text-xs text-muted-foreground"
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="mx-auto mb-2 opacity-50" size={32} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors',
                  !notification.read && 'bg-primary/5'
                )}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className={cn(
                  'flex gap-3 p-2 rounded-lg border',
                  notificationTypeColors[notification.type]
                )}>
                  <span className="text-xl">
                    {notificationTypeIcons[notification.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm', !notification.read && 'font-medium')}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
