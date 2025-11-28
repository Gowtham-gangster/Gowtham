import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Edit, 
  X, 
  Activity, 
  Pill, 
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';
import { AnalysisResult } from '@/types/prescription-analysis';

interface AnalysisSummaryCardProps {
  result: AnalysisResult;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  elderlyMode: boolean;
}

export const AnalysisSummaryCard = ({
  result,
  onConfirm,
  onEdit,
  onCancel,
  elderlyMode,
}: AnalysisSummaryCardProps) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getConfidenceBadge = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const colorClass = getConfidenceColor(confidence);
    
    return (
      <Badge variant="outline" className={cn('gap-1', colorClass)}>
        {percentage}% confidence
      </Badge>
    );
  };

  const getPrecautionIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="text-destructive" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-warning" size={20} />;
      default:
        return <Info className="text-info" size={20} />;
    }
  };

  return (
    <Card className="shadow-soft glass border-primary/20">
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-2xl')}>
          <CheckCircle size={elderlyMode ? 28 : 22} className="text-success" />
          Analysis Complete
        </CardTitle>
        <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
          Review the detected information below and confirm to save
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Confidence */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <span className={cn('font-medium', elderlyMode && 'text-lg')}>
            Overall Confidence
          </span>
          {getConfidenceBadge(result.confidence.overall)}
        </div>

        {/* Detected Diseases */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            <h3 className={cn('font-semibold', elderlyMode && 'text-xl')}>
              Detected Chronic Diseases ({result.detectedDiseases.length})
            </h3>
          </div>
          
          {result.detectedDiseases.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No chronic diseases detected. You can manually add conditions after saving.
            </p>
          ) : (
            <div className="space-y-2">
              {result.detectedDiseases.map((disease) => (
                <div
                  key={disease.diseaseId}
                  className="p-3 bg-muted/20 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium', elderlyMode && 'text-lg')}>
                          {disease.diseaseName}
                        </span>
                        {getConfidenceBadge(disease.confidence)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Source: {disease.source === 'explicit' ? 'Mentioned in prescription' : 
                                disease.source === 'medication' ? 'Inferred from medications' : 
                                'Both mentioned and inferred'}
                      </p>
                      {disease.relatedMedications.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Related medications: {disease.relatedMedications.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Detected Medications */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pill size={20} className="text-primary" />
            <h3 className={cn('font-semibold', elderlyMode && 'text-xl')}>
              Detected Medications ({result.parsedMedications.length})
            </h3>
          </div>
          
          {result.parsedMedications.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No medications detected. You can manually add medications after saving.
            </p>
          ) : (
            <div className="space-y-2">
              {result.parsedMedications.map((medication, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted/20 rounded-lg border border-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium', elderlyMode && 'text-lg')}>
                          {medication.name}
                        </span>
                        <Badge variant="secondary">{medication.strength}</Badge>
                        {getConfidenceBadge(medication.confidence)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>Form: {medication.form}</p>
                        <p>
                          Dosage: {medication.dosage.amount} {medication.dosage.unit}
                        </p>
                        <p>
                          Frequency: {medication.frequency.timesPerDay 
                            ? `${medication.frequency.timesPerDay} times daily` 
                            : medication.frequency.interval 
                            ? `Every ${medication.frequency.interval} hours`
                            : 'As directed'}
                        </p>
                        {medication.instructions && (
                          <p>Instructions: {medication.instructions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Precautions */}
        {result.precautions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              <h3 className={cn('font-semibold', elderlyMode && 'text-xl')}>
                Important Precautions
              </h3>
            </div>
            
            <div className="space-y-2">
              {result.precautions.map((precaution) => (
                <div
                  key={precaution.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    precaution.type === 'danger' && 'bg-destructive/10 border-destructive/30',
                    precaution.type === 'warning' && 'bg-warning/10 border-warning/30',
                    precaution.type === 'info' && 'bg-info/10 border-info/30'
                  )}
                >
                  <div className="flex gap-3">
                    {getPrecautionIcon(precaution.type)}
                    <div className="flex-1">
                      <h4 className={cn('font-medium', elderlyMode && 'text-lg')}>
                        {precaution.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {precaution.description}
                      </p>
                      {precaution.relatedMedications && precaution.relatedMedications.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Related medications: {precaution.relatedMedications.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            onClick={onConfirm}
            className={cn('gradient-primary flex-1 gap-2 shadow-glow', elderlyMode && 'h-14 text-lg')}
          >
            <CheckCircle size={elderlyMode ? 24 : 20} />
            Confirm & Save
          </Button>
          <Button
            onClick={onEdit}
            variant="outline"
            className={cn('flex-1 gap-2', elderlyMode && 'h-14 text-lg')}
          >
            <Edit size={elderlyMode ? 24 : 20} />
            Edit
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className={cn('gap-2', elderlyMode && 'h-14 text-lg')}
          >
            <X size={elderlyMode ? 24 : 20} />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
