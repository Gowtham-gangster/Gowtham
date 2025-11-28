import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { 
  Home, 
  Pill, 
  Calendar, 
  History, 
  Settings, 
  Bell, 
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

interface LayoutProps {
  children: ReactNode;
}

const patientNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/medicines', label: 'Medicines', icon: Pill },
  { path: '/chronic-diseases', label: 'Chronic Diseases', icon: Activity },
  { path: '/prescriptions', label: 'Prescriptions', icon: FileText },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const caregiverNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/caregiver', label: 'Patients', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, elderlyMode } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = user?.role === 'CAREGIVER' ? caregiverNavItems : patientNavItems;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={cn('min-h-screen bg-background', elderlyMode && 'elderly-mode')}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                              location.pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon size={elderlyMode ? 24 : 20} />
                  <span className={cn(elderlyMode && 'text-lg')}>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div 
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border animate-slide-up">
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <Icon size={elderlyMode ? 24 : 20} />
                      <span className={cn(elderlyMode && 'text-lg')}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-6xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon size={elderlyMode ? 28 : 22} />
                <span className={cn('text-xs', elderlyMode && 'text-sm')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
};
