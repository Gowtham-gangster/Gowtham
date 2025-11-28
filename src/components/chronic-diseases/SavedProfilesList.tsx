import { DiseaseProfile } from '@/types/chronic-disease';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Eye, Edit, Trash2, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface SavedProfilesListProps {
  profiles: DiseaseProfile[];
  onView: (profile: DiseaseProfile) => void;
  onEdit: (profile: DiseaseProfile) => void;
  onDelete: (profileId: string) => void;
  elderlyMode: boolean;
}

export const SavedProfilesList = ({
  profiles,
  onView,
  onEdit,
  onDelete,
  elderlyMode,
}: SavedProfilesListProps) => {
  if (profiles.length === 0) {
    return (
      <Card className="glass">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Activity size={48} className="mx-auto mb-4 opacity-50" />
          <p className={cn('text-base', elderlyMode && 'text-lg')}>
            No saved profiles yet. Create your first disease profile to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={cn('text-xl font-semibold mb-2', elderlyMode && 'text-2xl')}>
          Saved Disease Profiles
        </h3>
        <p className="text-muted-foreground">
          Manage your chronic disease profiles and access personalized guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="glass hover-lift transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <CardTitle className={cn('text-base font-semibold', elderlyMode && 'text-lg')}>
                    {profile.diseaseName}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Age: {profile.personalInfo.age}
                    </Badge>
                    {profile.personalInfo.gender && (
                      <Badge variant="outline" className="text-xs">
                        {profile.personalInfo.gender}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Summary */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Activity className="w-4 h-4" />
                  <span>{profile.symptoms.length} symptoms reported</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(profile.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              </div>

              {/* Lifestyle Summary */}
              <div className="pt-2 border-t border-border/50">
                <p className={cn('text-xs text-muted-foreground mb-1', elderlyMode && 'text-sm')}>
                  Lifestyle:
                </p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Diet: {profile.lifestyle.diet}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Exercise: {profile.lifestyle.exerciseFrequency}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onView(profile)}
                  className={cn('flex-1 gap-1', elderlyMode && 'h-10')}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(profile)}
                  className={cn('gap-1', elderlyMode && 'h-10')}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(profile.id)}
                  className={cn('gap-1 text-destructive hover:text-destructive', elderlyMode && 'h-10')}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
