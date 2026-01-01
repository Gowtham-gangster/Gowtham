import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/empty-state';
import { Pill, Plus, Clock, Bell, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

/**
 * MedicinesEmptyState - Enhanced empty state for medicines list
 * Includes onboarding tips and helpful guidance for first-time users
 */
export const MedicinesEmptyState = () => {
  const navigate = useNavigate();
  const { elderlyMode } = useStore();

  const onboardingTips = [
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Never Miss a Dose",
      description: "Set up schedules and get timely reminders for each medication"
    },
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Smart Notifications",
      description: "Receive alerts before each dose is due"
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Track Your History",
      description: "Keep a complete log of all doses taken"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <EmptyState
        icon={<Pill className="w-8 h-8" />}
        title="No medicines yet"
        description="Start managing your medications by adding your first medicine. Track doses, set reminders, and never miss a dose again."
        action={{
          label: "Add Your First Medicine",
          onClick: () => navigate('/medicines/new'),
          icon: <Plus className="w-5 h-5" />
        }}
      />

      {/* Onboarding Tips */}
      <div className="max-w-3xl mx-auto">
        <h3 className={cn(
          "text-center text-lg font-semibold text-white mb-6",
          elderlyMode && "text-xl"
        )}>
          What you can do with MedReminder Pro
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {onboardingTips.map((tip, index) => (
            <div
              key={index}
              className={cn(
                "glass backdrop-blur-md bg-background-secondary/50 border border-white/10",
                "rounded-xl p-6 text-center transition-all duration-200",
                "hover:scale-105 hover:shadow-glow hover:border-violet-500/30"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-3 text-violet-400">
                {tip.icon}
              </div>
              <h4 className={cn(
                "font-semibold text-white mb-2",
                elderlyMode && "text-lg"
              )}>
                {tip.title}
              </h4>
              <p className={cn(
                "text-sm text-gray-400",
                elderlyMode && "text-base"
              )}>
                {tip.description}
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
            💡 <strong className="text-white">Pro Tip:</strong> You can also add medicines by uploading a prescription photo or using voice input
          </p>
        </div>
      </div>
    </div>
  );
};

MedicinesEmptyState.displayName = "MedicinesEmptyState";
