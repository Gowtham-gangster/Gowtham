import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DemoDataService } from '@/services/demo-data-service';
import { demoUsers } from '@/data/demo-database';
import { useStore } from '@/store/useStore';
import { Database, RefreshCw, Trash2, User, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const DemoDataManager = () => {
  const { user, elderlyMode } = useStore();
  const [selectedUserId, setSelectedUserId] = useState(user?.id || demoUsers[0].id);
  const isDemoLoaded = DemoDataService.isDemoDataLoaded();

  const handleInitialize = () => {
    DemoDataService.initializeDemoData(selectedUserId);
    toast.success('Demo data initialized successfully!');
  };

  const handleSwitch = () => {
    DemoDataService.switchDemoUser(selectedUserId);
    toast.success(`Switched to ${demoUsers.find(u => u.id === selectedUserId)?.name}`);
  };

  const handleClear = () => {
    DemoDataService.clearDemoData();
    toast.success('Demo data cleared');
  };

  const currentDemoUser = demoUsers.find(u => u.id === user?.id);

  return (
    <Card className="shadow-soft border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database size={elderlyMode ? 24 : 20} className="text-primary" />
          <div className="flex-1">
            <CardTitle className={cn(elderlyMode && 'text-xl')}>
              Demo Data Manager
            </CardTitle>
            <CardDescription className={cn(elderlyMode && 'text-base')}>
              Load and manage demo patient data for testing
            </CardDescription>
          </div>
          {isDemoLoaded && (
            <Badge variant="default" className={cn('gap-1', elderlyMode && 'text-base px-3 py-1')}>
              <CheckCircle size={elderlyMode ? 16 : 14} />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Display */}
        {currentDemoUser && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <User size={elderlyMode ? 20 : 16} className="text-primary" />
              <span className={cn('font-medium', elderlyMode && 'text-lg')}>
                Current Demo User
              </span>
            </div>
            <div className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
              <p className="font-medium text-foreground">{currentDemoUser.name}</p>
              <p>Age: {currentDemoUser.age} years</p>
              <p>{currentDemoUser.email}</p>
            </div>
          </div>
        )}

        {/* User Selection */}
        <div className="space-y-2">
          <label className={cn('text-sm font-medium', elderlyMode && 'text-base')}>
            Select Demo User
          </label>
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className={cn(elderlyMode && 'h-14 text-lg')}>
              <SelectValue placeholder="Choose a demo user" />
            </SelectTrigger>
            <SelectContent>
              {demoUsers.map((demoUser) => (
                <SelectItem key={demoUser.id} value={demoUser.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{demoUser.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Age {demoUser.age} • {demoUser.email}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {!isDemoLoaded ? (
            <Button
              onClick={handleInitialize}
              className={cn('w-full gap-2 gradient-primary shadow-glow', elderlyMode && 'h-14 text-lg')}
            >
              <Database size={elderlyMode ? 20 : 16} />
              Initialize Demo Data
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSwitch}
                variant="outline"
                className={cn('w-full gap-2', elderlyMode && 'h-14 text-lg')}
                disabled={selectedUserId === user?.id}
              >
                <RefreshCw size={elderlyMode ? 20 : 16} />
                Switch to Selected User
              </Button>
              <Button
                onClick={handleClear}
                variant="destructive"
                className={cn('w-full gap-2', elderlyMode && 'h-14 text-lg')}
              >
                <Trash2 size={elderlyMode ? 20 : 16} />
                Clear Demo Data
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        <div className={cn('text-xs text-muted-foreground p-3 rounded-lg bg-muted/30', elderlyMode && 'text-sm')}>
          <p className="font-medium mb-1">Demo Data Includes:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Patient profile with medical history</li>
            <li>Multiple medications with schedules</li>
            <li>Chronic disease profiles</li>
            <li>Prescription documents</li>
            <li>Upcoming appointments</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
