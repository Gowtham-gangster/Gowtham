import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { getTodaysDoses } from '@/services/api';
import { PillTag } from '@/components/ui/PillTag';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Clock, X, SkipForward, Volume2 } from 'lucide-react';
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
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="text-muted-foreground" size={32} />
        </div>
        <h3 className="text-lg font-medium mb-2">No medications scheduled for today</h3>
        <p className="text-muted-foreground">Add medicines and schedules to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedDoses).map(([period, doses]) => {
        if (doses.length === 0) return null;

        const periodInfo = periodLabels[period as keyof typeof periodLabels];

        return (
          <div key={period} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{periodInfo.icon}</span>
              <span className="font-medium">{periodInfo.label}</span>
              <span className="text-xs">({periodInfo.time})</span>
            </div>

            <div className="space-y-2">
              {doses.map((dose, index) => (
                <div
                  key={`${dose.medicine.id}-${dose.time}-${index}`}
                  className={cn(
                    'p-4 rounded-xl border-2 transition-all duration-200 shadow-soft',
                    getStatusStyles(dose.status),
                    elderlyMode && 'p-6'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <PillTag
                      color={dose.medicine.colorTag}
                      form={dose.medicine.form}
                      name={dose.medicine.name}
                      size={elderlyMode ? 'lg' : 'md'}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          'font-semibold truncate',
                          elderlyMode && 'text-xl'
                        )}>
                          {dose.medicine.nickname || dose.medicine.name}
                        </h4>
                        {dose.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleVoiceReminder(
                              dose.medicine.name,
                              dose.medicine.strength,
                              dose.time
                            )}
                          >
                            <Volume2 size={16} />
                          </Button>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm text-muted-foreground',
                        elderlyMode && 'text-base'
                      )}>
                        {dose.medicine.strength} • {dose.schedule.dosageAmount} {dose.medicine.form}
                        {dose.schedule.dosageAmount > 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className={cn(
                          'text-sm',
                          elderlyMode && 'text-base'
                        )}>
                          {format(new Date(`2000-01-01T${dose.time}`), 'h:mm a')}
                        </span>
                        {dose.status !== 'PENDING' && (
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            dose.status === 'TAKEN' && 'bg-success/20 text-success',
                            dose.status === 'MISSED' && 'bg-destructive/20 text-destructive',
                            dose.status === 'SKIPPED' && 'bg-muted text-muted-foreground'
                          )}>
                            {dose.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {dose.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size={elderlyMode ? 'lg' : 'default'}
                          className={cn(
                            'gradient-success shadow-glow-success',
                            elderlyMode && 'text-lg px-6'
                          )}
                          onClick={() => handleTakeDose(
                            dose.medicine.id,
                            dose.medicine.name,
                            dose.time
                          )}
                        >
                          <Check size={elderlyMode ? 24 : 18} className="mr-1" />
                          Take
                        </Button>
                        <Button
                          variant="outline"
                          size={elderlyMode ? 'lg' : 'default'}
                          onClick={() => handleSkipDose(
                            dose.medicine.id,
                            dose.medicine.name,
                            dose.time
                          )}
                        >
                          <SkipForward size={elderlyMode ? 24 : 18} />
                        </Button>
                      </div>
                    )}

                    {dose.status === 'MISSED' && (
                      <Button
                        variant="outline"
                        size={elderlyMode ? 'lg' : 'default'}
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => handleTakeDose(
                          dose.medicine.id,
                          dose.medicine.name,
                          dose.time
                        )}
                      >
                        <Check size={elderlyMode ? 24 : 18} className="mr-1" />
                        Take Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
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
