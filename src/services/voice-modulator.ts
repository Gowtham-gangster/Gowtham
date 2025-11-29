import { CDSResult } from './fdb';

export interface VoiceConfig {
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface ModulatedVoiceConfig extends VoiceConfig {
  originalRate: number;
  originalPitch: number;
  originalVolume: number;
  appliedModulation: ModulationProfile;
}

export interface ModulationProfile {
  rateMultiplier: number;
  pitchAdjustment: number;
  volumeMultiplier: number;
  description: string;
}

export type SeverityLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';

interface CDSIssue {
  code: string;
  severity: 'low' | 'moderate' | 'high';
  summary: string;
}

class VoiceModulatorService {
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
    const severityOrder: Record<string, number> = { low: 1, moderate: 2, high: 3 };
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
