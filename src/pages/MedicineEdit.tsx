import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { MedicineForm } from '@/components/medicines/MedicineForm';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

export const MedicineEdit = () => {
  const { id } = useParams<{ id: string }>();
  const { medicines, schedules, elderlyMode } = useStore();

  const medicine = id ? medicines.find(m => m.id === id) : undefined;
  const schedule = id ? schedules.find(s => s.medicineId === id) : undefined;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className={cn('text-2xl font-bold mb-6', elderlyMode && 'text-3xl')}>
          {medicine ? 'Edit Medicine' : 'Add Medicine'}
        </h1>
        <MedicineForm 
          existingMedicine={medicine} 
          existingSchedule={schedule} 
        />
      </div>
    </Layout>
  );
};

export default MedicineEdit;
