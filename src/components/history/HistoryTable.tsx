import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { DoseLog, DoseStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PillTag } from '@/components/ui/PillTag';
import { cn } from '@/lib/utils';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import { Filter, Download } from 'lucide-react';

const statusColors: Record<DoseStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  TAKEN: 'bg-success/20 text-success',
  MISSED: 'bg-destructive/20 text-destructive',
  SKIPPED: 'bg-muted text-muted-foreground'
};

export const HistoryTable = () => {
  const { doseLogs, medicines, elderlyMode } = useStore();
  
  const [dateRange, setDateRange] = useState('7');
  const [selectedMedicine, setSelectedMedicine] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredLogs = useMemo(() => {
    let logs = [...doseLogs];
    
    // Date filter
    const days = parseInt(dateRange);
    const startDate = subDays(new Date(), days);
    logs = logs.filter(log => 
      isWithinInterval(parseISO(log.scheduledTime), {
        start: startDate,
        end: new Date()
      })
    );
    
    // Medicine filter
    if (selectedMedicine !== 'all') {
      logs = logs.filter(log => log.medicineId === selectedMedicine);
    }
    
    // Status filter
    if (selectedStatus !== 'all') {
      logs = logs.filter(log => log.status === selectedStatus);
    }
    
    // Sort by date descending
    logs.sort((a, b) => 
      new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
    );
    
    return logs;
  }, [doseLogs, dateRange, selectedMedicine, selectedStatus]);

  const getMedicine = (id: string) => medicines.find(m => m.id === id);

  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const taken = filteredLogs.filter(l => l.status === 'TAKEN').length;
    const missed = filteredLogs.filter(l => l.status === 'MISSED').length;
    const skipped = filteredLogs.filter(l => l.status === 'SKIPPED').length;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 100;
    
    return { total, taken, missed, skipped, adherence };
  }, [filteredLogs]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{stats.adherence}%</p>
            <p className="text-sm text-muted-foreground">Adherence</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Doses</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.taken}</p>
            <p className="text-sm text-muted-foreground">Taken</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.missed}</p>
            <p className="text-sm text-muted-foreground">Missed</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.skipped}</p>
            <p className="text-sm text-muted-foreground">Skipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={cn(elderlyMode && 'text-xl')}>Dose History</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="pb-4 pt-0 border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className={cn(elderlyMode && 'text-lg')}>Time Period</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="14">Last 14 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={cn(elderlyMode && 'text-lg')}>Medicine</Label>
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All medicines</SelectItem>
                    {medicines.map((med) => (
                      <SelectItem key={med.id} value={med.id}>
                        {med.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className={cn(elderlyMode && 'text-lg')}>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className={cn(elderlyMode && 'h-12 text-lg')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="TAKEN">Taken</SelectItem>
                    <SelectItem value="MISSED">Missed</SelectItem>
                    <SelectItem value="SKIPPED">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardContent className="p-0">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No dose history found for the selected filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={cn(elderlyMode && 'text-base')}>Date</TableHead>
                    <TableHead className={cn(elderlyMode && 'text-base')}>Time</TableHead>
                    <TableHead className={cn(elderlyMode && 'text-base')}>Medicine</TableHead>
                    <TableHead className={cn(elderlyMode && 'text-base')}>Status</TableHead>
                    <TableHead className={cn(elderlyMode && 'text-base')}>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const medicine = getMedicine(log.medicineId);
                    return (
                      <TableRow key={log.id}>
                        <TableCell className={cn(elderlyMode && 'text-base')}>
                          {format(parseISO(log.scheduledTime), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className={cn(elderlyMode && 'text-base')}>
                          {format(parseISO(log.scheduledTime), 'h:mm a')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {medicine && (
                              <PillTag
                                color={medicine.colorTag}
                                form={medicine.form}
                                name={medicine.name}
                                size="sm"
                              />
                            )}
                            <span className={cn(elderlyMode && 'text-base')}>
                              {medicine?.name || 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(statusColors[log.status], elderlyMode && 'text-sm')}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className={cn(
                          'max-w-[200px] truncate text-muted-foreground',
                          elderlyMode && 'text-base'
                        )}>
                          {log.notes || '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
