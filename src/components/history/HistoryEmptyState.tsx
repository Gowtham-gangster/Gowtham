import { EmptyState } from '@/components/ui/empty-state';
import { History, Calendar, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

/**
 * HistoryEmptyState - Enhanced empty state for dose history
 * Includes helpful guidance for tracking medication adherence
 * Validates: Requirements 14.1, 14.2
 */
export const HistoryEmptyState = () => {
  const { elderlyMode } = useStore();

  const historyTips = [
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Track Doses",
      description: "Every dose you take or miss is automatically logged"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "View Trends",
      description: "Monitor your adherence rate and identify patterns"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: "Stay Consistent",
      description: "Build healthy habits with detailed history tracking"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Main Empty State */}
      <EmptyState
        icon={<History className="w-8 h-8" />}
        title="No dose history yet"
        description="Your medication history will appear here once you start taking doses. Track your adherence and build healthy habits."
      />

      {/* History Tips */}
      <div className="max-w-3xl mx-auto">
        <h3 className={cn(
          "text-center text-lg font-semibold text-white mb-6",
          elderlyMode && "text-xl"
        )}>
          Why tracking matters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {historyTips.map((tip, index) => (
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
            💡 <strong className="text-white">Pro Tip:</strong> Add medicines and set up schedules to start building your dose history
          </p>
        </div>
      </div>
    </div>
  );
};

HistoryEmptyState.displayName = "HistoryEmptyState";
