import { useStore } from '@/store/useStore';
import { calculateAdherence, getTodaysDoses } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, AlertTriangle, Package, Calendar } from 'lucide-react';

export const QuickStats = () => {
  const { medicines, schedules, doseLogs, elderlyMode } = useStore();
  
  const todaysDoses = getTodaysDoses(medicines, schedules, doseLogs);
  const adherence = calculateAdherence(doseLogs, 7);
  
  const takenToday = todaysDoses.filter(d => d.status === 'TAKEN').length;
  const totalToday = todaysDoses.length;
  
  const lowStockMedicines = medicines.filter(
    m => m.stockCount <= m.refillThreshold && m.stockCount > 0
  );
  
  const outOfStockMedicines = medicines.filter(m => m.stockCount === 0);

  const stats = [
    {
      label: 'Today\'s Progress',
      value: `${takenToday}/${totalToday}`,
      subtext: 'doses taken',
      icon: Calendar,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: '7-Day Adherence',
      value: `${adherence}%`,
      subtext: adherence >= 80 ? 'Great job!' : 'Keep it up!',
      icon: TrendingUp,
      color: adherence >= 80 ? 'text-success' : 'text-warning',
      bgColor: adherence >= 80 ? 'bg-success/10' : 'bg-warning/10'
    },
    {
      label: 'Low Stock',
      value: lowStockMedicines.length,
      subtext: 'need refill soon',
      icon: Package,
      color: lowStockMedicines.length > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: lowStockMedicines.length > 0 ? 'bg-warning/10' : 'bg-muted'
    },
    {
      label: 'Out of Stock',
      value: outOfStockMedicines.length,
      subtext: 'need immediate refill',
      icon: AlertTriangle,
      color: outOfStockMedicines.length > 0 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: outOfStockMedicines.length > 0 ? 'bg-destructive/10' : 'bg-muted'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-soft hover:shadow-lg transition-shadow duration-200">
            <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={cn(
                    'text-sm text-muted-foreground',
                    elderlyMode && 'text-base'
                  )}>
                    {stat.label}
                  </p>
                  <p className={cn(
                    'text-2xl font-bold mt-1',
                    stat.color,
                    elderlyMode && 'text-3xl'
                  )}>
                    {stat.value}
                  </p>
                  <p className={cn(
                    'text-xs text-muted-foreground mt-0.5',
                    elderlyMode && 'text-sm'
                  )}>
                    {stat.subtext}
                  </p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg',
                  stat.bgColor
                )}>
                  <Icon className={stat.color} size={elderlyMode ? 28 : 20} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
