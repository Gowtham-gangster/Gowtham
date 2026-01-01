import { cn } from '@/lib/utils';

interface NavigationBadgeProps {
  count: number;
  variant?: 'default' | 'urgent';
  className?: string;
}

export const NavigationBadge = ({ 
  count, 
  variant = 'default',
  className 
}: NavigationBadgeProps) => {
  if (count === 0) return null;
  
  const displayCount = count > 99 ? '99+' : count.toString();
  
  return (
    <span
      className={cn(
        'min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center',
        'text-[10px] font-semibold text-white',
        'transition-all duration-200',
        variant === 'urgent' 
          ? 'bg-red-500 animate-pulse-soft shadow-[0_0_10px_rgba(239,68,68,0.5)]'
          : 'bg-violet-600',
        className
      )}
    >
      {displayCount}
    </span>
  );
};
