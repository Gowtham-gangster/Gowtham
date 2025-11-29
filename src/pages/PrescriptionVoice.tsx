import { Layout } from '@/components/layout/Layout';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVoiceReminder } from '@/hooks/useVoiceReminder';
import { VoiceControls, VoiceConfig } from '@/components/voice/VoiceControls';
import { cn } from '@/lib/utils';
import { Mic, FileText } from 'lucide-react';

const PrescriptionVoice = () => {
  const { elderlyMode } = useStore();
  const { speakWithVoice, pause, resume, cancel, isSpeaking, voices } = useVoiceReminder();
  const [medication, setMedication] = useState('');
  const [strength, setStrength] = useState('');
  const [directions, setDirections] = useState('');
  
  // Voice configuration state
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    voiceId: voices[0]?.name || '',
    rate: elderlyMode ? 0.8 : 1.0,
    pitch: 0,
    volume: 1.0
  });

  const handlePreview = () => {
    const previewText = `This is a preview of the selected voice. Speed is set to ${voiceConfig.rate.toFixed(1)} times normal.`;
    speakWithVoice(previewText, voiceConfig.voiceId, {
      rate: voiceConfig.rate,
      pitch: voiceConfig.pitch,
      volume: voiceConfig.volume
    });
  };

  function speakPrescriptionDetails() {
    // Build simple voice announcement with medication and directions
    let voiceAnnouncement = 'Prescription details: ';
    
    if (medication.trim()) {
      voiceAnnouncement += `Medication: ${medication}. `;
    }
    
    if (strength.trim()) {
      voiceAnnouncement += `Strength: ${strength}. `;
    }
    
    if (directions.trim()) {
      voiceAnnouncement += `Directions: ${directions}.`;
    }
    
    if (!medication.trim() && !directions.trim()) {
      voiceAnnouncement = 'No prescription details entered yet.';
    }
    
    // Speak the announcement
    speakWithVoice(voiceAnnouncement, voiceConfig.voiceId, {
      rate: voiceConfig.rate,
      pitch: voiceConfig.pitch,
      volume: voiceConfig.volume
    });
  }



  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn('text-2xl font-bold flex items-center gap-2', elderlyMode && 'text-3xl')}>
              <Mic size={elderlyMode ? 32 : 26} className="text-primary" />
              Prescription Voice
            </h1>
            <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
              Play prescriptions aloud with adjustable voice settings and clarity controls
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prescription Input */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
                  <FileText size={elderlyMode ? 24 : 20} className="text-primary" />
                  Prescription Voice Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className={cn(elderlyMode && 'text-lg')}>Medication</Label>
                  <Input 
                    value={medication} 
                    onChange={(e) => setMedication(e.target.value)} 
                    className={cn(elderlyMode && 'h-14 text-lg')}
                    placeholder="e.g., Aspirin"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={cn(elderlyMode && 'text-lg')}>Strength</Label>
                  <Input 
                    value={strength} 
                    onChange={(e) => setStrength(e.target.value)} 
                    className={cn(elderlyMode && 'h-14 text-lg')}
                    placeholder="e.g., 100mg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className={cn(elderlyMode && 'text-lg')}>Directions</Label>
                  <Input 
                    value={directions} 
                    onChange={(e) => setDirections(e.target.value)} 
                    className={cn(elderlyMode && 'h-14 text-lg')}
                    placeholder="e.g., Take one tablet daily with food"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    className={cn('w-full gradient-primary gap-2 shadow-glow', elderlyMode && 'h-14 text-lg')}
                    onClick={speakPrescriptionDetails}
                    disabled={isSpeaking}
                  >
                    <Mic size={elderlyMode ? 20 : 16} />
                    {isSpeaking ? 'Speaking...' : 'Speak Prescription'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Prescription Preview */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className={cn(elderlyMode && 'text-xl')}>Prescription Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {medication || strength || directions ? (
                  <div className="space-y-3">
                    {medication && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Medication:</span>
                        <p className={cn('text-foreground', elderlyMode && 'text-lg')}>{medication}</p>
                      </div>
                    )}
                    {strength && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Strength:</span>
                        <p className={cn('text-foreground', elderlyMode && 'text-lg')}>{strength}</p>
                      </div>
                    )}
                    {directions && (
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Directions:</span>
                        <p className={cn('text-foreground', elderlyMode && 'text-lg')}>{directions}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={cn('text-muted-foreground text-center py-8', elderlyMode && 'text-lg')}>
                    Enter prescription details above to see preview
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Voice Controls */}
          <div className="lg:col-span-1">
            <VoiceControls
              voices={voices}
              config={voiceConfig}
              onConfigChange={setVoiceConfig}
              onPreview={handlePreview}
              isSpeaking={isSpeaking}
              onPause={pause}
              onResume={resume}
              onStop={cancel}
              elderlyMode={elderlyMode}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrescriptionVoice;
