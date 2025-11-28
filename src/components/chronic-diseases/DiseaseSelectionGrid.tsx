import { useState, useMemo } from 'react';
import { ChronicDisease } from '@/types/chronic-disease';
import { chronicDiseases, searchDiseases } from '@/data/chronic-diseases';
import { DiseaseCard } from './DiseaseCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiseaseSelectionGridProps {
  onDiseaseSelect: (disease: ChronicDisease) => void;
  elderlyMode: boolean;
}

export const DiseaseSelectionGrid = ({ onDiseaseSelect, elderlyMode }: DiseaseSelectionGridProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDiseases = useMemo(() => {
    return searchQuery.trim() ? searchDiseases(searchQuery) : chronicDiseases;
  }, [searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search chronic conditions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn('pl-10', elderlyMode && 'h-12 text-lg')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Disease Grid */}
      {filteredDiseases.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center text-muted-foreground">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p className={cn('text-base', elderlyMode && 'text-lg')}>
              No conditions found. Try a different search term.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiseases.map((disease) => (
            <DiseaseCard
              key={disease.id}
              disease={disease}
              onClick={() => onDiseaseSelect(disease)}
              elderlyMode={elderlyMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};
