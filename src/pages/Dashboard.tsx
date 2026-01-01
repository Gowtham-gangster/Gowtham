import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { TodayScheduleList } from '@/components/dashboard/TodayScheduleList';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { useStore } from '@/store/useStore';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { Plus, FileText, Pill, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { getTodaysDoses } from '@/services/api';

export const Dashboard = () => {
  const { user, medicines, schedules, doseLogs, elderlyMode } = useStore();

  const greeting = () => {
    try {
      const hour = new Date().getHours();
      const name = user?.name || 'there';
      if (hour < 12) return `Good morning, ${name}`;
      if (hour < 17) return `Good afternoon, ${name}`;
      return `Good evening, ${name}`;
    } catch (error) {
      console.error('Error getting greeting:', error);
      return `Hello, ${user?.name || 'there'}`;
    }
  };

  // Calculate missed doses
  const todaysDoses = getTodaysDoses(medicines, schedules, doseLogs);
  const missedDoses = todaysDoses.filter(d => d.status === 'MISSED');

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
            <h1 className={cn('text-3xl font-bold text-white', elderlyMode && 'text-4xl')}>
              {greeting()}
            </h1>
            <p className={cn('text-gray-400 mt-1', elderlyMode && 'text-lg')}>
              <Calendar size={16} className="inline mr-1" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <CardEnhanced variant="glass" padding="lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} className="text-violet-400" />
              </div>
              <h3 className={cn('text-lg font-semibold mb-2 text-white', elderlyMode && 'text-xl')}>
                Link a Patient
              </h3>
              <p className={cn('text-gray-400 mb-4', elderlyMode && 'text-lg')}>
                Enter an invite code from a patient to start monitoring their medication schedule.
              </p>
              <Link to="/caregiver">
                <ButtonEnhanced variant="primary">Add Patient</ButtonEnhanced>
              </Link>
            </div>
          </CardEnhanced>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 pb-4">
        {/* Header with Personalized Greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-3xl font-bold text-white', elderlyMode && 'text-4xl')}>
              {greeting()}
            </h1>
            <p className={cn('text-gray-400 mt-1', elderlyMode && 'text-lg')}>
              <Calendar size={16} className="inline mr-1" />
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/medicines/new">
              <ButtonEnhanced 
                variant="outline" 
                size={elderlyMode ? 'lg' : 'md'}
                leftIcon={<Plus size={elderlyMode ? 22 : 18} />}
              >
                Add Medicine
              </ButtonEnhanced>
            </Link>
            <Link to="/prescriptions/upload">
              <ButtonEnhanced 
                variant="primary"
                size={elderlyMode ? 'lg' : 'md'}
                leftIcon={<FileText size={elderlyMode ? 22 : 18} />}
              >
                Scan Prescription
              </ButtonEnhanced>
            </Link>
          </div>
        </div>

        {/* Missed Doses Alert Card */}
        {missedDoses.length > 0 && (
          <CardEnhanced 
            variant="bordered" 
            padding="md"
            className="border-red-500/50 bg-red-500/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertTriangle className="text-red-500" size={elderlyMode ? 28 : 24} />
              </div>
              <div className="flex-1">
                <h3 className={cn('font-semibold text-red-500 mb-1', elderlyMode && 'text-xl')}>
                  {missedDoses.length} Missed {missedDoses.length === 1 ? 'Dose' : 'Doses'}
                </h3>
                <p className={cn('text-gray-300', elderlyMode && 'text-lg')}>
                  You have missed medication doses that need attention. Please review and take them as soon as possible.
                </p>
              </div>
              <Link to="#today-schedule">
                <ButtonEnhanced 
                  variant="danger" 
                  size={elderlyMode ? 'lg' : 'md'}
                >
                  Review Now
                </ButtonEnhanced>
              </Link>
            </div>
          </CardEnhanced>
        )}

        {/* Quick Stats */}
        <QuickStats />

        {/* Quick Action Cards - Single column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardEnhanced variant="glass" padding="md" hover>
            <h3 className={cn('font-semibold mb-2 text-white', elderlyMode && 'text-lg')}>
              Chronic Diseases
            </h3>
            <p className={cn('text-gray-400 mb-4', elderlyMode && 'text-base')}>
              Manage chronic conditions and get personalized guidelines.
            </p>
            <Link to="/chronic-diseases">
              <ButtonEnhanced variant="primary" fullWidth>
                Manage Conditions
              </ButtonEnhanced>
            </Link>
          </CardEnhanced>

          <CardEnhanced variant="glass" padding="md" hover>
            <h3 className={cn('font-semibold mb-2 text-white', elderlyMode && 'text-lg')}>
              Orders & Store
            </h3>
            <p className={cn('text-gray-400 mb-4', elderlyMode && 'text-base')}>
              Search vendors and quick-order medicines.
            </p>
            <Link to="/orders-store">
              <ButtonEnhanced variant="primary" fullWidth>
                Open Store
              </ButtonEnhanced>
            </Link>
          </CardEnhanced>

          <CardEnhanced variant="glass" padding="md" hover>
            <h3 className={cn('font-semibold mb-2 text-white', elderlyMode && 'text-lg')}>
              Video Consultation
            </h3>
            <p className={cn('text-gray-400 mb-4', elderlyMode && 'text-base')}>
              Book appointments with doctors and join video consultations.
            </p>
            <Link to="/video-consultation">
              <ButtonEnhanced variant="primary" fullWidth>
                Find a Doctor
              </ButtonEnhanced>
            </Link>
          </CardEnhanced>

          <CardEnhanced variant="glass" padding="md" hover>
            <h3 className={cn('font-semibold mb-2 text-white', elderlyMode && 'text-lg')}>
              Prescription Voice
            </h3>
            <p className={cn('text-gray-400 mb-4', elderlyMode && 'text-base')}>
              Play prescriptions aloud with custom verbosity.
            </p>
            <Link to="/prescription-voice">
              <ButtonEnhanced variant="primary" fullWidth>
                Open Voice Player
              </ButtonEnhanced>
            </Link>
          </CardEnhanced>
        </div>

        {/* Today's Schedule - Prominent Section */}
        <div id="today-schedule">
          <CardEnhanced variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-violet-600/20">
                <Pill className="text-violet-400" size={elderlyMode ? 32 : 24} />
              </div>
              <div>
                <h2 className={cn('text-2xl font-bold text-white', elderlyMode && 'text-3xl')}>
                  Today's Schedule
                </h2>
                <p className={cn('text-gray-400', elderlyMode && 'text-lg')}>
                  Your medication schedule for today
                </p>
              </div>
            </div>
            
            {medicines.length === 0 ? (
              <div className="space-y-6">
                <EmptyState
                  icon={<Pill size={32} />}
                  title="Welcome to MedReminder Pro!"
                  description="Get started by adding your first medicine. We'll help you track your medications, set reminders, and never miss a dose."
                  action={{
                    label: 'Add Your First Medicine',
                    onClick: () => window.location.href = '/medicines/new',
                    icon: <Plus size={18} />
                  }}
                />
                
                {/* Onboarding Tips - Single column on mobile, 3 on tablet/desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <CardEnhanced variant="glass" padding="md">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-violet-600/20">
                        <Pill className="text-violet-400" size={20} />
                      </div>
                      <div>
                        <h4 className={cn('font-semibold text-white mb-1', elderlyMode && 'text-lg')}>
                          Add Medicines
                        </h4>
                        <p className={cn('text-sm text-gray-400', elderlyMode && 'text-base')}>
                          Start by adding your medications with dosage and schedule information.
                        </p>
                      </div>
                    </div>
                  </CardEnhanced>

                  <CardEnhanced variant="glass" padding="md">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-cyan-600/20">
                        <FileText className="text-cyan-400" size={20} />
                      </div>
                      <div>
                        <h4 className={cn('font-semibold text-white mb-1', elderlyMode && 'text-lg')}>
                          Scan Prescriptions
                        </h4>
                        <p className={cn('text-sm text-gray-400', elderlyMode && 'text-base')}>
                          Upload prescription images to automatically extract medication details.
                        </p>
                      </div>
                    </div>
                  </CardEnhanced>

                  <CardEnhanced variant="glass" padding="md">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-magenta-600/20">
                        <Clock className="text-magenta-400" size={20} />
                      </div>
                      <div>
                        <h4 className={cn('font-semibold text-white mb-1', elderlyMode && 'text-lg')}>
                          Get Reminders
                        </h4>
                        <p className={cn('text-sm text-gray-400', elderlyMode && 'text-base')}>
                          Receive timely notifications to never miss a dose of your medications.
                        </p>
                      </div>
                    </div>
                  </CardEnhanced>
                </div>
              </div>
            ) : (
              <TodayScheduleList />
            )}
          </CardEnhanced>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
