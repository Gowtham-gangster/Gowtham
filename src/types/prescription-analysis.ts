import { OCRResult } from '@/services/ocr-service';
import { DetectedDisease } from '@/services/disease-detector';
import { ParsedMedication } from '@/services/medication-parser';
import { Precaution } from '@/types/chronic-disease';

export interface AnalysisResult {
  id: string;
  prescriptionId: string;
  uploadedAt: string;
  ocrResult: OCRResult;
  detectedDiseases: DetectedDisease[];
  parsedMedications: ParsedMedication[];
  precautions: Precaution[];
  confidence: OverallConfidence;
  status: 'pending' | 'reviewed' | 'confirmed' | 'rejected';
}

export interface OverallConfidence {
  overall: number;
  ocr: number;
  diseaseDetection: number;
  medicationParsing: number;
}
