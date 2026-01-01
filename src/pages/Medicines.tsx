import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import { MedicinesEmptyState } from '@/components/medicines/MedicinesEmptyState';
import { SearchEmptyState } from '@/components/ui/search-empty-state';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const Medicines = () => {
  const { medicines = [], schedules = [], elderlyMode } = useStore();
  const [search, setSearch] = useState('');

  const filteredMedicines = medicines.filter(med => {
    try {
      return med?.name?.toLowerCase().includes(search.toLowerCase()) ||
        med?.nickname?.toLowerCase().includes(search.toLowerCase());
    } catch (error) {
      console.error('Error filtering medicine:', error);
      return false;
    }
  });

  const getScheduleForMedicine = (medicineId: string) => {
    try {
      return schedules.find(s => s?.medicineId === medicineId);
    } catch (error) {
      console.error('Error getting schedule:', error);
      return undefined;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
              My Medicines
            </h1>
            <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
              {medicines.length} medicine{medicines.length !== 1 ? 's' : ''} in your list
            </p>
          </div>
          <Link to="/medicines/new">
            <Button 
              className={cn('gradient-primary gap-2 shadow-glow', elderlyMode && 'h-14 text-lg px-6')}
            >
              <Plus size={elderlyMode ? 24 : 20} />
              Add Medicine
            </Button>
          </Link>
        </div>

        {/* Search */}
        {medicines.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn('pl-10', elderlyMode && 'h-14 text-lg')}
            />
          </div>
        )}

        {/* Medicine List */}
        {medicines.length === 0 ? (
          <MedicinesEmptyState />
        ) : filteredMedicines.length === 0 ? (
          <SearchEmptyState
            searchQuery={search}
            onClearSearch={() => setSearch('')}
            suggestions={medicines.slice(0, 3).map(m => m.name)}
          />
        ) : (
          <div className="grid gap-4">
            {filteredMedicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                schedule={getScheduleForMedicine(medicine.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Medicines;
