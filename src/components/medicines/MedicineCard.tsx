import { Link } from 'react-router-dom';
import { Medicine, Schedule } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PillTag } from '@/components/ui/PillTag';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Clock, Package, AlertTriangle, Edit, ChevronRight } from 'lucide-react';
import { getNextDoseTime, getEstimatedDepletionDate } from '@/services/api';
import { format, formatDistanceToNow } from 'date-fns';

interface MedicineCardProps {
  medicine: Medicine;
  schedule?: Schedule;
}

export const MedicineCard = ({ medicine, schedule }: MedicineCardProps) => {
  const { elderlyMode } = useStore();
  
  const nextDose = schedule ? getNextDoseTime(schedule) : null;
  const depletionDate = schedule ? getEstimatedDepletionDate(medicine, schedule) : null;
  
  const isLowStock = medicine.stockCount <= medicine.refillThreshold && medicine.stockCount > 0;
  const isOutOfStock = medicine.stockCount === 0;

  return (
    <Link to={`/medicines/${medicine.id}/edit`}>
      <Card className={cn(
        'shadow-soft hover:shadow-lg transition-all duration-200 cursor-pointer group',
        isOutOfStock && 'border-destructive/50',
        isLowStock && 'border-warning/50'
      )}>
        <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
          <div className="flex items-start gap-4">
            <PillTag
              color={medicine.colorTag}
              form={medicine.form}
              name={medicine.name}
              size={elderlyMode ? 'lg' : 'md'}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={cn(
                    'font-semibold truncate',
                    elderlyMode && 'text-xl'
                  )}>
                    {medicine.nickname || medicine.name}
                  </h3>
                  {medicine.nickname && (
                    <p className="text-sm text-muted-foreground">{medicine.name}</p>
                  )}
                </div>
                <ChevronRight 
                  className="text-muted-foreground group-hover:text-foreground transition-colors" 
                  size={20} 
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge variant="secondary" className={cn(elderlyMode && 'text-sm')}>
                  {medicine.strength}
                </Badge>
                <Badge variant="outline" className={cn(elderlyMode && 'text-sm')}>
                  {medicine.form}
                </Badge>
              </div>
              
              <div className="mt-3 space-y-1">
                {schedule && nextDose && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={14} />
                    <span className={cn(elderlyMode && 'text-base')}>
                      Next: {format(nextDose, 'h:mm a')} ({schedule.timesOfDay.length}x daily)
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Package size={14} className={cn(
                    isOutOfStock ? 'text-destructive' :
                    isLowStock ? 'text-warning' :
                    'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-sm',
                    elderlyMode && 'text-base',
                    isOutOfStock ? 'text-destructive font-medium' :
                    isLowStock ? 'text-warning font-medium' :
                    'text-muted-foreground'
                  )}>
                    {medicine.stockCount} {medicine.form}s remaining
                    {depletionDate && medicine.stockCount > 0 && (
                      <span className="text-muted-foreground font-normal">
                        {' '}• runs out {formatDistanceToNow(depletionDate, { addSuffix: true })}
                      </span>
                    )}
                  </span>
                </div>
                
                {(isLowStock || isOutOfStock) && (
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle size={14} className={isOutOfStock ? 'text-destructive' : 'text-warning'} />
                    <span className={cn(
                      'text-sm font-medium',
                      elderlyMode && 'text-base',
                      isOutOfStock ? 'text-destructive' : 'text-warning'
                    )}>
                      {isOutOfStock ? 'Out of stock! Refill immediately' : 'Running low - refill soon'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
