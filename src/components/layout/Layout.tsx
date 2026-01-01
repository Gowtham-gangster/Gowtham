import { ReactNode, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { 
  Home, 
  Pill, 
  History, 
  Settings, 
  LogOut, 
  Users,
  FileText,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { EnhancedSidebar, NavItem } from './EnhancedSidebar';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { BottomNavigation } from './BottomNavigation';
import { NavigationBadge } from '@/components/ui/navigation-badge';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const { user, logout, elderlyMode, medicines, notifications } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calculate badge counts
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const lowStockMedicines = medicines.filter(m => 
    m.stockCount !== undefined && m.stockCount < 10
  ).length;
  const missedDoses = notifications.filter(n => 
    n.type === 'MISSED_DOSE' && !n.read
  ).length;

  // Define navigation items with badges
  const patientNavItems: NavItem[] = useMemo(() => [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      badge: missedDoses > 0 ? { count: missedDoses, variant: 'urgent' as const } : undefined
    },
    { 
      path: '/medicines', 
      label: 'Medicines', 
      icon: Pill,
      badge: lowStockMedicines > 0 ? { count: lowStockMedicines, variant: 'default' as const } : undefined
    },
    { 
      path: '/chronic-diseases', 
      label: 'Chronic Diseases', 
      icon: Activity 
    },
    { 
      path: '/prescriptions', 
      label: 'Prescriptions', 
      icon: FileText 
    },
    { 
      path: '/history', 
      label: 'History', 
      icon: History 
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings 
    },
  ], [missedDoses, lowStockMedicines]);

  const caregiverNavItems: NavItem[] = useMemo(() => [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home 
    },
    { 
      path: '/caregiver', 
      label: 'Patients', 
      icon: Users 
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: Settings 
    },
  ], []);

  const navItems = user?.role === 'CAREGIVER' ? caregiverNavItems : patientNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={cn('min-h-screen bg-background', elderlyMode && 'elderly-mode')}>
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass border-b border-border" role="banner">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
            
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="gradient-primary w-9 h-9 rounded-lg flex items-center justify-center">
                <Pill className="text-primary-foreground" size={20} />
              </div>
              <span className="font-bold text-lg hidden sm:inline">MedReminder</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:block text-sm text-muted-foreground">
              {user?.name}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar - Desktop (> 1024px) */}
        <EnhancedSidebar 
          navItems={navItems} 
          elderlyMode={elderlyMode}
        />

        {/* Collapsible Sidebar - Tablet (768px - 1024px) */}
        <CollapsibleSidebar 
          navItems={navItems} 
          elderlyMode={elderlyMode}
        />

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside 
              className="fixed left-0 top-16 bottom-0 w-64 bg-background-secondary border-r border-border/50 animate-slide-up shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              role="navigation"
              aria-label="Mobile menu"
              id="mobile-menu"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label={item.badge && item.badge.count > 0 
                        ? `${item.label} (${item.badge.count} ${item.badge.variant === 'urgent' ? 'urgent' : 'notifications'})`
                        : item.label
                      }
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                        'text-gray-400 hover:bg-violet-600/10 hover:text-violet-300'
                      )}
                    >
                      <Icon size={elderlyMode ? 24 : 20} />
                      <span className={cn(elderlyMode && 'text-lg')}>{item.label}</span>
                      {item.badge && item.badge.count > 0 && (
                        <span className="ml-auto">
                          <NavigationBadge
                            count={item.badge.count}
                            variant={item.badge.variant}
                          />
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 xl:p-8" role="main" tabIndex={-1}>
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile (< 768px) */}
      <BottomNavigation 
        navItems={navItems} 
        elderlyMode={elderlyMode}
        maxItems={5}
      />

      {/* Spacer for bottom nav on mobile */}
      <div className={cn('md:hidden', elderlyMode ? 'h-20' : 'h-16')} />
    </div>
  );
};
