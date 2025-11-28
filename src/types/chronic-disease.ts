export type DiseaseCategory = 
  | 'cardiovascular' 
  | 'respiratory' 
  | 'metabolic' 
  | 'neurological' 
  | 'musculoskeletal' 
  | 'endocrine' 
  | 'renal' 
  | 'other';

export interface ChronicDisease {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  category: DiseaseCategory;
  commonSymptoms: string[];
  riskFactors: string[];
}

export interface DiseaseProfile {
  id: string;
  userId: string;
  diseaseId: string;
  diseaseName: string;
  personalInfo: {
    age: number;
    gender?: 'male' | 'female' | 'other';
  };
  symptoms: string[];
  lifestyle: {
    diet: 'poor' | 'average' | 'good' | 'excellent';
    exerciseFrequency: 'none' | 'rarely' | 'weekly' | 'daily';
    smokingStatus: 'never' | 'former' | 'current';
    alcoholConsumption: 'none' | 'occasional' | 'moderate' | 'heavy';
  };
  medicationHistory: string;
  createdAt: string;
  updatedAt: string;
}

export type GuidelineCategory = 'diet' | 'exercise' | 'medication' | 'monitoring' | 'lifestyle';
export type GuidelinePriority = 'high' | 'medium' | 'low';

export interface Guideline {
  id: string;
  category: GuidelineCategory;
  title: string;
  description: string;
  priority: GuidelinePriority;
  icon: string;
}

export type PrecautionType = 'warning' | 'danger' | 'info';

export interface Precaution {
  id: string;
  type: PrecautionType;
  title: string;
  description: string;
  relatedMedications?: string[];
}
