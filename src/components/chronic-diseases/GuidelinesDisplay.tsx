import { DiseaseProfile, Guideline, Precaution } from '@/types/chronic-disease';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';
import { Download, Edit, Save, AlertTriangle, Info, AlertCircle } from 'lucide-react';

interface GuidelinesDisplayProps {
  profile: DiseaseProfile;
  guidelines: Guideline[];
  precautions: Precaution[];
  onDownloadPDF: () => void;
  onEdit: () => void;
  onSave: () => void;
  elderlyMode: boolean;
}

export const GuidelinesDisplay = ({
  profile,
  guidelines,
  precautions,
  onDownloadPDF,
  onEdit,
  onSave,
  elderlyMode,
}: GuidelinesDisplayProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getPrecautionIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getPrecautionStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-destructive/50 bg-destructive/10';
      case 'warning':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'info':
        return 'border-blue-500/50 bg-blue-500/10';
      default:
        return 'border-muted';
    }
  };

  // Group guidelines by category
  const groupedGuidelines = guidelines.reduce((acc, guideline) => {
    if (!acc[guideline.category]) {
      acc[guideline.category] = [];
    }
    acc[guideline.category].push(guideline);
    return acc;
  }, {} as Record<string, Guideline[]>);

  const categoryLabels: Record<string, string> = {
    diet: 'Dietary Recommendations',
    exercise: 'Physical Activity',
    medication: 'Medication Management',
    monitoring: 'Health Monitoring',
    lifestyle: 'Lifestyle Modifications',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
            {profile.diseaseName} Management Plan
          </h2>
          <p className="text-muted-foreground mt-1">
            Personalized guidelines based on your health profile
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onEdit}
            className={cn('glass gap-2', elderlyMode && 'h-12 text-lg')}
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button
            onClick={onSave}
            className={cn('gradient-primary gap-2', elderlyMode && 'h-12 text-lg')}
          >
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Precautions Section */}
      {precautions.length > 0 && (
        <Card className="glass border-orange-500/30">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2 text-orange-400', elderlyMode && 'text-xl')}>
              <AlertTriangle className="w-6 h-6" />
              Important Precautions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {precautions.map((precaution) => (
              <div
                key={precaution.id}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all',
                  getPrecautionStyle(precaution.type)
                )}
              >
                <div className="flex items-start gap-3">
                  {getPrecautionIcon(precaution.type)}
                  <div className="flex-1">
                    <h4 className={cn('font-semibold mb-1', elderlyMode && 'text-lg')}>
                      {precaution.title}
                    </h4>
                    <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                      {precaution.description}
                    </p>
                    {precaution.relatedMedications && precaution.relatedMedications.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {precaution.relatedMedications.map((med) => (
                          <Badge
                            key={med}
                            variant="outline"
                            className="bg-orange-500/20 text-orange-400 border-orange-500/50"
                          >
                            {med}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Guidelines Section */}
      <div className="space-y-4">
        <h3 className={cn('text-xl font-semibold', elderlyMode && 'text-2xl')}>
          Personalized Guidelines
        </h3>
        {Object.entries(groupedGuidelines).map(([category, categoryGuidelines]) => (
          <Card key={category} className="glass">
            <CardHeader>
              <CardTitle className={cn('text-lg', elderlyMode && 'text-xl')}>
                {categoryLabels[category] || category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryGuidelines.map((guideline) => {
                const IconComponent = Icons[guideline.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                
                return (
                  <div
                    key={guideline.id}
                    className="p-4 rounded-lg bg-card/50 border border-border/50 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {IconComponent && (
                        <div className="text-primary mt-1">
                          <IconComponent className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={cn('font-semibold', elderlyMode && 'text-lg')}>
                            {guideline.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn('text-xs', getPriorityColor(guideline.priority))}
                          >
                            {guideline.priority}
                          </Badge>
                        </div>
                        <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                          {guideline.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Download PDF Button */}
      <Card className="glass">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className={cn('font-semibold mb-1', elderlyMode && 'text-lg')}>
                Download Prescription
              </h4>
              <p className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
                Get a professionally formatted PDF with all your guidelines and precautions
              </p>
            </div>
            <Button
              onClick={onDownloadPDF}
              className={cn('gradient-primary gap-2 min-w-[200px]', elderlyMode && 'h-12 text-lg')}
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
