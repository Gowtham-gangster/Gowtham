import { ParsedMedication, medicationParser } from './medication-parser';

interface SectionContent {
  precautions: string;
  guidelines: string;
  medications: string;
  general: string;
}

class SectionBasedParser {
  /**
   * Extract medications specifically from PRECAUTIONS and GUIDELINES sections
   */
  extractFromSections(text: string): ParsedMedication[] {
    const sections = this.identifySections(text);
    const allMedications: ParsedMedication[] = [];
    const seenMedications = new Set<string>();

    // Priority 1: Extract from PRECAUTIONS section
    if (sections.precautions) {
      const precautionMeds = this.extractMedicationsFromText(sections.precautions, 'precautions');
      precautionMeds.forEach(med => {
        const key = med.name.toLowerCase();
        if (!seenMedications.has(key)) {
          seenMedications.add(key);
          allMedications.push(med);
        }
      });
    }

    // Priority 2: Extract from GUIDELINES section
    if (sections.guidelines) {
      const guidelineMeds = this.extractMedicationsFromText(sections.guidelines, 'guidelines');
      guidelineMeds.forEach(med => {
        const key = med.name.toLowerCase();
        if (!seenMedications.has(key)) {
          seenMedications.add(key);
          allMedications.push(med);
        }
      });
    }

    // Priority 3: Extract from MEDICATIONS section
    if (sections.medications) {
      const medicationMeds = this.extractMedicationsFromText(sections.medications, 'medications');
      medicationMeds.forEach(med => {
        const key = med.name.toLowerCase();
        if (!seenMedications.has(key)) {
          seenMedications.add(key);
          allMedications.push(med);
        }
      });
    }

    // Priority 4: Extract from general text (fallback)
    if (allMedications.length === 0 && sections.general) {
      const generalMeds = this.extractMedicationsFromText(sections.general, 'general');
      generalMeds.forEach(med => {
        const key = med.name.toLowerCase();
        if (!seenMedications.has(key)) {
          seenMedications.add(key);
          allMedications.push(med);
        }
      });
    }

    return allMedications;
  }

  /**
   * Identify and extract different sections from the prescription text
   */
  private identifySections(text: string): SectionContent {
    const sections: SectionContent = {
      precautions: '',
      guidelines: '',
      medications: '',
      general: ''
    };

    // Normalize text
    const normalizedText = text.replace(/\r\n/g, '\n');
    const lines = normalizedText.split('\n');

    let currentSection: keyof SectionContent | null = null;
    let sectionContent: string[] = [];

    // Section header patterns
    const sectionPatterns = {
      precautions: /^(precautions?|warnings?|cautions?|important\s+information|safety\s+information|contraindications?)[\s:]*$/i,
      guidelines: /^(guidelines?|instructions?|directions?|how\s+to\s+use|usage|administration|dosage\s+and\s+administration)[\s:]*$/i,
      medications: /^(medications?|medicines?|drugs?|prescriptions?|rx|treatment)[\s:]*$/i
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if this line is a section header
      let foundSection = false;
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line)) {
          // Save previous section
          if (currentSection && sectionContent.length > 0) {
            sections[currentSection] = sectionContent.join('\n');
          }
          
          // Start new section
          currentSection = section as keyof SectionContent;
          sectionContent = [];
          foundSection = true;
          break;
        }
      }

      if (!foundSection && line.length > 0) {
        if (currentSection) {
          sectionContent.push(line);
        } else {
          // Add to general if no section identified yet
          sections.general += line + '\n';
        }
      }
    }

    // Save last section
    if (currentSection && sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join('\n');
    }

    // If no sections were identified, treat all as general
    if (!sections.precautions && !sections.guidelines && !sections.medications) {
      sections.general = text;
    }

    return sections;
  }

  /**
   * Extract medications from a specific text section
   */
  private extractMedicationsFromText(text: string, source: string): ParsedMedication[] {
    // Use the existing medication parser
    const medications = medicationParser.parseMedications(text);

    // Enhance with section-specific context
    return medications.map(med => ({
      ...med,
      instructions: med.instructions 
        ? `${med.instructions} (from ${source})`
        : `From ${source} section`
    }));
  }

  /**
   * Extract medication names mentioned in precautions/guidelines
   * This catches medications that might be mentioned without full details
   */
  extractMedicationNames(text: string): string[] {
    const sections = this.identifySections(text);
    const medicationNames = new Set<string>();

    // Common medication name patterns
    const medicationPattern = /\b([A-Z][a-z]+(?:in|ol|ide|ate|ine|one|pam|zole|mycin|cillin|cycline|floxacin|statin|pril|sartan|dipine))\b/g;

    // Extract from precautions
    if (sections.precautions) {
      const matches = sections.precautions.match(medicationPattern);
      if (matches) {
        matches.forEach(name => medicationNames.add(name));
      }
    }

    // Extract from guidelines
    if (sections.guidelines) {
      const matches = sections.guidelines.match(medicationPattern);
      if (matches) {
        matches.forEach(name => medicationNames.add(name));
      }
    }

    return Array.from(medicationNames);
  }

  /**
   * Get section summaries for display
   */
  getSectionSummaries(text: string): { section: string; content: string; medicationCount: number }[] {
    const sections = this.identifySections(text);
    const summaries: { section: string; content: string; medicationCount: number }[] = [];

    for (const [section, content] of Object.entries(sections)) {
      if (content && content.trim().length > 0) {
        const medications = this.extractMedicationsFromText(content, section);
        summaries.push({
          section: section.charAt(0).toUpperCase() + section.slice(1),
          content: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
          medicationCount: medications.length
        });
      }
    }

    return summaries;
  }
}

export const sectionBasedParser = new SectionBasedParser();
