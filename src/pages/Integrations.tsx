import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import integrations from '@/services/integrations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStore } from '@/store/useStore';

const Integrations = () => {
  const { elderlyMode } = useStore();
  const [log, setLog] = useState<string>('');

  const runTest = async (type: 'fulfillment' | 'fdb' | 'eprescribe' | 'notifications') => {
    setLog('Running...');
    try {
      let res;
      if (type === 'fulfillment') res = await integrations.testFulfillment({ provider: 'truepill' });
      if (type === 'fdb') res = await integrations.testFDB({});
      if (type === 'eprescribe') res = await integrations.testEPrescribe({ provider: 'surescripts' });
      if (type === 'notifications') res = await integrations.testNotifications({ provider: 'twilio' });
      setLog(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setLog(errorMessage);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>Integrations</h1>
          <p className="text-muted-foreground">Configure and test external integrations (server-side). The server must be configured with credentials and run on the same host or proxied.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">Fulfillment (Truepill / FuzeRx)</h3>
            <p className="text-sm text-muted-foreground mb-3">Used for creating patients, submitting prescriptions, and placing orders.</p>
            <Button onClick={() => runTest('fulfillment')} className="gradient-primary">Test Fulfillment</Button>
          </div>

          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">Clinical Data (FDB)</h3>
            <p className="text-sm text-muted-foreground mb-3">Clinical decision support for interactions, allergies, dosing.</p>
            <Button onClick={() => runTest('fdb')}>Test FDB</Button>
          </div>

          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">E-Prescribing</h3>
            <p className="text-sm text-muted-foreground mb-3">Connect to Surescripts or your EHR for NewRx and Renewals.</p>
            <Button onClick={() => runTest('eprescribe')}>Test E-Prescribe</Button>
          </div>

          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">Notifications (Twilio)</h3>
            <p className="text-sm text-muted-foreground mb-3">SMS and voice reminders (requires Twilio Health configuration).</p>
            <Button onClick={() => runTest('notifications')}>Test Notifications</Button>
          </div>
        </div>

        <div className="card p-4 glass">
          <h3 className="font-semibold mb-2">Server Log / Output</h3>
          <pre className="max-h-64 overflow-auto text-sm">{log || 'No tests run yet'}</pre>
        </div>
      </div>
    </Layout>
  );
};

export default Integrations;
