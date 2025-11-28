import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TodayScheduleList } from '@/components/dashboard/TodayScheduleList';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Plus, FileText, Pill, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { user, medicines, elderlyMode } = useStore();

  const greeting = () => {
    try {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    } catch (error) {
      console.error('Error getting greeting:', error);
      return 'Hello';
    }
  };

  // Safety check for user
  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (user.role === 'CAREGIVER') {
    return (
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
              {greeting()}, {user.name}
            </h1>
            <p className="text-muted-foreground">Caregiver Dashboard</p>
          </div>
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Link a Patient</h3>
              <p className="text-muted-foreground mb-4">
                Enter an invite code from a patient to start monitoring their medication schedule.
              </p>
              <Link to="/caregiver">
                <Button className="gradient-primary">Add Patient</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
              {greeting()}, {user?.name}
            </h1>
            <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
              <Calendar size={16} className="inline mr-1" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/medicines/new">
              <Button 
                variant="outline" 
                className={cn('gap-2', elderlyMode && 'h-12 text-lg')}
              >
                <Plus size={elderlyMode ? 22 : 18} />
                Add Medicine
              </Button>
            </Link>
            <Link to="/prescriptions/upload">
              <Button 
                className={cn('gradient-primary gap-2', elderlyMode && 'h-12 text-lg')}
              >
                <FileText size={elderlyMode ? 22 : 18} />
                Scan Prescription
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card glass p-4 shadow-soft">
            <h3 className={cn('font-semibold mb-2', elderlyMode && 'text-lg')}>Chronic Diseases</h3>
            <p className="text-muted-foreground mb-4">Manage chronic conditions and get personalized guidelines.</p>
            <Link to="/chronic-diseases">
              <Button className="gradient-primary">Manage Conditions</Button>
            </Link>
          </div>

          <div className="card glass p-4 shadow-soft">
            <h3 className={cn('font-semibold mb-2', elderlyMode && 'text-lg')}>Orders & Store</h3>
            <p className="text-muted-foreground mb-4">Search vendors and quick-order medicines.</p>
            <Link to="/orders-store">
              <Button className="gradient-primary">Open Store</Button>
            </Link>
          </div>

          <div className="card glass p-4 shadow-soft">
            <h3 className={cn('font-semibold mb-2', elderlyMode && 'text-lg')}>Video Consultation</h3>
            <p className="text-muted-foreground mb-4">Start or join a secure video call with providers.</p>
            <Link to="/video-consultation">
              <Button className="gradient-primary">Start Video</Button>
            </Link>
          </div>

          <div className="card glass p-4 shadow-soft">
            <h3 className={cn('font-semibold mb-2', elderlyMode && 'text-lg')}>Prescription Voice</h3>
            <p className="text-muted-foreground mb-4">Play prescriptions aloud with custom verbosity.</p>
            <Link to="/prescription-voice">
              <Button className="gradient-primary">Open Voice Player</Button>
            </Link>
          </div>
        </div>

        {/* Today's Schedule */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-2xl')}>
              <Pill size={elderlyMode ? 28 : 22} className="text-primary" />
              Today's Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medicines.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill size={32} className="text-muted-foreground" />
                </div>
                <h3 className={cn('text-lg font-semibold mb-2', elderlyMode && 'text-xl')}>
                  No medications added yet
                </h3>
                <p className={cn('text-muted-foreground mb-4', elderlyMode && 'text-lg')}>
                  Add your first medicine to get started with reminders.
                </p>
                <Link to="/medicines/new">
                  <Button className="gradient-primary gap-2">
                    <Plus size={18} />
                    Add Your First Medicine
                  </Button>
                </Link>
              </div>
            ) : (
              <TodayScheduleList />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
