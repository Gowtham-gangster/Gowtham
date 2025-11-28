import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import telehealth from '@/services/telehealth';
import { Button } from '@/components/ui/button';
import VideoConsultPanel from '@/components/dashboard/VideoConsultPanel';

const VideoConsultation = () => {
  const { elderlyMode, user } = useStore();
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason] = useState('');
  const [room, setRoom] = useState<{ roomId: string; joinUrl: string; providerJoinUrl?: string; status: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function schedule() {
    if (!user) return;
    try {
      setLoading(true);
      const res = await telehealth.scheduleConsult({ patientId: user.id, scheduledAt: scheduledAt || undefined, reason });
      setRoom(res);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(errorMessage);
    } finally { setLoading(false); }
  }

  async function startInstant() {
    if (!user) return;
    try {
      setLoading(true);
      const res = await telehealth.createInstantRoom({ patientId: user.id });
      setRoom(res);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(errorMessage);
    } finally { setLoading(false); }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={elderlyMode ? 'text-3xl font-bold' : 'text-2xl font-bold'}>Video Consultation</h1>
            <p className="text-muted-foreground">Start or join secure video consultations with healthcare providers.</p>
            <p className="text-sm text-muted-foreground mt-1">This page offers two options: a quick Jitsi Meet room for instant calls, and a scheduled, provider-backed consult that integrates with telehealth partners. For production, scheduled consults should be routed through a HIPAA-compliant telehealth provider and the server-side APIs listed below.</p>
            <ul className="text-sm text-muted-foreground mt-2 list-disc pl-5">
              <li>Telehealth integrations: <a href="https://docs.truepill.com/" target="_blank" rel="noreferrer" className="underline">Truepill Consult API</a>, <a href="https://rx.fuzehealth.com/" target="_blank" rel="noreferrer" className="underline">FuzeRx</a></li>
              <li>Clinical data: <a href="https://www.fdbhealth.com/" target="_blank" rel="noreferrer" className="underline">FDB MedKnowledge</a>, <a href="https://rxnav.nlm.nih.gov/" target="_blank" rel="noreferrer" className="underline">RxNorm</a></li>
              <li>Communication & reminders: <a href="https://www.twilio.com/health" target="_blank" rel="noreferrer" className="underline">Twilio Health</a></li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-4 glass">
            <h3 className="font-semibold mb-2">Quick Call (Jitsi)</h3>
            <p className="text-sm text-muted-foreground mb-2">Start an instant call in a Jitsi room embedded below — suitable for quick, ad-hoc consultations.</p>
            <VideoConsultPanel elderlyMode={elderlyMode} />
          </div>

          <div className="card p-4 glass lg:col-span-2">
            <h3 className="font-semibold mb-2">Provider-Backed Consults</h3>
            <p className="text-sm text-muted-foreground mb-2">Schedule a secure consult routed through a telehealth provider (Truepill consults or partner EHR). For production, scheduling will create a consult entry on the server and send notifications to the provider. The server returns a join URL which is embedded here for the patient.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-muted-foreground">When</label>
                <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full mt-1 p-2 rounded border" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground">Reason</label>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mt-1 p-2 rounded border" />
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <Button className="gradient-primary" onClick={schedule} disabled={loading}>{loading ? 'Scheduling...' : 'Schedule with Provider'}</Button>
              <Button variant="outline" onClick={startInstant}>Start Instant (Server-created room)</Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Active Room</h4>
              {room ? (
                <div>
                  <div className="mb-2">Status: <strong>{room.status}</strong></div>
                  <div className="mb-2">Room ID: {room.roomId}</div>
                  <div className="mb-4">
                    <a href={room.joinUrl} target="_blank" rel="noreferrer" className="underline">Open in new tab</a>
                  </div>
                  <div className="w-full h-80">
                    <iframe title="telehealth-room" src={room.joinUrl} className="w-full h-full border" />
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No active room. Schedule or start an instant consult.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VideoConsultation;
