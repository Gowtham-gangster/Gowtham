# Design Document

## Overview

The Voice Prescription Integration feature creates an intelligent audio feedback system that seamlessly integrates prescription validation, Clinical Decision Support (CDS) results, and voice synthesis. The system automatically adjusts voice modulation parameters based on the severity of CDS alerts, providing users with an intuitive audio experience where critical health information is emphasized through voice characteristics. The design leverages the existing Web Speech API implementation while adding a sophisticated modulation engine that adapts voice parameters in real-time based on health data context.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Prescription │  │    Voice     │  │   Playback   │     │
│  │    Form      │  │   Controls   │  │   Controls   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     CDS      │  │    Voice     │  │  Prescription│     │
│  │  Validator   │  │  Modulator   │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Speech    │  │   Message    │  │   Settings   │     │
│  │  Synthesizer │  │   Builder    │  │  Persister   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     FDB      │  │  Fulfillment │  │    Local     │     │
│  │   Service    │  │   Service    │  │   Storage    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action: "Check & Speak"
       │
       ▼
┌─────────────────┐
│ PrescriptionVoice│
│      Page       │
└─────────────────┘
       │
       ├──────────────────────────────────┐
       │                                   │
       ▼                                   ▼
┌─────────────────┐              ┌─────────────────┐
│  FDB Service    │              │ Voice Modulator │
│  (CDS Check)    │              │  (Analyze CDS)  │
└─────────────────┘              └─────────────────┘
       │                                   │
       │         CDSResult                 │
       └──────────────┬────────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │ Message Builder │
              │ (Format Speech) │
              └─────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │useVoiceReminder │
              │  (Synthesize)   │
              └─────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │  Web Speech API │
              │   (Play Audio)  │
              └─────────────────┘
```

## Components and Interfaces

### 1. Service: VoiceModulator

**Purpose**: Analyzes CDS results and calculates optimal voice modulation parameters based on severity.

**Interface**:
```typescript
interface VoiceModulator {
  calculateModulation(
    cdsResult: CDSResult,
    baseConfig: VoiceConfig,
    elderlyMode: boolean
  ): ModulatedVoiceConfig;
  
  getSeverityLevel(issues: CDSIssue[]): SeverityLevel;
  
  getModulationProfile(severity: SeverityLevel): ModulationProfile;
}

interface ModulatedVoiceConfig extends VoiceConfig {
  originalRate: number;
  originalPitch: number;
  originalVolume: number;
  appliedModulation: ModulationProfile;
}

interface ModulationProfile {
  rateMultiplier: number;
  pitchAdjustment: number;
  volumeMultiplier: number;
  description: string;
}

type SeverityLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

interface CDSIssue {
  code: string;
  severity: 'low' | 'moderate' | 'high';
  summary: string;
}
```

**Implementation**:
```typescript
class VoiceModulatorService implements VoiceModulator {
  private readonly modulationProfiles: Record<SeverityLevel, ModulationProfile> = {
    none: {
      rateMultiplier: 1.0,
      pitchAdjustment: 0,
      volumeMultiplier: 1.0,
      description: 'Normal voice - no issues detected'
    },
    low: {
      rateMultiplier: 0.9,
      pitchAdjustment: 0,
      volumeMultiplier: 1.05,
      description: 'Slightly slower with increased volume'
    },
    moderate: {
      rateMultiplier: 0.8,
      pitchAdjustment: 0,
      volumeMultiplier: 1.1,
      description: 'Noticeably slower with increased volume'
    },
    high: {
      rateMultiplier: 0.7,
      pitchAdjustment: -0.1,
      volumeMultiplier: 1.15,
      description: 'Significantly slower with lower pitch and increased volume'
    },
    critical: {
      rateMultiplier: 0.7,
      pitchAdjustment: -0.1,
      volumeMultiplier: 1.15,
      description: 'Maximum emphasis - very slow with lower pitch'
    }
  };

  calculateModulation(
    cdsResult: CDSResult,
    baseConfig: VoiceConfig,
    elderlyMode: boolean
  ): ModulatedVoiceConfig {
    const severity = this.getSeverityLevel(cdsResult.issues || []);
    const profile = this.modulationProfiles[severity];
    
    // Apply modulation to base config
    let modulatedRate = baseConfig.rate * profile.rateMultiplier;
    let modulatedPitch = baseConfig.pitch + profile.pitchAdjustment;
    let modulatedVolume = Math.min(1.0, baseConfig.volume * profile.volumeMultiplier);
    
    // Apply additional elderly mode adjustment
    if (elderlyMode) {
      modulatedRate *= 0.8; // Additional 20% reduction
    }
    
    // Clamp values to valid ranges
    modulatedRate = Math.max(0.1, Math.min(2.0, modulatedRate));
    modulatedPitch = Math.max(-1.0, Math.min(1.0, modulatedPitch));
    modulatedVolume = Math.max(0, Math.min(1.0, modulatedVolume));
    
    return {
      voiceId: baseConfig.voiceId,
      rate: modulatedRate,
      pitch: modulatedPitch,
      volume: modulatedVolume,
      originalRate: baseConfig.rate,
      originalPitch: baseConfig.pitch,
      originalVolume: baseConfig.volume,
      appliedModulation: profile
    };
  }

  getSeverityLevel(issues: CDSIssue[]): SeverityLevel {
    if (!issues || issues.length === 0) return 'none';
    
    // Find highest severity
    const severityOrder = { low: 1, moderate: 2, high: 3 };
    const maxSeverity = issues.reduce((max, issue) => {
      const current = severityOrder[issue.severity] || 0;
      return current > max ? current : max;
    }, 0);
    
    if (maxSeverity >= 3) return 'high';
    if (maxSeverity >= 2) return 'moderate';
    if (maxSeverity >= 1) return 'low';
    return 'none';
  }

  getModulationProfile(severity: SeverityLevel): ModulationProfile {
    return this.modulationProfiles[severity];
  }
}

export const voiceModulator = new VoiceModulatorService();
```

### 2. Service: MessageBuilder

**Purpose**: Constructs clear, well-formatted speech messages from prescription data and CDS results.

**Interface**:
```typescript
interface MessageBuilder {
  buildPrescriptionMessage(
    medication: string,
    strength: string,
    directions: string
  ): string;
  
  buildCDSWarningMessage(
    cdsResult: CDSResult,
    medication: string
  ): string;
  
  buildIssueDetailsMessage(issues: CDSIssue[]): string;
  
  buildConfirmationMessage(
    action: 'submitted' | 'saved' | 'updated',
    medication: string
  ): string;
  
  buildErrorMessage(error: string): string;
  
  formatForSpeech(text: string): string;
}
```

**Implementation**:
```typescript
class MessageBuilderService implements MessageBuilder {
  buildPrescriptionMessage(
    medication: string,
    strength: string,
    directions: string
  ): string {
    let message = `Prescription details: Medication name: ${medication}.`;
    
    if (strength) {
      message += ` Strength: ${this.formatForSpeech(strength)}.`;
    }
    
    message += ` Directions: ${this.formatForSpeech(directions)}.`;
    
    return message;
  }

  buildCDSWarningMessage(
    cdsResult: CDSResult,
    medication: string
  ): string {
    const issueCount = cdsResult.issues?.length || 0;
    
    if (cdsResult.ok) {
      return `No issues detected. ${this.buildPrescriptionMessage(medication, '', '')}`;
    }
    
    const plural = issueCount === 1 ? 'issue' : 'issues';
    return `Warning: Clinical Decision Support detected ${issueCount} potential ${plural}.`;
  }

  buildIssueDetailsMessage(issues: CDSIssue[]): string {
    if (!issues || issues.length === 0) return '';
    
    const messages = issues.map((issue, index) => {
      const severityText = this.getSeverityText(issue.severity);
      return `Issue ${index + 1}: ${severityText} severity. ${this.formatForSpeech(issue.summary)}.`;
    });
    
    return messages.join(' ... '); // Pause between issues
  }

  buildConfirmationMessage(
    action: 'submitted' | 'saved' | 'updated',
    medication: string
  ): string {
    const actionText = {
      submitted: 'submitted successfully',
      saved: 'saved to your medication list',
      updated: 'updated successfully'
    };
    
    return `Prescription for ${medication} has been ${actionText[action]}.`;
  }

  buildErrorMessage(error: string): string {
    return `Error: ${this.formatForSpeech(error)}. Please try again.`;
  }

  formatForSpeech(text: string): string {
    // Add pauses at punctuation
    let formatted = text
      .replace(/,/g, ', ')
      .replace(/\./g, '. ')
      .replace(/;/g, '; ');
    
    // Expand common abbreviations
    formatted = formatted
      .replace(/\bmg\b/gi, 'milligrams')
      .replace(/\bmcg\b/gi, 'micrograms')
      .replace(/\bml\b/gi, 'milliliters')
      .replace(/\btablet\b/gi, 'tablet')
      .replace(/\bcapsule\b/gi, 'capsule');
    
    // Break long sentences
    const words = formatted.split(' ');
    if (words.length > 15) {
      const chunks: string[] = [];
      for (let i = 0; i < words.length; i += 15) {
        chunks.push(words.slice(i, i + 15).join(' '));
      }
      formatted = chunks.join(' ... ');
    }
    
    return formatted;
  }

  private getSeverityText(severity: string): string {
    const severityMap: Record<string, string> = {
      low: 'Low',
      moderate: 'Moderate',
      high: 'High'
    };
    return severityMap[severity] || severity;
  }
}

export const messageBuilder = new MessageBuilderService();
```

### 3. Service: SettingsPersister

**Purpose**: Persists and retrieves voice configuration settings from local storage.

**Interface**:
```typescript
interface SettingsPersister {
  saveVoiceConfig(config: VoiceConfig): void;
  loadVoiceConfig(elderlyMode: boolean): VoiceConfig;
  clearVoiceConfig(): void;
}
```

**Implementation**:
```typescript
class SettingsPersisterService implements SettingsPersister {
  private readonly STORAGE_KEY = 'medreminder_voice_config';

  saveVoiceConfig(config: VoiceConfig): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save voice config:', error);
    }
  }

  loadVoiceConfig(elderlyMode: boolean): VoiceConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        // Apply elderly mode adjustment if needed
        if (elderlyMode && config.rate > 0.8) {
          config.rate = 0.8;
        }
        return config;
      }
    } catch (error) {
      console.error('Failed to load voice config:', error);
    }
    
    // Return default config
    return {
      voiceId: '',
      rate: elderlyMode ? 0.8 : 1.0,
      pitch: 0,
      volume: 1.0
    };
  }

  clearVoiceConfig(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear voice config:', error);
    }
  }
}

export const settingsPersister = new SettingsPersisterService();
```

### 4. Enhanced Hook: useVoiceReminder

**Purpose**: Extended to support modulated voice synthesis and CDS-aware speech.

**New Methods**:
```typescript
interface EnhancedVoiceReminder extends VoiceReminder {
  speakWithModulation(
    text: string,
    modulatedConfig: ModulatedVoiceConfig
  ): void;
  
  speakCDSResult(
    cdsResult: CDSResult,
    medication: string,
    strength: string,
    directions: string,
    baseConfig: VoiceConfig,
    elderlyMode: boolean
  ): void;
  
  getCurrentUtterance(): SpeechSynthesisUtterance | null;
}
```

**Implementation Addition**:
```typescript
const speakWithModulation = useCallback((
  text: string,
  modulatedConfig: ModulatedVoiceConfig
) => {
  if (!isSupported) return;
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = modulatedConfig.rate;
  utterance.pitch = modulatedConfig.pitch;
  utterance.volume = modulatedConfig.volume;
  
  const selectedVoice = voices.find(v => v.name === modulatedConfig.voiceId);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  
  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);
  
  window.speechSynthesis.speak(utterance);
}, [isSupported, voices]);

const speakCDSResult = useCallback((
  cdsResult: CDSResult,
  medication: string,
  strength: string,
  directions: string,
  baseConfig: VoiceConfig,
  elderlyMode: boolean
) => {
  if (!isSupported) return;
  
  // Calculate modulation based on CDS severity
  const modulatedConfig = voiceModulator.calculateModulation(
    cdsResult,
    baseConfig,
    elderlyMode
  );
  
  // Build warning message if issues exist
  let message = '';
  if (!cdsResult.ok && cdsResult.issues && cdsResult.issues.length > 0) {
    message = messageBuilder.buildCDSWarningMessage(cdsResult, medication);
    message += ' ';
  }
  
  // Add prescription details
  message += messageBuilder.buildPrescriptionMessage(
    medication,
    strength,
    directions
  );
  
  // Speak with modulated voice
  speakWithModulation(message, modulatedConfig);
}, [isSupported, speakWithModulation]);
```

### 5. Enhanced Component: PrescriptionVoice

**New State**:
```typescript
const [isCheckingCDS, setIsCheckingCDS] = useState(false);
const [showIssueDetails, setShowIssueDetails] = useState(false);
const [modulationApplied, setModulationApplied] = useState<ModulationProfile | null>(null);
```

**Enhanced checkAndSpeak Method**:
```typescript
async function checkAndSpeak() {
  if (!medication) return;
  
  setIsCheckingCDS(true);
  
  try {
    // Perform CDS check
    const res = await fdb.checkMedication({ 
      medication, 
      patientId: user?.id 
    });
    
    setCdsResult(res);
    
    // Calculate modulation
    const modulatedConfig = voiceModulator.calculateModulation(
      res,
      voiceConfig,
      elderlyMode
    );
    
    setModulationApplied(modulatedConfig.appliedModulation);
    
    // Speak with modulated voice
    speakCDSResult(
      res,
      medication,
      strength,
      directions,
      voiceConfig,
      elderlyMode
    );
    
    // Show visual feedback
    if (!res.ok && res.issues && res.issues.length > 0) {
      setShowIssueDetails(true);
    }
    
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    speakWithVoice(
      messageBuilder.buildErrorMessage(errorMessage),
      voiceConfig.voiceId,
      { ...voiceConfig, rate: voiceConfig.rate * 0.8, volume: 1.0 }
    );
    alert(errorMessage);
  } finally {
    setIsCheckingCDS(false);
  }
}
```

**Enhanced submitPrescription Method**:
```typescript
async function submitPrescription() {
  if (!user || !medication) return;
  
  // Check if CDS was run and has issues
  if (cdsResult && !cdsResult.ok && cdsResult.issues && cdsResult.issues.length > 0) {
    const confirmed = window.confirm(
      `CDS detected ${cdsResult.issues.length} issue(s). Do you want to proceed with submission?`
    );
    if (!confirmed) return;
  }
  
  setSubmitting(true);
  
  try {
    const res = await fulfillment.submitPrescription({ 
      patientId: user.id, 
      medication, 
      strength, 
      directions 
    });
    
    // Speak confirmation
    speakWithVoice(
      messageBuilder.buildConfirmationMessage('submitted', medication),
      voiceConfig.voiceId,
      voiceConfig
    );
    
    alert('Prescription submitted: ' + JSON.stringify(res));
    
    // Reset form
    setMedication('');
    setStrength('');
    setDirections('Take one tablet daily');
    setCdsResult(null);
    setModulationApplied(null);
    
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    speakWithVoice(
      messageBuilder.buildErrorMessage(errorMessage),
      voiceConfig.voiceId,
      { ...voiceConfig, rate: voiceConfig.rate * 0.8, volume: 1.0 }
    );
    alert(errorMessage);
  } finally {
    setSubmitting(false);
  }
}
```

### 6. New Component: ModulationIndicator

**Purpose**: Visual feedback showing applied voice modulation.

**Props**:
```typescript
interface ModulationIndicatorProps {
  modulation: ModulationProfile | null;
  elderlyMode: boolean;
}
```

**Implementation**:
```typescript
export const ModulationIndicator = ({ 
  modulation, 
  elderlyMode 
}: ModulationIndicatorProps) => {
  if (!modulation) return null;
  
  return (
    <div className={cn(
      'flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20',
      elderlyMode && 'p-4'
    )}>
      <Volume2 size={elderlyMode ? 20 : 16} className="text-primary" />
      <div className="flex-1">
        <p className={cn(
          'text-sm font-medium',
          elderlyMode && 'text-base'
        )}>
          Voice Modulation Active
        </p>
        <p className={cn(
          'text-xs text-muted-foreground',
          elderlyMode && 'text-sm'
        )}>
          {modulation.description}
        </p>
      </div>
      <Badge variant="outline" className={cn(elderlyMode && 'text-base px-3 py-1')}>
        {Math.round(modulation.rateMultiplier * 100)}% speed
      </Badge>
    </div>
  );
};
```

## Data Models

### VoiceConfig

```typescript
interface VoiceConfig {
  voiceId: string;
  rate: number;      // 0.1 to 2.0
  pitch: number;     // -1.0 to 1.0
  volume: number;    // 0.0 to 1.0
}
```

### ModulatedVoiceConfig

```typescript
interface ModulatedVoiceConfig extends VoiceConfig {
  originalRate: number;
  originalPitch: number;
  originalVolume: number;
  appliedModulation: ModulationProfile;
}
```

### ModulationProfile

```typescript
interface ModulationProfile {
  rateMultiplier: number;     // Multiplier for speech rate
  pitchAdjustment: number;    // Additive adjustment for pitch
  volumeMultiplier: number;   // Multiplier for volume
  description: string;        // Human-readable description
}
```

### CDSResult (from FDB service)

```typescript
interface CDSResult {
  ok: boolean;
  issues: CDSIssue[];
  matchedProduct?: {
    id?: string;
    name?: string;
    rxcui?: string;
  };
}

interface CDSIssue {
  code: string;
  severity: 'low' | 'moderate' | 'high';
  summary: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Check and Speak triggers both CDS and voice

*For any* valid medication name, clicking "Check and Speak" should trigger both CDS validation and voice synthesis.
**Validates: Requirements 1.1**

### Property 2: No issues uses base voice configuration

*For any* base voice configuration, when CDS returns no issues, the voice parameters should match the base configuration without modulation.
**Validates: Requirements 1.2, 2.1**

### Property 3: Issues include warning count in message

*For any* CDS result with issues, the spoken message should contain the count of issues detected.
**Validates: Requirements 1.3**

### Property 4: Prescription message completeness

*For any* prescription with medication name, strength, and directions, the spoken message should include all provided fields.
**Validates: Requirements 1.4**

### Property 5: Button disabled without medication

*For any* UI state, the "Check and Speak" button disabled state should equal whether the medication field is empty.
**Validates: Requirements 1.5**

### Property 6: Low severity modulation values

*For any* base voice configuration, when CDS returns low-severity issues, the modulated rate should be base rate × 0.9 and volume should be base volume × 1.05.
**Validates: Requirements 2.2**

### Property 7: Moderate severity modulation values

*For any* base voice configuration, when CDS returns moderate-severity issues, the modulated rate should be base rate × 0.8 and volume should be base volume × 1.1.
**Validates: Requirements 2.3**

### Property 8: High severity modulation values

*For any* base voice configuration, when CDS returns high-severity issues, the modulated rate should be base rate × 0.7, volume should be base volume × 1.15, and pitch should be base pitch - 0.1.
**Validates: Requirements 2.4**

### Property 9: Highest severity determines modulation

*For any* list of CDS issues with mixed severities, the modulation profile should be determined by the highest severity level present.
**Validates: Requirements 2.5**

### Property 10: Successful submission triggers confirmation speech

*For any* successful prescription submission, the system should speak a confirmation message using the configured voice settings.
**Validates: Requirements 3.2**

### Property 11: Failed submission uses emphasized voice

*For any* failed prescription submission, the error message should be spoken with reduced speed and increased volume for emphasis.
**Validates: Requirements 3.3**

### Property 12: Issue count precedes prescription details

*For any* CDS result with issues, the spoken message should contain the issue count before the prescription details.
**Validates: Requirements 4.1**

### Property 13: Issue message includes all fields

*For any* CDS issue, the spoken message should include severity, summary, and affected medication.
**Validates: Requirements 4.2**

### Property 14: Multiple issues have pauses

*For any* CDS result with multiple issues, the spoken message should contain pause markers between each issue.
**Validates: Requirements 4.3**

### Property 15: Long text is chunked

*For any* text longer than 15 words, the formatted speech text should be broken into chunks of maximum 15 words.
**Validates: Requirements 4.4**

### Property 16: Elderly mode adds speed reduction

*For any* modulated voice configuration, when elderly mode is enabled, the rate should be further reduced by 20%.
**Validates: Requirements 4.5**

### Property 17: Config changes apply to next speech

*For any* voice configuration change, the new settings should be used in the next speech event.
**Validates: Requirements 5.2, 7.2**

### Property 18: Preset updates all parameters

*For any* voice preset selection, all voice parameters (rate, pitch, volume) should be updated to match the preset values.
**Validates: Requirements 5.4**

### Property 19: Preview disabled while speaking

*For any* UI state, the preview button disabled state should equal whether speech is currently active.
**Validates: Requirements 5.5**

### Property 20: Playback controls visible when speaking

*For any* UI state, playback controls should be visible if and only if speech is currently active.
**Validates: Requirements 6.1**

### Property 21: Speech completion resets state

*For any* speech event, when speech completes naturally, the isSpeaking state should become false.
**Validates: Requirements 6.5**

### Property 22: Selected voice persists

*For any* voice selection, all subsequent speech should use the selected voice.
**Validates: Requirements 7.1**

### Property 23: Modulation is relative to base settings

*For any* base voice configuration and severity level, the modulated values should be calculated relative to the base values, not absolute values.
**Validates: Requirements 7.3**

### Property 24: Elderly mode default speed

*For any* voice configuration loaded with elderly mode enabled, the default rate should be 0.8.
**Validates: Requirements 7.4**

### Property 25: Settings during speech don't affect current utterance

*For any* voice configuration change during active speech, the current utterance should continue with original settings.
**Validates: Requirements 7.5**

### Property 26: Speaking shows visual indicator

*For any* UI state, when isSpeaking is true, a visual indicator should be displayed.
**Validates: Requirements 8.1**

### Property 27: CDS issues displayed visually

*For any* CDS result with issues, the issues should be rendered in the UI alongside voice output.
**Validates: Requirements 8.3**

### Property 28: Paused state shows indicator

*For any* UI state, when speech is paused, a paused state indicator should be visible.
**Validates: Requirements 8.4**

### Property 29: Speech completion removes indicators

*For any* UI state, when isSpeaking becomes false, active speech indicators should be hidden.
**Validates: Requirements 8.5**

### Property 30: Network error triggers error speech

*For any* CDS validation that fails due to network error, the system should speak an error message.
**Validates: Requirements 9.1**

### Property 31: Submission error triggers error speech

*For any* prescription submission that fails, the system should speak the error message.
**Validates: Requirements 9.3**

### Property 32: Speech errors are logged and notified

*For any* speech synthesis error event, the error should be logged and the user should be notified.
**Validates: Requirements 9.5**

### Property 33: Settings persisted to storage

*For any* voice configuration adjustment, the settings should be saved to local storage.
**Validates: Requirements 11.1**

### Property 34: Saved settings are loaded

*For any* page load with saved settings in local storage, the settings should be loaded and applied.
**Validates: Requirements 11.2**

### Property 35: No saved settings uses defaults

*For any* page load without saved settings, default settings should be used based on elderly mode status.
**Validates: Requirements 11.3**

### Property 36: Voice selection is persisted

*For any* voice selection change, the voice preference should be saved to local storage.
**Validates: Requirements 11.4**

### Property 37: Elderly mode toggle adjusts speed

*For any* elderly mode toggle, the default speed settings should be adjusted accordingly.
**Validates: Requirements 11.5**

### Property 38: Medication names have pauses

*For any* medication name with multiple words, the formatted text should have spaces for clear pronunciation.
**Validates: Requirements 12.1**

### Property 39: Dosage formatting separates numbers and units

*For any* dosage string, the formatted text should have spaces between numbers and units.
**Validates: Requirements 12.2**

### Property 40: Punctuation adds pauses

*For any* text with commas or periods, the formatted text should have spaces after punctuation for natural pauses.
**Validates: Requirements 12.3**

### Property 41: Abbreviations are expanded

*For any* text containing common medical abbreviations (mg, mcg, ml), the formatted text should expand them to full words.
**Validates: Requirements 12.5**

## Error Handling

### CDS Validation Errors

**Strategy**: Graceful degradation with voice and visual feedback

**Error Scenarios**:
1. **Network Error**: Speak "Unable to validate medication due to network error. Please check your connection and try again."
2. **Server Error**: Speak "Clinical decision support is temporarily unavailable. You can still submit your prescription."
3. **Timeout**: Speak "Validation is taking longer than expected. Please try again."

**Implementation**:
```typescript
try {
  const res = await fdb.checkMedication({ medication, patientId: user?.id });
  setCdsResult(res);
} catch (error) {
  console.error("CDS validation failed:", error);
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  speakWithVoice(
    messageBuilder.buildErrorMessage(errorMessage),
    voiceConfig.voiceId,
    { ...voiceConfig, rate: voiceConfig.rate * 0.8, volume: 1.0 }
  );
  toast.error("CDS validation failed. You can still submit your prescription.");
}
```

### Voice Synthesis Errors

**Strategy**: Fallback to visual-only mode with clear messaging

**Error Scenarios**:
1. **Browser Not Supported**: Show message "Voice features are not supported in your browser. Please use Chrome, Firefox, or Edge."
2. **No Voices Available**: Show message "No voices are available. Voice features are disabled."
3. **Synthesis Error**: Log error and show toast "Voice playback failed. Please try again."

**Implementation**:
```typescript
if (!isSupported) {
  toast.warning("Voice features are not available in your browser.");
  return;
}

utterance.onerror = (event) => {
  console.error("Speech synthesis error:", event);
  setIsSpeaking(false);
  toast.error("Voice playback failed. Please try again.");
};
```

### Prescription Submission Errors

**Strategy**: Voice feedback with retry options

**Error Scenarios**:
1. **Validation Error**: Speak "Prescription validation failed. Please check your entries."
2. **Server Error**: Speak "Unable to submit prescription. Please try again later."
3. **Network Error**: Speak "Network error. Please check your connection and retry."

## Testing Strategy

### Unit Testing

**Framework**: Vitest + React Testing Library

**Test Coverage**:

1. **VoiceModulator Tests**:
   - Severity level calculation from issue arrays
   - Modulation profile selection
   - Parameter calculation for each severity level
   - Elderly mode adjustment
   - Value clamping to valid ranges

2. **MessageBuilder Tests**:
   - Prescription message formatting
   - CDS warning message construction
   - Issue details formatting
   - Confirmation message generation
   - Error message formatting
   - Speech text formatting (abbreviations, pauses, chunking)

3. **SettingsPersister Tests**:
   - Save configuration to localStorage
   - Load configuration from localStorage
   - Default configuration generation
   - Elderly mode defaults

4. **useVoiceReminder Hook Tests**:
   - speakWithModulation function
   - speakCDSResult function
   - Voice parameter application
   - Error handling

5. **Component Tests**:
   - PrescriptionVoice component rendering
   - Check and Speak button state
   - Submit button state
   - CDS result display
   - Modulation indicator display
   - Voice controls integration

**Example Unit Test**:
```typescript
describe('VoiceModulator', () => {
  it('should apply correct modulation for high severity', () => {
    const baseConfig: VoiceConfig = {
      voiceId: 'test-voice',
      rate: 1.0,
      pitch: 0,
      volume: 0.8
    };
    
    const cdsResult: CDSResult = {
      ok: false,
      issues: [{ code: 'TEST', severity: 'high', summary: 'Test issue' }]
    };
    
    const modulated = voiceModulator.calculateModulation(
      cdsResult,
      baseConfig,
      false
    );
    
    expect(modulated.rate).toBeCloseTo(0.7); // 1.0 * 0.7
    expect(modulated.pitch).toBeCloseTo(-0.1); // 0 + (-0.1)
    expect(modulated.volume).toBeCloseTo(0.92); // 0.8 * 1.15
  });
});
```

### Property-Based Testing

**Framework**: fast-check

**Configuration**: Each property test should run a minimum of 100 iterations

**Test Coverage**:

1. **Modulation Calculation Property**:
   - Generate random base configs and CDS results
   - Verify modulated values are within valid ranges
   - Verify modulation is applied correctly

2. **Message Formatting Property**:
   - Generate random prescription data
   - Verify all provided fields appear in message
   - Verify text chunking for long messages

3. **Severity Aggregation Property**:
   - Generate random issue arrays with mixed severities
   - Verify highest severity is selected

4. **Settings Persistence Property**:
   - Generate random voice configs
   - Verify save and load round-trip

**Example Property Test**:
```typescript
import fc from 'fast-check';

describe('Voice Modulation Properties', () => {
  it('should always produce valid voice parameters', () => {
    /**
     * Feature: voice-prescription-integration, Property 8: High severity modulation values
     */
    fc.assert(
      fc.property(
        fc.record({
          voiceId: fc.string(),
          rate: fc.float({ min: 0.1, max: 2.0 }),
          pitch: fc.float({ min: -1.0, max: 1.0 }),
          volume: fc.float({ min: 0, max: 1.0 })
        }),
        fc.constantFrom('low', 'moderate', 'high'),
        (baseConfig, severity) => {
          const cdsResult: CDSResult = {
            ok: false,
            issues: [{ code: 'TEST', severity, summary: 'Test' }]
          };
          
          const modulated = voiceModulator.calculateModulation(
            cdsResult,
            baseConfig,
            false
          );
          
          // Verify all values are within valid ranges
          return (
            modulated.rate >= 0.1 && modulated.rate <= 2.0 &&
            modulated.pitch >= -1.0 && modulated.pitch <= 1.0 &&
            modulated.volume >= 0 && modulated.volume <= 1.0
          );
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should include all prescription fields in message', () => {
    /**
     * Feature: voice-prescription-integration, Property 4: Prescription message completeness
     */
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string(),
        fc.string(),
        (medication, strength, directions) => {
          const message = messageBuilder.buildPrescriptionMessage(
            medication,
            strength,
            directions
          );
          
          // Verify medication is always included
          const hasMedication = message.includes(medication);
          
          // Verify strength is included if provided
          const hasStrength = !strength || message.includes(strength);
          
          // Verify directions is included if provided
          const hasDirections = !directions || message.includes(directions);
          
          return hasMedication && hasStrength && hasDirections;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Scope**: End-to-end voice prescription flow

**Test Scenarios**:

1. **Complete Check and Speak Flow**:
   - Enter prescription details
   - Click "Check and Speak"
   - Verify CDS validation called
   - Verify voice synthesis initiated
   - Verify modulation applied based on severity
   - Verify visual feedback displayed

2. **Prescription Submission Flow**:
   - Enter prescription details
   - Run CDS check
   - Handle issues confirmation
   - Submit prescription
   - Verify confirmation speech
   - Verify form reset

3. **Voice Settings Persistence Flow**:
   - Adjust voice settings
   - Verify settings saved to localStorage
   - Reload page
   - Verify settings restored
   - Verify speech uses restored settings

4. **Error Handling Flow**:
   - Mock CDS failure
   - Verify error speech
   - Mock submission failure
   - Verify error speech with emphasis

## Performance Considerations

### Optimization Strategies

1. **Voice Synthesis**:
   - Cancel previous utterances before starting new ones
   - Debounce rapid voice setting changes
   - Preload voice list on component mount
   - Cache modulation calculations

2. **Message Building**:
   - Memoize formatted messages
   - Optimize text chunking algorithm
   - Cache abbreviation expansions

3. **Settings Persistence**:
   - Debounce localStorage writes
   - Batch multiple setting changes
   - Use async storage operations

### Performance Targets

- **CDS Validation**: < 2 seconds
- **Voice Synthesis Start**: < 100ms
- **Modulation Calculation**: < 10ms
- **Message Formatting**: < 50ms
- **Settings Save/Load**: < 20ms

## Accessibility

### WCAG 2.1 AA Compliance

**Requirements**:

1. **Voice Controls**:
   - Keyboard accessible sliders
   - ARIA labels for all controls
   - Focus indicators
   - Screen reader announcements

2. **Playback Controls**:
   - Keyboard shortcuts (Space for pause/resume, Escape for stop)
   - Clear button labels
   - Status announcements

3. **Visual Feedback**:
   - High contrast indicators
   - Non-color-dependent status
   - Clear text labels

**Implementation**:
```typescript
<Button
  onClick={checkAndSpeak}
  disabled={!medication || isSpeaking}
  aria-label="Check medication with clinical decision support and speak results"
  aria-busy={isCheckingCDS}
>
  <Mic aria-hidden="true" />
  Check & Speak
</Button>

<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {isSpeaking && "Speaking prescription details"}
  {modulationApplied && `Voice modulation active: ${modulationApplied.description}`}
</div>
```

## Security Considerations

### Data Privacy

**Measures**:
1. **Local Processing**: Voice synthesis performed entirely in browser
2. **No Audio Recording**: System only outputs speech, never records
3. **Secure API Calls**: CDS and submission use authenticated endpoints
4. **No Voice Data Storage**: Voice settings stored locally, no audio data persisted

### Input Validation

**Measures**:
1. **Medication Name**: Sanitize before sending to CDS
2. **Voice Settings**: Validate ranges before applying
3. **Error Messages**: Sanitize error text before speaking
4. **XSS Prevention**: Escape all user input in messages

## Deployment Considerations

### Dependencies

**No New Dependencies**: Feature uses existing Web Speech API and services

### Browser Compatibility

**Requirements**:
- Chrome 33+ (Web Speech API)
- Firefox 49+ (Web Speech API)
- Safari 14.1+ (Web Speech API)
- Edge 14+ (Web Speech API)

**Fallback**: Visual-only mode for unsupported browsers

### Monitoring

**Metrics to Track**:
1. Voice synthesis success rate
2. CDS validation response time
3. Modulation application frequency by severity
4. User preset selection distribution
5. Error rates by type
6. Settings persistence success rate

**Implementation**:
```typescript
analytics.track('voice_prescription_check', {
  hasCDSIssues: !cdsResult.ok,
  issueCount: cdsResult.issues?.length || 0,
  highestSeverity: voiceModulator.getSeverityLevel(cdsResult.issues || []),
  modulationApplied: modulationApplied?.description,
  elderlyMode: elderlyMode,
  voiceRate: voiceConfig.rate
});
```
