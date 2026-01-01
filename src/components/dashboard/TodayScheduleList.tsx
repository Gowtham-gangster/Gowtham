import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getTodaysDoses } from '@/services/api';
import { PillTag } from '@/components/ui/PillTag';
import { Button } from '@/components/ui/button';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
import { cn } from '@/lib/utils';
import { Check, Clock, X, SkipForward, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceReminder } from '@/hooks/useVoiceReminder';
import { DoseActionModal } from './DoseActionModal';
import { format } from 'date-fns';

export const TodayScheduleList = () => {
  const { medicines, schedules, doseLogs, logDose, elderlyMode, addNotification, notifications, user } = useStore();
  const { speakDoseReminder, speakConfirmation } = useVoiceReminder();
  const [selectedDose, setSelectedDose] = useState<{
    medicineId: string;
    medicineName: string;
    scheduledTime: string;
    action: 'TAKEN' | 'SKIPPED';
  } | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | undefined>(undefined);
  const [, setTick] = useState(0);

  // Force re-render every minute to update "due" status
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const todaysDoses = getTodaysDoses(medicines, schedules, doseLogs);
  const now = new Date();
  const currentHour = now.getHours();

  // DISABLED: Automatic notifications temporarily disabled to prevent infinite loop
  // TODO: Implement proper notification system with better state management
  // const notificationIndex = useMemo(() => {
  //   return new Set(notifications.map(n => `${n.type}:${n.medicineId}:${n.createdAt.slice(0, 13)}`));
  // }, [notifications.length]);

  // useEffect(() => {
  //   // Notification generation disabled
  // }, []);

  // Group doses by time period
  const groupedDoses = {
    morning: todaysDoses.filter(d => {
      const hour = parseInt(d.time.split(':')[0]);
      return hour >= 5 && hour < 12;
    }),
    afternoon: todaysDoses.filter(d => {
      const hour = parseInt(d.time.split(':')[0]);
      return hour >= 12 && hour < 17;
    }),
    evening: todaysDoses.filter(d => {
      const hour = parseInt(d.time.split(':')[0]);
      return hour >= 17 && hour < 21;
    }),
    night: todaysDoses.filter(d => {
      const hour = parseInt(d.time.split(':')[0]);
      return hour >= 21 || hour < 5;
    })
  };

  const periodLabels = {
    morning: { label: 'Morning', icon: '🌅', time: '5 AM - 12 PM' },
    afternoon: { label: 'Afternoon', icon: '☀️', time: '12 PM - 5 PM' },
    evening: { label: 'Evening', icon: '🌆', time: '5 PM - 9 PM' },
    night: { label: 'Night', icon: '🌙', time: '9 PM - 5 AM' }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'TAKEN':
        return 'bg-success/10 border-success text-success';
      case 'MISSED':
        return 'bg-destructive/10 border-destructive text-destructive';
      case 'SKIPPED':
        return 'bg-muted border-muted-foreground/30 text-muted-foreground';
      default:
        return 'bg-card border-border';
    }
  };

  const handleTakeDose = (medicineId: string, medicineName: string, scheduledTime: string) => {
    const schedule = schedules.find(s => s.medicineId === medicineId);
    let warning: string | undefined;
    const today = new Date().toISOString().split('T')[0];
    if (schedule) {
      if (schedule.maxDosePerIntake && schedule.dosageAmount > schedule.maxDosePerIntake) {
        warning = `This intake exceeds the max per intake (${schedule.maxDosePerIntake}). Proceed with caution.`;
      }
      const takenToday = doseLogs.filter(l => l.medicineId === medicineId && l.status === 'TAKEN' && l.scheduledTime.startsWith(today)).length * (schedule.dosageAmount || 1);
      if (schedule.maxDosePerDay && takenToday + (schedule.dosageAmount || 1) > schedule.maxDosePerDay) {
        warning = `This will exceed max daily dose (${schedule.maxDosePerDay}). Confirm to proceed.`;
      }
    }
    setWarningMessage(warning);
    setSelectedDose({ medicineId, medicineName, scheduledTime, action: 'TAKEN' });
  };

  const handleSkipDose = (medicineId: string, medicineName: string, scheduledTime: string) => {
    setSelectedDose({ medicineId, medicineName, scheduledTime, action: 'SKIPPED' });
  };

  const handleConfirmAction = (notes?: string) => {
    if (!selectedDose) return;

    const today = new Date().toISOString().split('T')[0];
    logDose(
      selectedDose.medicineId,
      `${today}T${selectedDose.scheduledTime}:00`,
      selectedDose.action,
      notes
    );
    if (selectedDose.action === 'TAKEN') {
      const schedule = schedules.find(s => s.medicineId === selectedDose.medicineId);
      if (schedule) {
        const perIntake = schedule.maxDosePerIntake || Infinity;
        const perDay = schedule.maxDosePerDay || Infinity;
        const intakeExceeded = (schedule.dosageAmount || 1) > perIntake;
        const takenTodayCount = doseLogs.filter(l => l.medicineId === selectedDose.medicineId && l.status === 'TAKEN' && l.scheduledTime.startsWith(today)).length * (schedule.dosageAmount || 1);
        const dailyExceeded = takenTodayCount > perDay;
        if (intakeExceeded || dailyExceeded) {
          addNotification({
            id: Math.random().toString(36).slice(2),
            userId: user?.id || '',
            type: 'CAREGIVER_ALERT',
            message: `High dose recorded for ${schedule.medicineId}. Please review.`,
            medicineId: selectedDose.medicineId,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    speakConfirmation(
      selectedDose.action.toLowerCase(),
      selectedDose.medicineName
    );

    setSelectedDose(null);
    setWarningMessage(undefined);
  };

  const handleVoiceReminder = (medicineName: string, strength: string, time: string) => {
    const formattedTime = format(new Date(`2000-01-01T${time}`), 'h:mm a');
    speakDoseReminder(medicineName, strength, formattedTime);
  };

  if (todaysDoses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-violet-400" size={32} />
        </div>
        <h3 className={cn('text-lg font-medium mb-2 text-white', elderlyMode && 'text-xl')}>
          No medications scheduled for today
        </h3>
        <p className={cn('text-gray-400', elderlyMode && 'text-lg')}>
          Add medicines and schedules to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedDoses).map(([period, doses]) => {
        if (doses.length === 0) return null;

        const periodInfo = periodLabels[period as keyof typeof periodLabels];

        return (
          <div key={period} className="relative">
            {/* Timeline Period Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/20 border border-violet-500/30',
                elderlyMode && 'px-5 py-3'
              )}>
                <span className={cn('text-2xl', elderlyMode && 'text-3xl')}>{periodInfo.icon}</span>
                <div>
                  <span className={cn('font-semibold text-white', elderlyMode && 'text-xl')}>
                    {periodInfo.label}
                  </span>
                  <span className={cn('text-xs text-gray-400 ml-2', elderlyMode && 'text-sm')}>
                    {periodInfo.time}
                  </span>
                </div>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-violet-500/30 to-transparent" />
            </div>

            {/* Timeline Doses */}
            <div className="space-y-3 pl-4 border-l-2 border-violet-500/30">
              {doses.map((dose, index) => {
                const isDueSoon = dose.status === 'PENDING' && (() => {
                  const now = new Date();
                  const [hours, minutes] = dose.time.split(':').map(Number);
                  const doseTime = new Date();
                  doseTime.setHours(hours, minutes, 0, 0);
                  const diffMinutes = (doseTime.getTime() - now.getTime()) / (1000 * 60);
                  return diffMinutes > 0 && diffMinutes <= 30;
                })();

                return (
                  <div
                    key={`${dose.medicine.id}-${dose.time}-${index}`}
                    className="relative -ml-4 pl-8"
                  >
                    {/* Timeline Marker */}
                    <div className={cn(
                      'absolute left-0 top-6 w-4 h-4 rounded-full border-2 transition-all duration-300',
                      dose.status === 'TAKEN' && 'bg-green-500 border-green-500 shadow-glow-success',
                      dose.status === 'MISSED' && 'bg-red-500 border-red-500 shadow-glow-danger animate-pulse',
                      dose.status === 'SKIPPED' && 'bg-gray-500 border-gray-500',
                      dose.status === 'PENDING' && !isDueSoon && 'bg-violet-500 border-violet-500',
                      dose.status === 'PENDING' && isDueSoon && 'bg-cyan-500 border-cyan-500 shadow-glow-cyan animate-pulse',
                      elderlyMode && 'w-5 h-5'
                    )} />

                    {/* Medication Card */}
                    <CardEnhanced
                      variant={dose.status === 'MISSED' ? 'bordered' : 'glass'}
                      padding="md"
                      className={cn(
                        'transition-all duration-300',
                        dose.status === 'MISSED' && 'border-red-500/50 bg-red-500/10',
                        isDueSoon && 'border-cyan-500/50 shadow-glow-cyan',
                        elderlyMode && 'p-6'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        {/* Time Badge */}
                        <div className={cn(
                          'flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-background-secondary border border-white/10',
                          elderlyMode && 'px-4 py-3'
                        )}>
                          <Clock 
                            size={elderlyMode ? 24 : 18} 
                            className={cn(
                              'mb-1',
                              dose.status === 'MISSED' && 'text-red-500',
                              isDueSoon && 'text-cyan-500',
                              dose.status === 'TAKEN' && 'text-green-500',
                              dose.status === 'PENDING' && !isDueSoon && 'text-violet-400'
                            )} 
                          />
                          <span className={cn(
                            'text-sm font-semibold text-white',
                            elderlyMode && 'text-base'
                          )}>
                            {format(new Date(`2000-01-01T${dose.time}`), 'h:mm')}
                          </span>
                          <span className={cn(
                            'text-xs text-gray-400',
                            elderlyMode && 'text-sm'
                          )}>
                            {format(new Date(`2000-01-01T${dose.time}`), 'a')}
                          </span>
                        </div>

                        {/* Medicine Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <PillTag
                              color={dose.medicine.colorTag}
                              form={dose.medicine.form}
                              name={dose.medicine.name}
                              size={elderlyMode ? 'lg' : 'md'}
                            />
                            {dose.status === 'PENDING' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn('h-8 w-8', elderlyMode && 'h-10 w-10')}
                                onClick={() => handleVoiceReminder(
                                  dose.medicine.name,
                                  dose.medicine.strength,
                                  dose.time
                                )}
                              >
                                <Volume2 size={elderlyMode ? 20 : 16} />
                              </Button>
                            )}
                          </div>
                          
                          <h4 className={cn(
                            'font-semibold text-white truncate',
                            elderlyMode && 'text-xl'
                          )}>
                            {dose.medicine.nickname || dose.medicine.name}
                          </h4>
                          
                          <p className={cn(
                            'text-sm text-gray-400',
                            elderlyMode && 'text-base'
                          )}>
                            {dose.medicine.strength} • {dose.schedule.dosageAmount} {dose.medicine.form}
                            {dose.schedule.dosageAmount > 1 ? 's' : ''}
                          </p>

                          {/* Status Badge */}
                          {dose.status !== 'PENDING' && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                                dose.status === 'TAKEN' && 'bg-green-500/20 text-green-500',
                                dose.status === 'MISSED' && 'bg-red-500/20 text-red-500',
                                dose.status === 'SKIPPED' && 'bg-gray-500/20 text-gray-400',
                                elderlyMode && 'text-sm px-3 py-1.5'
                              )}>
                                {dose.status === 'TAKEN' && <Check size={12} />}
                                {dose.status === 'MISSED' && <AlertCircle size={12} />}
                                {dose.status === 'SKIPPED' && <SkipForward size={12} />}
                                {dose.status}
                              </span>
                            </div>
                          )}

                          {/* Due Soon Indicator */}
                          {isDueSoon && (
                            <div className="flex items-center gap-1 mt-2 text-cyan-500">
                              <AlertCircle size={14} />
                              <span className={cn('text-xs font-medium', elderlyMode && 'text-sm')}>
                                Due soon
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {dose.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <ButtonEnhanced
                              variant="primary"
                              size={elderlyMode ? 'lg' : 'md'}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-glow-success"
                              leftIcon={<Check size={elderlyMode ? 24 : 18} />}
                              onClick={() => handleTakeDose(
                                dose.medicine.id,
                                dose.medicine.name,
                                dose.time
                              )}
                            >
                              Take
                            </ButtonEnhanced>
                            <ButtonEnhanced
                              variant="outline"
                              size={elderlyMode ? 'lg' : 'md'}
                              onClick={() => handleSkipDose(
                                dose.medicine.id,
                                dose.medicine.name,
                                dose.time
                              )}
                            >
                              <SkipForward size={elderlyMode ? 24 : 18} />
                            </ButtonEnhanced>
                          </div>
                        )}

                        {dose.status === 'MISSED' && (
                          <ButtonEnhanced
                            variant="danger"
                            size={elderlyMode ? 'lg' : 'md'}
                            leftIcon={<Check size={elderlyMode ? 24 : 18} />}
                            onClick={() => handleTakeDose(
                              dose.medicine.id,
                              dose.medicine.name,
                              dose.time
                            )}
                          >
                            Take Now
                          </ButtonEnhanced>
                        )}
                      </div>
                    </CardEnhanced>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <DoseActionModal
        open={!!selectedDose}
        onClose={() => setSelectedDose(null)}
        onConfirm={handleConfirmAction}
        medicineName={selectedDose?.medicineName || ''}
        action={selectedDose?.action || 'TAKEN'}
        warningMessage={warningMessage}
      />
    </div>
  );
};
