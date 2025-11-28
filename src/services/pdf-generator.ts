import jsPDF from 'jspdf';
import { DiseaseProfile, Guideline, Precaution } from '@/types/chronic-disease';
import { format } from 'date-fns';

export class PDFGenerator {
  async generatePrescriptionPDF(
    profile: DiseaseProfile,
    guidelines: Guideline[],
    precautions: Precaution[]
  ): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold = false, color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 3;
    };

    // Helper function to add section header
    const addSectionHeader = (title: string) => {
      yPosition += 5;
      doc.setFillColor(59, 130, 246); // Primary blue color
      doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;
    };

    // Header
    doc.setFillColor(15, 23, 42); // Dark background
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MedReminder', margin, 20);
    doc.setFontSize(14);
    doc.text('Chronic Disease Management Plan', margin, 30);
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Timestamp
    const timestamp = format(new Date(), 'MMMM dd, yyyy - hh:mm a');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${timestamp}`, pageWidth - margin - 60, 20);
    doc.setTextColor(0, 0, 0);

    // Patient Information Section
    addSectionHeader('PATIENT INFORMATION');
    addText(`Condition: ${profile.diseaseName}`, 11, true);
    addText(`Age: ${profile.personalInfo.age} years`, 10);
    if (profile.personalInfo.gender) {
      addText(`Gender: ${profile.personalInfo.gender.charAt(0).toUpperCase() + profile.personalInfo.gender.slice(1)}`, 10);
    }
    addText(`Profile Created: ${format(new Date(profile.createdAt), 'MMMM dd, yyyy')}`, 10);
    addText(`Last Updated: ${format(new Date(profile.updatedAt), 'MMMM dd, yyyy')}`, 10);

    // Symptoms Section
    if (profile.symptoms.length > 0) {
      addSectionHeader('REPORTED SYMPTOMS');
      profile.symptoms.forEach((symptom, index) => {
        addText(`${index + 1}. ${symptom}`, 10);
      });
    }

    // Lifestyle Factors Section
    addSectionHeader('LIFESTYLE FACTORS');
    addText(`Diet Quality: ${profile.lifestyle.diet.charAt(0).toUpperCase() + profile.lifestyle.diet.slice(1)}`, 10);
    addText(`Exercise Frequency: ${profile.lifestyle.exerciseFrequency.charAt(0).toUpperCase() + profile.lifestyle.exerciseFrequency.slice(1)}`, 10);
    addText(`Smoking Status: ${profile.lifestyle.smokingStatus.charAt(0).toUpperCase() + profile.lifestyle.smokingStatus.slice(1)}`, 10);
    addText(`Alcohol Consumption: ${profile.lifestyle.alcoholConsumption.charAt(0).toUpperCase() + profile.lifestyle.alcoholConsumption.slice(1)}`, 10);

    // Medication History Section
    if (profile.medicationHistory && profile.medicationHistory.length >= 10) {
      addSectionHeader('MEDICATION HISTORY');
      addText(profile.medicationHistory, 10);
    }

    // Precautions Section
    if (precautions.length > 0) {
      addSectionHeader('IMPORTANT PRECAUTIONS');
      precautions.forEach((precaution, index) => {
        const color: [number, number, number] = 
          precaution.type === 'danger' ? [220, 38, 38] : 
          precaution.type === 'warning' ? [234, 88, 12] : 
          [59, 130, 246];
        
        addText(`${index + 1}. ${precaution.title}`, 11, true, color);
        addText(precaution.description, 10);
        
        if (precaution.relatedMedications && precaution.relatedMedications.length > 0) {
          addText(`   Related Medications: ${precaution.relatedMedications.join(', ')}`, 9, false, [100, 100, 100]);
        }
        yPosition += 2;
      });
    }

    // Guidelines Section
    addSectionHeader('PERSONALIZED GUIDELINES');
    
    // Group guidelines by category
    const groupedGuidelines = guidelines.reduce((acc, guideline) => {
      if (!acc[guideline.category]) {
        acc[guideline.category] = [];
      }
      acc[guideline.category].push(guideline);
      return acc;
    }, {} as Record<string, Guideline[]>);

    const categoryLabels: Record<string, string> = {
      diet: 'Dietary Recommendations',
      exercise: 'Physical Activity',
      medication: 'Medication Management',
      monitoring: 'Health Monitoring',
      lifestyle: 'Lifestyle Modifications',
    };

    Object.entries(groupedGuidelines).forEach(([category, categoryGuidelines]) => {
      yPosition += 3;
      addText(categoryLabels[category] || category, 11, true, [59, 130, 246]);
      
      categoryGuidelines.forEach((guideline, index) => {
        const priorityColor: [number, number, number] = 
          guideline.priority === 'high' ? [220, 38, 38] : 
          guideline.priority === 'medium' ? [234, 88, 12] : 
          [59, 130, 246];
        
        addText(`${index + 1}. ${guideline.title} [${guideline.priority.toUpperCase()}]`, 10, true, priorityColor);
        addText(guideline.description, 10);
        yPosition += 2;
      });
    });

    // Footer/Disclaimer
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }
    
    yPosition = pageHeight - 40;
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, contentWidth, 30, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const disclaimer = 'DISCLAIMER: This document is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals before making any changes to your treatment plan. This prescription was generated by MedReminder based on user-provided information.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 4);
    let disclaimerY = yPosition + 5;
    disclaimerLines.forEach((line: string) => {
      doc.text(line, margin + 2, disclaimerY);
      disclaimerY += 3;
    });

    // Convert to Blob
    const pdfBlob = doc.output('blob');
    return pdfBlob;
  }

  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  generateFilename(diseaseName: string): string {
    const date = format(new Date(), 'yyyy-MM-dd');
    const cleanDiseaseName = diseaseName.replace(/\s+/g, '_');
    return `Prescription_${cleanDiseaseName}_${date}.pdf`;
  }
}

export const pdfGenerator = new PDFGenerator();
