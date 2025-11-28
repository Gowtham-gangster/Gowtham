import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVoiceReminder } from '@/hooks/useVoiceReminder';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import { Speaker } from 'lucide-react';

export const VoicePrescriptionPanel: React.FC<{ elderlyMode?: boolean }> = ({ elderlyMode }) => {
  const { speakPrescription, isSupported } = useVoiceReminder();
  const { prescriptions } = useStore();
  const latest = prescriptions[0];

  const handlePlay = (variant: 'simple' | 'detailed' | 'step') => {
    if (!latest) return;
    speakPrescription(latest.parsedMedicines, { variant });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2')}>
          <Speaker />
          Prescription Voice
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('space-y-3', elderlyMode && 'p-6')}>
        <p className="text-sm text-muted-foreground">Play the latest scanned prescription aloud with elderly-friendly phrasing.</p>
        {!latest ? (
          <p className="text-muted-foreground">No scanned prescriptions yet</p>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => handlePlay('simple')}>Play Simple</Button>
            <Button onClick={() => handlePlay('detailed')}>Play Detailed</Button>
            <Button onClick={() => handlePlay('step')}>Play Step-by-step</Button>
          </div>
        )}
        {!isSupported && <p className="text-xs text-destructive">Voice not supported in this browser.</p>}
      </CardContent>
    </Card>
  );
};

export default VoicePrescriptionPanel;
