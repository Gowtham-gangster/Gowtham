import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, Play, Pause, Square, SkipBack } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VoiceConfig {
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface VoiceControlsProps {
  voices: SpeechSynthesisVoice[];
  config: VoiceConfig;
  onConfigChange: (config: VoiceConfig) => void;
  onPreview: () => void;
  isSpeaking: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  elderlyMode?: boolean;
}

export const VoiceControls = ({
  voices,
  config,
  onConfigChange,
  onPreview,
  isSpeaking,
  onPause,
  onResume,
  onStop,
  elderlyMode
}: VoiceControlsProps) => {
  const [isPaused, setIsPaused] = useState(false);

  const handlePause = () => {
    setIsPaused(true);
    onPause();
  };

  const handleResume = () => {
    setIsPaused(false);
    onResume();
  };

  const handleStop = () => {
    setIsPaused(false);
    onStop();
  };

  const getVoiceQuality = (voice: SpeechSynthesisVoice): 'premium' | 'standard' => {
    const premiumKeywords = ['neural', 'enhanced', 'premium', 'natural'];
    return premiumKeywords.some(keyword => 
      voice.name.toLowerCase().includes(keyword)
    ) ? 'premium' : 'standard';
  };

  const getVoiceGender = (voice: SpeechSynthesisVoice): string => {
    const name = voice.name.toLowerCase();
    if (name.includes('female') || name.includes('woman')) return '👩 Female';
    if (name.includes('male') || name.includes('man')) return '👨 Male';
    return '🔹 Neutral';
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-xl')}>
          <Volume2 size={elderlyMode ? 24 : 20} className="text-primary" />
          Voice Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label className={cn(elderlyMode && 'text-lg')}>Select Voice</Label>
          <Select 
            value={config.voiceId} 
            onValueChange={(voiceId) => onConfigChange({ ...config, voiceId })}
          >
            <SelectTrigger className={cn(elderlyMode && 'h-14 text-lg')}>
              <SelectValue placeholder="Choose a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.name} value={voice.name}>
                  <div className="flex items-center gap-2">
                    <span>{getVoiceGender(voice)}</span>
                    <span className="flex-1">{voice.name.split(' ').slice(0, 3).join(' ')}</span>
                    <Badge 
                      variant={getVoiceQuality(voice) === 'premium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {getVoiceQuality(voice)}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className={cn(elderlyMode && 'text-lg')}>Speed</Label>
            <span className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
              {config.rate.toFixed(1)}x
            </span>
          </div>
          <Slider
            value={[config.rate]}
            onValueChange={([rate]) => onConfigChange({ ...config, rate })}
            min={0.5}
            max={2.0}
            step={0.1}
            className={cn(elderlyMode && 'h-6')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slower</span>
            <span>Normal</span>
            <span>Faster</span>
          </div>
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className={cn(elderlyMode && 'text-lg')}>Pitch</Label>
            <span className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
              {config.pitch > 0 ? '+' : ''}{config.pitch.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[config.pitch]}
            onValueChange={([pitch]) => onConfigChange({ ...config, pitch })}
            min={-1}
            max={1}
            step={0.1}
            className={cn(elderlyMode && 'h-6')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lower</span>
            <span>Normal</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className={cn(elderlyMode && 'text-lg')}>Volume</Label>
            <span className={cn('text-sm text-muted-foreground', elderlyMode && 'text-base')}>
              {Math.round(config.volume * 100)}%
            </span>
          </div>
          <Slider
            value={[config.volume]}
            onValueChange={([volume]) => onConfigChange({ ...config, volume })}
            min={0}
            max={1}
            step={0.1}
            className={cn(elderlyMode && 'h-6')}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={onPreview}
            disabled={isSpeaking}
            className={cn('flex-1 gap-2', elderlyMode && 'h-14 text-lg')}
            variant="outline"
          >
            <Play size={elderlyMode ? 20 : 16} />
            Preview
          </Button>

          {isSpeaking && (
            <>
              {isPaused ? (
                <Button
                  onClick={handleResume}
                  className={cn('gap-2', elderlyMode && 'h-14 text-lg')}
                  variant="outline"
                >
                  <Play size={elderlyMode ? 20 : 16} />
                  Resume
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  className={cn('gap-2', elderlyMode && 'h-14 text-lg')}
                  variant="outline"
                >
                  <Pause size={elderlyMode ? 20 : 16} />
                  Pause
                </Button>
              )}
              <Button
                onClick={handleStop}
                className={cn('gap-2', elderlyMode && 'h-14 text-lg')}
                variant="destructive"
              >
                <Square size={elderlyMode ? 20 : 16} />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-4 border-t">
          <Label className={cn('text-sm', elderlyMode && 'text-base')}>Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigChange({ ...config, rate: 0.8, pitch: 0, volume: 1 })}
              className={cn(elderlyMode && 'h-12 text-base')}
            >
              🐢 Slow & Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigChange({ ...config, rate: 1.0, pitch: 0, volume: 1 })}
              className={cn(elderlyMode && 'h-12 text-base')}
            >
              ⚡ Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigChange({ ...config, rate: 1.3, pitch: 0, volume: 1 })}
              className={cn(elderlyMode && 'h-12 text-base')}
            >
              🚀 Fast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConfigChange({ ...config, rate: 0.7, pitch: -0.2, volume: 1 })}
              className={cn(elderlyMode && 'h-12 text-base')}
            >
              👴 Elderly
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
