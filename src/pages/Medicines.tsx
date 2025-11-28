import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { MedicineCard } from '@/components/medicines/MedicineCard';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Pill, Search } from 'lucide-react';
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
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill size={40} className="text-muted-foreground" />
            </div>
            <h3 className={cn('text-lg font-semibold mb-2', elderlyMode && 'text-xl')}>
              No medicines yet
            </h3>
            <p className={cn('text-muted-foreground mb-6 max-w-md mx-auto', elderlyMode && 'text-lg')}>
              Add your medications to start tracking doses and get timely reminders.
            </p>
            <Link to="/medicines/new">
              <Button className="gradient-primary gap-2">
                <Plus size={18} />
                Add Your First Medicine
              </Button>
            </Link>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No medicines found matching "{search}"</p>
          </div>
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
