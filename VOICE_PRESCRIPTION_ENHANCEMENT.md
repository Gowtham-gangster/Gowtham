# Voice Prescription Enhancement - Comprehensive Guide

## Overview
Enhanced voice prescription system with better clarity, voice selection, and optional API integration for superior text-to-speech quality.

## Current Implementation Analysis

### Strengths:
✅ Basic Web Speech API integration
✅ Multiple verbosity levels (simple, detailed, step-by-step)
✅ Voice reminder functionality
✅ Elderly mode support

### Limitations:
❌ No voice selection UI
❌ Limited voice quality (browser-dependent)
❌ No playback controls (pause/resume)
❌ No speech rate/pitch/volume UI controls
❌ No API integration for better quality
❌ No audio preview before speaking
❌ No multi-language support UI

## Proposed Enhancements

### 1. Enhanced Voice Selection UI
**Features:**
- Visual voice picker with preview
- Gender selection (Male/Female/Neutral)
- Language selection
- Voice quality indicators
- Favorite voices
- Voice samples/preview

### 2. Advanced Speech Controls
**Features:**
- Speed slider (0.5x - 2x)
- Pitch control (-10 to +10)
- Volume control (0-100%)
- Pause/Resume/Stop buttons
- Progress indicator
- Repeat last message

### 3. API Integration Options

#### Option A: Google Cloud Text-to-Speech (Recommended)
**Pros:**
- Excellent quality (WaveNet voices)
- 40+ languages
- Natural-sounding speech
- SSML support for fine control
- Free tier: 1M characters/month

**Pricing:**
- Standard: $4 per 1M characters
- WaveNet: $16 per 1M characters
- Neural2: $16 per 1M characters

**Implementation:**
```typescript
import textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient();

async function synthesizeSpeech(text: string, voice: string) {
  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: voice, // e.g., 'en-US-Neural2-F'
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.9,
      pitch: 0,
      volumeGainDb: 0
    }
  };

  const [response] = await client.synthesizeSpeech(request);
  return response.audioContent; // Base64 audio
}
```

#### Option B: Amazon Polly
**Pros:**
- Neural voices available
- Good quality
- Multiple languages
- SSML support
- Free tier: 5M characters/month (first 12 months)

**Pricing:**
- Standard: $4 per 1M characters
- Neural: $16 per 1M characters

**Implementation:**
```typescript
import { Polly } from '@aws-sdk/client-polly';

const polly = new Polly({ region: 'us-east-1' });

async function synthesizeSpeech(text: string, voice: string) {
  const params = {
    Text: text,
    OutputFormat: 'mp3',
    VoiceId: voice, // e.g., 'Joanna', 'Matthew'
    Engine: 'neural',
    SampleRate: '24000'
  };

  const response = await polly.synthesizeSpeech(params);
  return response.AudioStream;
}
```

#### Option C: ElevenLabs (Premium Quality)
**Pros:**
- Best-in-class quality
- Extremely natural voices
- Voice cloning capability
- Emotion control
- Multiple languages

**Pricing:**
- Free: 10,000 characters/month
- Starter: $5/month - 30,000 characters
- Creator: $22/month - 100,000 characters
- Pro: $99/month - 500,000 characters

**Implementation:**
```typescript
async function synthesizeSpeech(text: string, voiceId: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    }
  );

  return response.arrayBuffer();
}
```

#### Option D: Web Speech API (Current - Free)
**Pros:**
- Free
- No API calls needed
- Works offline
- No setup required

**Cons:**
- Quality varies by browser/OS
- Limited voice options
- No fine control

### 4. Hybrid Approach (Recommended)
Use Web Speech API as default with option to upgrade to premium API:

```typescript
interface VoiceConfig {
  provider: 'browser' | 'google' | 'amazon' | 'elevenlabs';
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
}

async function speak(text: string, config: VoiceConfig) {
  if (config.provider === 'browser') {
    // Use Web Speech API
    return speakWithBrowser(text, config);
  } else {
    // Use cloud API
    const audio = await synthesizeWithAPI(text, config);
    return playAudio(audio);
  }
}
```

## Implementation Plan

### Phase 1: Enhanced UI Controls (No API needed)
1. Add voice selection dropdown
2. Add speed/pitch/volume sliders
3. Add playback controls (play/pause/stop)
4. Add preview button
5. Add voice favorites

**Estimated Time:** 2-3 hours
**Cost:** Free

### Phase 2: API Integration (Optional)
1. Choose API provider (Google recommended)
2. Set up API credentials
3. Create backend endpoint for synthesis
4. Implement audio caching
5. Add fallback to Web Speech API

**Estimated Time:** 4-6 hours
**Cost:** Variable (see pricing above)

### Phase 3: Advanced Features
1. Multi-language support
2. SSML markup for emphasis
3. Pronunciation dictionary
4. Audio export/download
5. Voice cloning (ElevenLabs only)

**Estimated Time:** 6-8 hours
**Cost:** Variable

## Recommended Solution

### For MVP (Minimum Viable Product):
**Use Enhanced Web Speech API (Phase 1)**
- Free
- Quick to implement
- Good enough for most users
- No backend needed

### For Production (Best User Experience):
**Hybrid Approach:**
- Default: Web Speech API (free)
- Premium: Google Cloud Text-to-Speech
  - Enable for elderly users automatically
  - Enable for users who opt-in
  - Use WaveNet voices for best quality

**Cost Estimate:**
- Average prescription: ~200 characters
- 1000 prescriptions/month = 200,000 characters
- Google WaveNet cost: $3.20/month
- Very affordable for better UX

## Code Examples

### Enhanced Voice Selection Component
```typescript
interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: 'browser' | 'google' | 'amazon';
  quality: 'standard' | 'premium' | 'neural';
}

function VoiceSelector({ onSelect }: { onSelect: (voice: Voice) => void }) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [previewText] = useState('This is a preview of the selected voice.');

  const handlePreview = async () => {
    if (selectedVoice) {
      await speak(previewText, {
        provider: selectedVoice.provider,
        voiceId: selectedVoice.id,
        rate: 1.0,
        pitch: 0,
        volume: 1.0
      });
    }
  };

  return (
    <div className="space-y-4">
      <Select value={selectedVoice?.id} onValueChange={(id) => {
        const voice = voices.find(v => v.id === id);
        if (voice) {
          setSelectedVoice(voice);
          onSelect(voice);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {voices.map(voice => (
            <SelectItem key={voice.id} value={voice.id}>
              <div className="flex items-center gap-2">
                <span>{voice.name}</span>
                <Badge variant={voice.quality === 'neural' ? 'default' : 'secondary'}>
                  {voice.quality}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handlePreview} variant="outline">
        <Volume2 className="mr-2" size={16} />
        Preview Voice
      </Button>
    </div>
  );
}
```

### Speech Controls Component
```typescript
function SpeechControls({ onSpeak }: { onSpeak: (config: VoiceConfig) => void }) {
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);

  return (
    <div className="space-y-4">
      <div>
        <Label>Speed: {rate.toFixed(1)}x</Label>
        <Slider
          value={[rate]}
          onValueChange={([v]) => setRate(v)}
          min={0.5}
          max={2.0}
          step={0.1}
        />
      </div>

      <div>
        <Label>Pitch: {pitch > 0 ? '+' : ''}{pitch}</Label>
        <Slider
          value={[pitch]}
          onValueChange={([v]) => setPitch(v)}
          min={-10}
          max={10}
          step={1}
        />
      </div>

      <div>
        <Label>Volume: {Math.round(volume * 100)}%</Label>
        <Slider
          value={[volume]}
          onValueChange={([v]) => setVolume(v)}
          min={0}
          max={1}
          step={0.1}
        />
      </div>
    </div>
  );
}
```

## Security Considerations

### API Key Management:
```typescript
// ❌ NEVER do this
const API_KEY = 'your-api-key-here';

// ✅ Use environment variables
const API_KEY = process.env.VITE_TTS_API_KEY;

// ✅ Better: Use backend proxy
async function synthesizeSpeech(text: string) {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.arrayBuffer();
}
```

### Backend Endpoint (Node.js/Express):
```typescript
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  
  // Validate input
  if (!text || text.length > 5000) {
    return res.status(400).json({ error: 'Invalid text' });
  }

  // Rate limiting
  // ... implement rate limiting

  // Call TTS API
  const audio = await synthesizeSpeech(text);
  
  res.set('Content-Type', 'audio/mpeg');
  res.send(audio);
});
```

## Testing Checklist

- [ ] Test all browser voices
- [ ] Test speed/pitch/volume controls
- [ ] Test pause/resume functionality
- [ ] Test with long prescriptions
- [ ] Test with special characters
- [ ] Test in elderly mode
- [ ] Test on mobile devices
- [ ] Test offline functionality
- [ ] Test API fallback
- [ ] Test error handling

## Accessibility Considerations

1. **Keyboard Navigation**: All controls accessible via keyboard
2. **Screen Reader**: Announce voice changes and playback status
3. **Visual Feedback**: Show speaking status visually
4. **Captions**: Optional text display while speaking
5. **High Contrast**: Ensure controls visible in all themes

## Conclusion

**Recommended Approach:**
1. **Start with Phase 1** (Enhanced Web Speech API UI)
   - Quick to implement
   - Free
   - Immediate value

2. **Add Phase 2** (Google Cloud TTS) if:
   - Users request better quality
   - Budget allows (~$5-10/month)
   - Targeting elderly users specifically

3. **Consider Phase 3** for:
   - Multi-language support needed
   - Voice cloning desired
   - Premium tier offering

The hybrid approach gives best of both worlds: free for most users, premium quality for those who need it.
