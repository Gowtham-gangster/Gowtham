import { MedicineForm, FrequencyType } from '@/types';

export interface ParsedMedication {
  name: string;
  strength: string;
  form: MedicineForm;
  dosage: DosageInfo;
  frequency: FrequencyInfo;
  instructions: string;
  confidence: number;
}

export interface DosageInfo {
  amount: number;
  unit: string;
}

export interface FrequencyInfo {
  type: FrequencyType;
  timesPerDay?: number;
  specificTimes?: string[];
  interval?: number;
  instructions?: string;
}

class MedicationParser {
  private medicationPatterns = {
    // Medication name (capitalized words, possibly with numbers)
    name: /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+\d+)?)\b/g,
    
    // Strength (number + unit)
    strength: /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?|iu|meq)/gi,
    
    // Form
    form: /\b(tablet|capsule|liquid|injection|syrup|suspension|cream|ointment|patch|inhaler)s?\b/gi,
  };

  private frequencyPatterns: Record<string, FrequencyInfo> = {
    'once daily': { type: 'DAILY', timesPerDay: 1 },
    'once a day': { type: 'DAILY', timesPerDay: 1 },
    'one time daily': { type: 'DAILY', timesPerDay: 1 },
    'qd': { type: 'DAILY', timesPerDay: 1 },
    'od': { type: 'DAILY', timesPerDay: 1 },
    
    'twice daily': { type: 'DAILY', timesPerDay: 2 },
    'twice a day': { type: 'DAILY', timesPerDay: 2 },
    'two times daily': { type: 'DAILY', timesPerDay: 2 },
    'bid': { type: 'DAILY', timesPerDay: 2 },
    'bd': { type: 'DAILY', timesPerDay: 2 },
    
    'three times daily': { type: 'DAILY', timesPerDay: 3 },
    'three times a day': { type: 'DAILY', timesPerDay: 3 },
    'tid': { type: 'DAILY', timesPerDay: 3 },
    'tds': { type: 'DAILY', timesPerDay: 3 },
    
    'four times daily': { type: 'DAILY', timesPerDay: 4 },
    'four times a day': { type: 'DAILY', timesPerDay: 4 },
    'qid': { type: 'DAILY', timesPerDay: 4 },
    'qds': { type: 'DAILY', timesPerDay: 4 },
    
    'every 4 hours': { type: 'EVERY_X_HOURS', interval: 4 },
    'every 6 hours': { type: 'EVERY_X_HOURS', interval: 6 },
    'every 8 hours': { type: 'EVERY_X_HOURS', interval: 8 },
    'every 12 hours': { type: 'EVERY_X_HOURS', interval: 12 },
    'q4h': { type: 'EVERY_X_HOURS', interval: 4 },
    'q6h': { type: 'EVERY_X_HOURS', interval: 6 },
    'q8h': { type: 'EVERY_X_HOURS', interval: 8 },
    'q12h': { type: 'EVERY_X_HOURS', interval: 12 },
    
    'as needed': { type: 'DAILY', timesPerDay: 1, instructions: 'as needed' },
    'prn': { type: 'DAILY', timesPerDay: 1, instructions: 'as needed' },
    'when required': { type: 'DAILY', timesPerDay: 1, instructions: 'as needed' },
  };

  parseMedications(text: string): ParsedMedication[] {
    const medications: ParsedMedication[] = [];
    const lines = text.split('\n');

    for (const line of lines) {
      const medication = this.parseMedicationLine(line);
      if (medication) {
        medications.push(medication);
      }
    }

    return medications;
  }

  private parseMedicationLine(line: string): ParsedMedication | null {
    // Extract medication name
    const name = this.extractMedicationName(line);
    if (!name) return null;

    // Extract strength
    const strength = this.extractStrength(line);
    if (!strength) return null;

    // Extract form
    const form = this.extractForm(line);

    // Extract dosage
    const dosage = this.extractDosage(line);

    // Extract frequency
    const frequency = this.extractFrequency(line);

    // Extract instructions
    const instructions = this.extractInstructions(line);

    // Calculate confidence
    const confidence = this.calculateConfidence(name, strength, frequency);

    return {
      name,
      strength,
      form,
      dosage,
      frequency,
      instructions,
      confidence,
    };
  }

  private extractMedicationName(text: string): string {
    // Look for capitalized words at the beginning of the line
    const match = text.match(/^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    if (match) {
      return match[1].trim();
    }

    // Fallback: look for any capitalized word
    const words = text.match(/\b[A-Z][a-z]+\b/g);
    if (words && words.length > 0) {
      return words[0];
    }

    return '';
  }

  private extractStrength(text: string): string {
    const match = text.match(this.medicationPatterns.strength);
    if (match && match.length > 0) {
      return match[0];
    }
    return '';
  }

  private extractForm(text: string): MedicineForm {
    const match = text.match(this.medicationPatterns.form);
    if (match && match.length > 0) {
      const form = match[0].toLowerCase().replace(/s$/, ''); // Remove plural 's'
      
      // Map to MedicineForm type
      switch (form) {
        case 'tablet':
          return 'tablet';
        case 'capsule':
          return 'capsule';
        case 'liquid':
        case 'syrup':
        case 'suspension':
          return 'liquid';
        case 'injection':
          return 'injection';
        default:
          return 'other';
      }
    }
    return 'tablet'; // Default
  }

  private extractDosage(text: string): DosageInfo {
    // Look for dosage amount (e.g., "take 1", "take 2")
    const match = text.match(/take\s+(\d+)/i);
    if (match) {
      return {
        amount: parseInt(match[1]),
        unit: 'tablet',
      };
    }

    // Default to 1
    return {
      amount: 1,
      unit: 'tablet',
    };
  }

  extractFrequency(text: string): FrequencyInfo {
    const lowerText = text.toLowerCase();

    // Check each frequency pattern
    for (const [pattern, frequency] of Object.entries(this.frequencyPatterns)) {
      if (lowerText.includes(pattern)) {
        return { ...frequency };
      }
    }

    // Check for "every X days" pattern
    const everyDaysMatch = lowerText.match(/every\s+(\d+)\s+days?/);
    if (everyDaysMatch) {
      return {
        type: 'EVERY_X_DAYS',
        interval: parseInt(everyDaysMatch[1]),
      };
    }

    // Check for specific times
    const timeMatch = lowerText.match(/at\s+(\d{1,2}:\d{2}(?:\s*[ap]m)?)/gi);
    if (timeMatch) {
      return {
        type: 'DAILY',
        specificTimes: timeMatch.map(t => t.replace(/at\s+/i, '')),
      };
    }

    // Default to once daily
    return {
      type: 'DAILY',
      timesPerDay: 1,
    };
  }

  private extractInstructions(text: string): string {
    const instructionPatterns = [
      /before meals?/i,
      /after meals?/i,
      /with food/i,
      /on empty stomach/i,
      /at bedtime/i,
      /in the morning/i,
      /in the evening/i,
      /with water/i,
      /do not crush/i,
      /swallow whole/i,
    ];

    const instructions: string[] = [];

    for (const pattern of instructionPatterns) {
      const match = text.match(pattern);
      if (match) {
        instructions.push(match[0]);
      }
    }

    return instructions.join(', ');
  }

  private calculateConfidence(name: string, strength: string, frequency: FrequencyInfo): number {
    let confidence = 0.3; // Base confidence

    if (name) confidence += 0.3;
    if (strength) confidence += 0.2;
    if (frequency.type !== 'DAILY' || frequency.timesPerDay !== 1) confidence += 0.2;

    return Math.min(confidence, 1);
  }
}

export const medicationParser = new MedicationParser();
