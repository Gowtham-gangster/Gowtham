import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PrescriptionsEmptyState } from '@/components/prescriptions/PrescriptionsEmptyState';
import { cn } from '@/lib/utils';
import { FileText, Upload, Calendar, ChevronRight, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  pending: { label: 'Processing', icon: Clock, color: 'bg-warning/20 text-warning' },
  processed: { label: 'Processed', icon: CheckCircle, color: 'bg-success/20 text-success' },
  error: { label: 'Error', icon: AlertCircle, color: 'bg-destructive/20 text-destructive' }
};

export const Prescriptions = () => {
  const { prescriptions, elderlyMode } = useStore();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
              <FileText size={elderlyMode ? 32 : 26} className="text-primary" />
              Prescriptions
            </h1>
            <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
              Upload and manage your prescription documents
            </p>
          </div>
          <Link to="/prescriptions/upload">
            <Button 
              className={cn('gradient-primary gap-2 shadow-glow', elderlyMode && 'h-14 text-lg px-6')}
            >
              <Upload size={elderlyMode ? 24 : 20} />
              Upload & Scan Prescription
            </Button>
          </Link>
        </div>

        {/* Prescriptions List */}
        {prescriptions.length === 0 ? (
          <PrescriptionsEmptyState />
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => {
              const status = statusConfig[prescription.status];
              const StatusIcon = status.icon;
              
              return (
                <Card 
                  key={prescription.id} 
                  className="shadow-soft hover:shadow-lg transition-all cursor-pointer"
                >
                  <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="text-primary" size={24} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={cn('font-semibold truncate', elderlyMode && 'text-lg')}>
                            {prescription.fileName}
                          </h3>
                          <Badge className={cn(status.color, 'gap-1')}>
                            <StatusIcon size={12} />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar size={14} />
                          <span className={cn(elderlyMode && 'text-base')}>
                            Uploaded {format(new Date(prescription.uploadedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        {prescription.parsedMedicines.length > 0 && (
                          <p className={cn('text-sm text-muted-foreground mt-1', elderlyMode && 'text-base')}>
                            {prescription.parsedMedicines.length} medicine{prescription.parsedMedicines.length !== 1 ? 's' : ''} detected
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="text-muted-foreground" size={20} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Prescriptions;
