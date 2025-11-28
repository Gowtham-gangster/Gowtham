import { ChronicDisease } from '@/types/chronic-disease';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface DiseaseCardProps {
  disease: ChronicDisease;
  onClick: () => void;
  elderlyMode: boolean;
}

export const DiseaseCard = ({ disease, onClick, elderlyMode }: DiseaseCardProps) => {
  // Get the icon component dynamically
  const IconComponent = Icons[disease.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
  
  return (
    <Card 
      className="glass hover-lift cursor-pointer transition-all duration-300 hover:shadow-glow"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className={cn('text-base font-semibold', elderlyMode && 'text-lg')}>
              {disease.name}
            </CardTitle>
            <Badge variant="outline" className="mt-2 text-xs">
              {disease.category}
            </Badge>
          </div>
          {IconComponent && (
            <div className="text-primary">
              <IconComponent className={cn('w-8 h-8', elderlyMode && 'w-10 h-10')} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className={cn('text-sm text-muted-foreground line-clamp-2', elderlyMode && 'text-base')}>
          {disease.description}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-primary">
          <Icons.Info className="w-4 h-4" />
          <span>Click to learn more</span>
        </div>
      </CardContent>
    </Card>
  );
};
