import { medicationDiseaseMap, DiseaseMapping } from '@/data/medication-disease-map';
import { DetectedDisease } from './disease-detector';

class MedicationMapper {
  mapMedicationToDiseases(medicationName: string): DiseaseMapping[] {
    const normalizedName = medicationName.toLowerCase().trim();
    
    // Direct lookup
    if (medicationDiseaseMap[normalizedName]) {
      return medicationDiseaseMap[normalizedName];
    }

    // Fuzzy matching - check if medication name contains any key
    for (const [key, mappings] of Object.entries(medicationDiseaseMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return mappings;
      }
    }

    return [];
  }

  getCombinedConfidence(
    explicitDiseases: DetectedDisease[],
    medicationMappings: DetectedDisease[]
  ): DetectedDisease[] {
    const diseaseMap = new Map<string, DetectedDisease>();

    // Add explicit detections
    for (const disease of explicitDiseases) {
      diseaseMap.set(disease.diseaseId, { ...disease });
    }

    // Merge medication-based detections
    for (const medDisease of medicationMappings) {
      const existing = diseaseMap.get(medDisease.diseaseId);
      
      if (existing) {
        // Combine confidences (weighted average favoring explicit)
        const combinedConfidence = (existing.confidence * 0.7) + (medDisease.confidence * 0.3);
        diseaseMap.set(medDisease.diseaseId, {
          ...existing,
          confidence: Math.min(combinedConfidence, 1),
          source: 'combined',
          relatedMedications: [
            ...existing.relatedMedications,
            ...medDisease.relatedMedications,
          ],
        });
      } else {
        // Add as medication-based detection
        diseaseMap.set(medDisease.diseaseId, {
          ...medDisease,
          source: 'medication',
        });
      }
    }

    // Convert back to array and sort by confidence
    return Array.from(diseaseMap.values()).sort((a, b) => b.confidence - a.confidence);
  }

  inferDiseasesFromMedications(medicationNames: string[]): DetectedDisease[] {
    const diseaseMap = new Map<string, DetectedDisease>();

    for (const medName of medicationNames) {
      const mappings = this.mapMedicationToDiseases(medName);
      
      for (const mapping of mappings) {
        const existing = diseaseMap.get(mapping.diseaseId);
        
        if (existing) {
          // Increase confidence if multiple medications point to same disease
          const newConfidence = Math.min(existing.confidence + 0.1, 1);
          diseaseMap.set(mapping.diseaseId, {
            ...existing,
            confidence: newConfidence,
            relatedMedications: [...existing.relatedMedications, medName],
          });
        } else {
          // Create new detection
          diseaseMap.set(mapping.diseaseId, {
            diseaseId: mapping.diseaseId,
            diseaseName: mapping.diseaseName,
            confidence: mapping.likelihood,
            matchedTerms: [mapping.medicationClass],
            context: `Inferred from medication: ${medName}`,
            source: 'medication',
            relatedMedications: [medName],
          });
        }
      }
    }

    return Array.from(diseaseMap.values()).sort((a, b) => b.confidence - a.confidence);
  }
}

export const medicationMapper = new MedicationMapper();
