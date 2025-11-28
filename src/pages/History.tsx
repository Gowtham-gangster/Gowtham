import { Layout } from '@/components/layout/Layout';
import { HistoryTable } from '@/components/history/HistoryTable';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { History as HistoryIcon } from 'lucide-react';

export const History = () => {
  const { elderlyMode } = useStore();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
            <HistoryIcon size={elderlyMode ? 32 : 26} className="text-primary" />
            Dose History
          </h1>
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            Track your medication adherence over time
          </p>
        </div>
        
        <HistoryTable />
      </div>
    </Layout>
  );
};

export default History;
