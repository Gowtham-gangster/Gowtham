import { diseaseKeywords } from '@/data/disease-keywords';
import { getDiseaseById } from '@/data/chronic-diseases';

export interface DetectedDisease {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  matchedTerms: string[];
  context: string;
  source: 'explicit' | 'medication' | 'combined';
  relatedMedications: string[];
}

class DiseaseDetector {
  detectDiseases(text: string): DetectedDisease[] {
    const normalizedText = this.normalizeText(text);
    const detectedDiseases: DetectedDisease[] = [];

    // Check each disease
    for (const [diseaseId, keywords] of Object.entries(diseaseKeywords)) {
      const detection = this.detectDisease(diseaseId, keywords, normalizedText, text);
      if (detection) {
        detectedDiseases.push(detection);
      }
    }

    // Sort by confidence (highest first)
    return detectedDiseases.sort((a, b) => b.confidence - a.confidence);
  }

  private detectDisease(
    diseaseId: string,
    keywords: typeof diseaseKeywords[string],
    normalizedText: string,
    originalText: string
  ): DetectedDisease | null {
    const matchedTerms: string[] = [];
    let totalMatches = 0;
    let contextSnippets: string[] = [];

    // Check keywords
    for (const keyword of keywords.keywords) {
      const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        matchedTerms.push(keyword);
        totalMatches += matches.length;
        contextSnippets.push(...this.extractContext(originalText, keyword));
      }
    }

    // Check abbreviations
    for (const abbr of keywords.abbreviations) {
      const regex = new RegExp(`\\b${this.escapeRegex(abbr)}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        matchedTerms.push(abbr.toUpperCase());
        totalMatches += matches.length * 1.2; // Abbreviations get slight boost
        contextSnippets.push(...this.extractContext(originalText, abbr));
      }
    }

    // Check related terms
    for (const term of keywords.relatedTerms) {
      const regex = new RegExp(`\\b${this.escapeRegex(term)}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        matchedTerms.push(term);
        totalMatches += matches.length * 0.8; // Related terms get lower weight
        contextSnippets.push(...this.extractContext(originalText, term));
      }
    }

    // If no matches, return null
    if (matchedTerms.length === 0) {
      return null;
    }

    // Calculate confidence
    const confidence = this.calculateConfidence(totalMatches, matchedTerms.length, contextSnippets);

    // Get disease name
    const disease = getDiseaseById(diseaseId);
    const diseaseName = disease?.name || diseaseId;

    return {
      diseaseId,
      diseaseName,
      confidence,
      matchedTerms: [...new Set(matchedTerms)], // Remove duplicates
      context: contextSnippets.slice(0, 3).join(' ... '), // Top 3 contexts
      source: 'explicit',
      relatedMedications: [],
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private extractContext(text: string, term: string, contextLength: number = 50): string[] {
    const regex = new RegExp(`(.{0,${contextLength}})${this.escapeRegex(term)}(.{0,${contextLength}})`, 'gi');
    const matches = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push(match[0].trim());
      if (matches.length >= 3) break; // Limit to 3 contexts
    }

    return matches;
  }

  private calculateConfidence(totalMatches: number, uniqueTerms: number, contexts: string[]): number {
    // Base confidence from matches
    let confidence = Math.min(0.5 + (totalMatches * 0.1), 0.9);

    // Boost for multiple unique terms
    if (uniqueTerms > 1) {
      confidence += 0.1;
    }

    // Boost for strong context (medical terminology nearby)
    const medicalTerms = ['diagnosis', 'prescribed', 'treatment', 'condition', 'patient', 'history'];
    const hasStrongContext = contexts.some(context =>
      medicalTerms.some(term => context.toLowerCase().includes(term))
    );

    if (hasStrongContext) {
      confidence += 0.1;
    }

    // Ensure confidence is between 0 and 1
    return Math.min(Math.max(confidence, 0), 1);
  }

  calculateCombinedConfidence(
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
}

export const diseaseDetector = new DiseaseDetector();
