import { Link } from 'react-router-dom';
import { Medicine, Schedule } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PillTag } from '@/components/ui/PillTag';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';
import { Clock, Package, AlertTriangle, ChevronRight, Pill, Calendar } from 'lucide-react';
import { getNextDoseTime, getEstimatedDepletionDate } from '@/services/api';
import { format, formatDistanceToNow, differenceInMinutes, isPast } from 'date-fns';

interface MedicineCardProps {
  medicine: Medicine;
  schedule?: Schedule;
}

export const MedicineCard = ({ medicine, schedule }: MedicineCardProps) => {
  const { elderlyMode } = useStore();
  
  const nextDose = schedule ? getNextDoseTime(schedule) : null;
  const depletionDate = schedule ? getEstimatedDepletionDate(medicine, schedule) : null;
  
  const isLowStock = medicine.stockCount !== undefined && medicine.refillThreshold !== undefined && 
                     medicine.stockCount <= medicine.refillThreshold && medicine.stockCount > 0;
  const isOutOfStock = medicine.stockCount === 0;
  
  // Calculate if dose is due soon (< 30 minutes) or overdue
  const isDueSoon = nextDose && differenceInMinutes(nextDose, new Date()) < 30 && differenceInMinutes(nextDose, new Date()) >= 0;
  const isOverdue = nextDose && isPast(nextDose);
  
  // Calculate stock level percentage for progress bar
  const stockPercentage = medicine.stockCount !== undefined && medicine.refillThreshold !== undefined
    ? Math.min(100, (medicine.stockCount / (medicine.refillThreshold * 2)) * 100)
    : 100;

  return (
    <Link to={`/medicines/${medicine.id}/edit`}>
      <Card className={cn(
        'shadow-soft hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden',
        isOutOfStock && 'border-red-500/50',
        isLowStock && 'border-yellow-500/50',
        isDueSoon && 'border-cyan-500/50 animate-pulse-border',
        isOverdue && 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
      )}>
        {/* Pulsing border effect for doses due soon */}
        {isDueSoon && (
          <div className="absolute inset-0 border-2 border-cyan-500 rounded-lg animate-pulse pointer-events-none" />
        )}
        
        <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
          <div className="flex items-start gap-4">
            <PillTag
              color={medicine.colorTag}
              form={medicine.form}
              name={medicine.name}
              size={elderlyMode ? 'lg' : 'md'}
            />
            
            <div className="flex-1 min-w-0">
              {/* Medication name - prominently displayed at 20px bold */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={cn(
                    'font-bold text-xl text-white leading-tight',
                    elderlyMode && 'text-2xl'
                  )}>
                    {medicine.nickname || medicine.name}
                  </h3>
                  {medicine.nickname && (
                    <p className="text-sm text-gray-400 mt-1">{medicine.name}</p>
                  )}
                </div>
                <ChevronRight 
                  className="text-gray-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" 
                  size={20} 
                />
              </div>
              
              {/* Dosage and frequency with icons */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <Pill size={16} className="text-violet-400 flex-shrink-0" />
                  <span className={cn('text-sm font-medium', elderlyMode && 'text-base')}>
                    {medicine.strength}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className={cn('text-sm', elderlyMode && 'text-base')}>
                    {medicine.form}
                  </span>
                </div>
                
                {schedule && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} className="text-magenta-400 flex-shrink-0" />
                    <span className={cn('text-sm', elderlyMode && 'text-base')}>
                      {schedule.timesOfDay.length}x daily
                    </span>
                  </div>
                )}
              </div>
              
              {/* Next dose time with status indicator */}
              {schedule && nextDose && (
                <div className={cn(
                  'flex items-center gap-2 p-2 rounded-lg mb-3',
                  isOverdue ? 'bg-red-500/20 border border-red-500/50' :
                  isDueSoon ? 'bg-cyan-500/20 border border-cyan-500/50' :
                  'bg-background-tertiary/50'
                )}>
                  <Clock size={16} className={cn(
                    'flex-shrink-0',
                    isOverdue ? 'text-red-400' :
                    isDueSoon ? 'text-cyan-400' :
                    'text-gray-400'
                  )} />
                  <div className="flex-1">
                    <span className={cn(
                      'text-sm font-medium',
                      elderlyMode && 'text-base',
                      isOverdue ? 'text-red-300' :
                      isDueSoon ? 'text-cyan-300' :
                      'text-gray-300'
                    )}>
                      {isOverdue ? 'Overdue: ' : 'Next dose: '}
                      {format(nextDose, 'h:mm a')}
                    </span>
                  </div>
                  {isOverdue && (
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                  )}
                </div>
              )}
              
              {/* Stock level with visual progress bar */}
              {medicine.stockCount !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={14} className={cn(
                        'flex-shrink-0',
                        isOutOfStock ? 'text-red-400' :
                        isLowStock ? 'text-yellow-400' :
                        'text-gray-400'
                      )} />
                      <span className={cn(
                        'text-sm',
                        elderlyMode && 'text-base',
                        isOutOfStock ? 'text-red-300 font-medium' :
                        isLowStock ? 'text-yellow-300 font-medium' :
                        'text-gray-300'
                      )}>
                        {medicine.stockCount} {medicine.form}s
                      </span>
                    </div>
                    {(isLowStock || isOutOfStock) && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'text-xs',
                          isOutOfStock ? 'border-red-500 text-red-300' : 'border-yellow-500 text-yellow-300'
                        )}
                      >
                        {isOutOfStock ? 'Out of stock' : 'Low stock'}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Visual progress bar for stock level */}
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full transition-all duration-300 rounded-full',
                        stockPercentage > 50 ? 'bg-green-500' :
                        stockPercentage > 20 ? 'bg-yellow-500' :
                        'bg-red-500'
                      )}
                      style={{ width: `${Math.max(5, stockPercentage)}%` }}
                    />
                  </div>
                  
                  {depletionDate && medicine.stockCount > 0 && (
                    <p className="text-xs text-gray-500">
                      Runs out {formatDistanceToNow(depletionDate, { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
