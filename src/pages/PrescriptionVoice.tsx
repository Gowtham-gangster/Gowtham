import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import fdb from '@/services/fdb';
import fulfillment from '@/services/fulfillment';
import { Button } from '@/components/ui/button';
import { useVoiceReminder } from '@/hooks/useVoiceReminder';

const PrescriptionVoice = () => {
  const { elderlyMode, user } = useStore();
  const { speakPrescription } = useVoiceReminder();
  const [medication, setMedication] = useState('');
  const [strength, setStrength] = useState('');
  const [directions, setDirections] = useState('Take one tablet daily');
  const [cdsResult, setCdsResult] = useState<{ ok: boolean; issues?: Array<{ code: string; severity: string; summary: string }>; matchedProduct?: { id?: string; name?: string; rxcui?: string } } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function checkAndSpeak() {
    try {
      const res = await fdb.checkMedication({ medication, patientId: user?.id });
      setCdsResult(res);
      if (res.ok) {
        // read prescription aloud
        speakPrescription([{ name: medication, strength, directions }], { variant: 'detailed' });
      } else {
        // read warnings
        speakPrescription([{ name: medication, strength, directions }], { variant: 'detailed' });
        alert('CDS detected issues: ' + JSON.stringify(res.issues || []));
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(errorMessage);
    }
  }

  async function submitPrescription() {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fulfillment.submitPrescription({ patientId: user.id, medication, strength, directions });
      alert('Prescription submitted: ' + JSON.stringify(res));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(errorMessage);
    } finally { setSubmitting(false); }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={elderlyMode ? 'text-3xl font-bold' : 'text-2xl font-bold'}>Prescription Voice</h1>
            <p className="text-muted-foreground">Play prescriptions aloud with adjustable verbosity for elderly users.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">E-Prescribe & CDS</h3>
            <label className="block mb-2">
              <div className="text-sm text-muted-foreground">Medication</div>
              <input value={medication} onChange={(e) => setMedication(e.target.value)} className="w-full mt-1 p-2 rounded border" />
            </label>
            <label className="block mb-2">
              <div className="text-sm text-muted-foreground">Strength</div>
              <input value={strength} onChange={(e) => setStrength(e.target.value)} className="w-full mt-1 p-2 rounded border" />
            </label>
            <label className="block mb-2">
              <div className="text-sm text-muted-foreground">Directions</div>
              <input value={directions} onChange={(e) => setDirections(e.target.value)} className="w-full mt-1 p-2 rounded border" />
            </label>
            <div className="flex gap-2">
              <Button className="gradient-primary" onClick={checkAndSpeak}>Check & Speak</Button>
              <Button variant="outline" onClick={submitPrescription} disabled={submitting}>{submitting ? 'Sending...' : 'Submit Prescription'}</Button>
            </div>
          </div>

          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">CDS Result</h3>
            {cdsResult ? (
              <pre className="text-sm max-h-56 overflow-auto">{JSON.stringify(cdsResult, null, 2)}</pre>
            ) : (
              <div className="text-muted-foreground">No CDS checks yet</div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrescriptionVoice;
