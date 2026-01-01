import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NavItem } from './EnhancedSidebar';
import { NavigationBadge } from '@/components/ui/navigation-badge';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollapsibleSidebarProps {
  navItems: NavItem[];
  elderlyMode?: boolean;
  className?: string;
}

export const CollapsibleSidebar = ({ 
  navItems, 
  elderlyMode = false,
  className 
}: CollapsibleSidebarProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        'hidden md:flex lg:hidden flex-col border-r border-border/50',
        'bg-gradient-to-b from-background-secondary/50 to-background-primary/50',
        'backdrop-blur-sm min-h-[calc(100vh-4rem)]',
        'transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Toggle button */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-violet-400"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-2">
        {navItems.map((item) => {
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
                'group relative flex items-center gap-3 rounded-lg',
                'transition-all duration-200',
                'hover:scale-[1.02]',
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3',
                isActive
                  ? cn(
                      'bg-gradient-to-r from-violet-600/20 to-magenta-600/20',
                      'text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]',
                      'border border-violet-500/30'
                    )
                  : cn(
                      'text-gray-400',
                      'hover:bg-violet-600/10 hover:text-violet-300',
                      'hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    )
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Neon glow effect for active state */}
              {isActive && (
                <div 
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600/10 to-magenta-600/10 blur-sm"
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex items-center justify-center">
                <Icon 
                  size={elderlyMode ? 26 : 20} 
                  className={cn(
                    'relative z-10 transition-transform duration-200',
                    'group-hover:scale-110',
                    isActive && 'text-violet-400'
                  )}
                />
                
                {item.badge && item.badge.count > 0 && isCollapsed && (
                  <NavigationBadge
                    count={item.badge.count}
                    variant={item.badge.variant}
                    className="absolute -top-1 -right-1"
                  />
                )}
              </div>
              
              {!isCollapsed && (
                <>
                  <span 
                    className={cn(
                      'relative z-10 font-medium',
                      elderlyMode ? 'text-xl' : 'text-base'
                    )}
                  >
                    {item.label}
                  </span>
                  
                  {item.badge && item.badge.count > 0 && (
                    <NavigationBadge
                      count={item.badge.count}
                      variant={item.badge.variant}
                      className="relative z-10 ml-auto"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
