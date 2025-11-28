import { DiseaseProfile } from '@/types/chronic-disease';
import { Medicine, Schedule, FrequencyType } from '@/types';
import { DetectedDisease } from './disease-detector';
import { ParsedMedication } from './medication-parser';
import { guidelineGenerator } from './guideline-generator';

const generateId = () => Math.random().toString(36).substring(2, 11);

class ProfileCreator {
  createDiseaseProfiles(
    diseases: DetectedDisease[],
    medications: ParsedMedication[],
    userId: string,
    userAge?: number
  ): DiseaseProfile[] {
    const profiles: DiseaseProfile[] = [];

    for (const disease of diseases) {
      // Create basic profile
      const profile: DiseaseProfile = {
        id: generateId(),
        userId,
        diseaseId: disease.diseaseId,
        diseaseName: disease.diseaseName,
        personalInfo: {
          age: userAge || 30, // Default age if not provided
        },
        symptoms: [], // User can fill this later
        lifestyle: {
          diet: 'average',
          exerciseFrequency: 'weekly',
          smokingStatus: 'never',
          alcoholConsumption: 'none',
        },
        medicationHistory: disease.relatedMedications.join(', '),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      profiles.push(profile);
    }

    return profiles;
  }

  createMedicineEntries(
    medications: ParsedMedication[],
    userId: string
  ): Medicine[] {
    const medicines: Medicine[] = [];

    for (const med of medications) {
      const medicine: Medicine = {
        id: generateId(),
        userId,
        name: med.name,
        strength: med.strength,
        form: med.form,
        colorTag: this.getDefaultColorTag(medicines.length),
        stockCount: 30, // Default stock
        refillThreshold: 7, // Default threshold
        instructions: med.instructions || undefined,
        createdAt: new Date().toISOString(),
      };

      medicines.push(medicine);
    }

    return medicines;
  }

  createSchedules(
    medicines: Medicine[],
    medications: ParsedMedication[]
  ): Schedule[] {
    const schedules: Schedule[] = [];

    for (let i = 0; i < medicines.length; i++) {
      const medicine = medicines[i];
      const medication = medications[i];

      if (!medication) continue;

      const schedule: Schedule = {
        id: generateId(),
        medicineId: medicine.id,
        frequencyType: medication.frequency.type,
        timesOfDay: this.generateTimesOfDay(medication.frequency),
        startDate: new Date().toISOString(),
        dosageAmount: medication.dosage.amount,
        dosageUnit: medication.dosage.unit,
      };

      // Add frequency-specific fields
      if (medication.frequency.type === 'EVERY_X_HOURS' && medication.frequency.interval) {
        schedule.intervalHours = medication.frequency.interval;
      }

      if (medication.frequency.type === 'EVERY_X_DAYS' && medication.frequency.interval) {
        schedule.intervalDays = medication.frequency.interval;
      }

      if (medication.frequency.specificTimes) {
        schedule.timesOfDay = medication.frequency.specificTimes;
      }

      schedules.push(schedule);
    }

    return schedules;
  }

  checkForDuplicateProfiles(
    newDiseaseId: string,
    userId: string,
    existingProfiles: DiseaseProfile[]
  ): DiseaseProfile | null {
    return existingProfiles.find(
      (p) => p.diseaseId === newDiseaseId && p.userId === userId
    ) || null;
  }

  checkForDuplicateMedicines(
    newMedicineName: string,
    userId: string,
    existingMedicines: Medicine[]
  ): Medicine | null {
    return existingMedicines.find(
      (m) => m.name.toLowerCase() === newMedicineName.toLowerCase() && m.userId === userId
    ) || null;
  }

  mergeProfiles(
    existing: DiseaseProfile,
    newData: Partial<DiseaseProfile>
  ): DiseaseProfile {
    return {
      ...existing,
      ...newData,
      medicationHistory: existing.medicationHistory
        ? `${existing.medicationHistory}, ${newData.medicationHistory || ''}`
        : newData.medicationHistory || existing.medicationHistory,
      updatedAt: new Date().toISOString(),
    };
  }

  updateMedicineStock(
    existing: Medicine,
    additionalQuantity: number
  ): Medicine {
    return {
      ...existing,
      stockCount: existing.stockCount + additionalQuantity,
    };
  }

  private generateTimesOfDay(frequency: ParsedMedication['frequency']): string[] {
    if (frequency.specificTimes) {
      return frequency.specificTimes;
    }

    if (frequency.timesPerDay) {
      // Generate default times based on frequency
      const times: string[] = [];
      const hoursPerDose = 24 / frequency.timesPerDay;

      for (let i = 0; i < frequency.timesPerDay; i++) {
        const hour = Math.floor(8 + (i * hoursPerDose)); // Start at 8 AM
        times.push(`${hour.toString().padStart(2, '0')}:00`);
      }

      return times;
    }

    // Default to once daily at 8 AM
    return ['08:00'];
  }

  private getDefaultColorTag(index: number): Medicine['colorTag'] {
    const colors: Medicine['colorTag'][] = [
      'blue',
      'green',
      'purple',
      'orange',
      'pink',
      'teal',
      'red',
      'yellow',
    ];
    return colors[index % colors.length];
  }

  async generateGuidelinesForProfiles(
    profiles: DiseaseProfile[]
  ): Promise<Map<string, { guidelines: any[]; precautions: any[] }>> {
    const guidelinesMap = new Map();

    for (const profile of profiles) {
      const guidelines = guidelineGenerator.generateGuidelines(profile);
      const precautions = guidelineGenerator.generatePrecautions(profile);

      guidelinesMap.set(profile.id, { guidelines, precautions });
    }

    return guidelinesMap;
  }
}

export const profileCreator = new ProfileCreator();
