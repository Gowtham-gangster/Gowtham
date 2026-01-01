import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItem } from './EnhancedSidebar';
import { NavigationBadge } from '@/components/ui/navigation-badge';

interface BottomNavigationProps {
  navItems: NavItem[];
  elderlyMode?: boolean;
  maxItems?: number;
}

export const BottomNavigation = ({ 
  navItems, 
  elderlyMode = false,
  maxItems = 5 
}: BottomNavigationProps) => {
  const location = useLocation();
  const displayItems = navItems.slice(0, maxItems);

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 lg:hidden',
        'bg-gradient-to-t from-background-secondary to-background-secondary/95',
        'backdrop-blur-md border-t border-border/50 z-50',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.3)]'
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div 
        className={cn(
          'flex justify-around items-center',
          elderlyMode ? 'h-20' : 'h-16'
        )}
      >
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          location.pathname.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.badge && item.badge.count > 0 
                ? `${item.label} (${item.badge.count} ${item.badge.variant === 'urgent' ? 'urgent' : 'notifications'})`
                : item.label
              }
              className={cn(
                'relative flex flex-col items-center justify-center gap-1',
                'px-3 py-2 rounded-lg transition-all duration-200',
                'min-w-[44px] min-h-[44px]',
                elderlyMode && 'min-w-[48px] min-h-[48px]',
                isActive
                  ? 'text-violet-400'
                  : 'text-gray-400 hover:text-violet-300'
              )}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-lg bg-violet-600/20 blur-sm"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative">
                <Icon 
                  size={elderlyMode ? 28 : 22} 
                  className={cn(
                    'transition-transform duration-200',
                    isActive && 'scale-110'
                  )}
                />
                
                {item.badge && item.badge.count > 0 && (
                  <NavigationBadge
                    count={item.badge.count}
                    variant={item.badge.variant}
                    className="absolute -top-2 -right-2"
                  />
                )}
              </div>
              
              <span 
                className={cn(
                  'text-xs font-medium relative z-10',
                  elderlyMode && 'text-sm'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
