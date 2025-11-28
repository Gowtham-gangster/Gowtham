import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Upload, Camera, FileText, Loader2 } from 'lucide-react';
import { ocrService } from '@/services/ocr-service';
import { diseaseDetector } from '@/services/disease-detector';
import { medicationParser } from '@/services/medication-parser';
import { medicationMapper } from '@/services/medication-mapper';
import { profileCreator } from '@/services/profile-creator';
import { AnalysisResult } from '@/types/prescription-analysis';
import { toast } from 'sonner';
import { AnalysisSummaryCard } from '@/components/prescription-analysis/AnalysisSummaryCard';
import { AnalysisEditModal } from '@/components/prescription-analysis/AnalysisEditModal';
import { useStore } from '@/store/useStore';

interface PrescriptionAnalysisSectionProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  elderlyMode: boolean;
}

export const PrescriptionAnalysisSection = ({
  onAnalysisComplete,
  elderlyMode,
}: PrescriptionAnalysisSectionProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    await startAnalysis(file);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const startAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowSummary(false);

    try {
      console.log('Starting analysis for file:', file.name);
      
      // Stage 1: OCR
      setAnalysisStage('Extracting text from prescription...');
      setAnalysisProgress(10);
      
      const ocrResult = await ocrService.extractText(file);
      setAnalysisProgress(40);

      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        toast.error('No text found in image. Please try a clearer image.');
        setIsAnalyzing(false);
        return;
      }

      if (ocrResult.confidence < 0.5) {
        toast.warning('Low confidence OCR result. Please review carefully.');
      }

      // Stage 2: Disease Detection
      setAnalysisStage('Detecting chronic diseases...');
      setAnalysisProgress(50);
      
      const detectedDiseases = diseaseDetector.detectDiseases(ocrResult.text);
      setAnalysisProgress(65);

      // Stage 3: Medication Parsing
      setAnalysisStage('Parsing medications...');
      setAnalysisProgress(70);
      
      const parsedMedications = medicationParser.parseMedications(ocrResult.text);
      setAnalysisProgress(85);

      // Stage 4: Cross-reference medications with diseases
      setAnalysisStage('Cross-referencing medications with diseases...');
      const medicationNames = parsedMedications.map(m => m.name);
      const inferredDiseases = medicationMapper.inferDiseasesFromMedications(medicationNames);
      
      // Combine explicit and inferred diseases
      const combinedDiseases = medicationMapper.getCombinedConfidence(
        detectedDiseases,
        inferredDiseases
      );
      setAnalysisProgress(95);

      // Stage 5: Generate precautions (simplified for now)
      setAnalysisStage('Generating precautions...');
      const precautions = generatePrecautions(combinedDiseases, parsedMedications);
      setAnalysisProgress(100);

      // Create analysis result
      const result: AnalysisResult = {
        id: Math.random().toString(36).substring(2, 11),
        prescriptionId: Math.random().toString(36).substring(2, 11),
        uploadedAt: new Date().toISOString(),
        ocrResult,
        detectedDiseases: combinedDiseases,
        parsedMedications,
        precautions,
        confidence: {
          overall: calculateOverallConfidence(ocrResult, combinedDiseases, parsedMedications),
          ocr: ocrResult.confidence,
          diseaseDetection: combinedDiseases.length > 0 
            ? combinedDiseases.reduce((sum, d) => sum + d.confidence, 0) / combinedDiseases.length 
            : 0,
          medicationParsing: parsedMedications.length > 0
            ? parsedMedications.reduce((sum, m) => sum + m.confidence, 0) / parsedMedications.length
            : 0,
        },
        status: 'pending',
      };

      setAnalysisResult(result);
      setShowSummary(true);
      setAnalysisStage('Analysis complete!');
      
      toast.success('Prescription analyzed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      toast.error(errorMessage);
      setAnalysisStage('');
      setAnalysisProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePrecautions = (diseases: any[], medications: any[]) => {
    const precautions = [];

    // Add general precaution
    if (diseases.length > 0) {
      precautions.push({
        id: 'general-precaution',
        type: 'info' as const,
        title: 'Review with Healthcare Provider',
        description: 'This analysis is for informational purposes only. Please review all detected information with your healthcare provider before making any changes to your medication regimen.',
      });
    }

    // Add medication-specific precautions
    if (medications.length > 3) {
      precautions.push({
        id: 'multiple-meds',
        type: 'warning' as const,
        title: 'Multiple Medications Detected',
        description: 'You have multiple medications. Be aware of potential drug interactions and take medications as prescribed.',
      });
    }

    return precautions;
  };

  const calculateOverallConfidence = (ocr: any, diseases: any[], medications: any[]) => {
    const weights = {
      ocr: 0.3,
      diseases: 0.4,
      medications: 0.3,
    };

    const diseaseConf = diseases.length > 0
      ? diseases.reduce((sum, d) => sum + d.confidence, 0) / diseases.length
      : 0;

    const medConf = medications.length > 0
      ? medications.reduce((sum, m) => sum + m.confidence, 0) / medications.length
      : 0;

    return (ocr.confidence * weights.ocr) + (diseaseConf * weights.diseases) + (medConf * weights.medications);
  };

  const handleConfirm = async () => {
    if (!analysisResult) return;

    try {
      setIsAnalyzing(true);
      setAnalysisStage('Creating disease profiles and medications...');

      const {
        user,
        diseaseProfiles: existingProfiles,
        medicines: existingMedicines,
        addDiseaseProfile,
        updateDiseaseProfile,
        addMedicine,
        updateMedicine,
        addSchedule,
        addPrescription,
      } = useStore.getState();

      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Create disease profiles
      const newProfiles = profileCreator.createDiseaseProfiles(
        analysisResult.detectedDiseases,
        analysisResult.parsedMedications,
        user.id,
        user.elderlyMode ? 65 : 35 // Estimate age based on elderly mode
      );

      const createdProfileIds: string[] = [];

      for (const profile of newProfiles) {
        // Check for duplicates
        const existing = profileCreator.checkForDuplicateProfiles(
          profile.diseaseId,
          user.id,
          existingProfiles
        );

        if (existing) {
          // Merge with existing
          const merged = profileCreator.mergeProfiles(existing, profile);
          updateDiseaseProfile(existing.id, merged);
          createdProfileIds.push(existing.id);
          toast.info(`Updated existing profile for ${profile.diseaseName}`);
        } else {
          // Create new
          addDiseaseProfile(profile);
          createdProfileIds.push(profile.id);
          toast.success(`Created profile for ${profile.diseaseName}`);
        }
      }

      // Create medicines
      const newMedicines = profileCreator.createMedicineEntries(
        analysisResult.parsedMedications,
        user.id
      );

      const createdMedicines = [];

      for (let i = 0; i < newMedicines.length; i++) {
        const medicine = newMedicines[i];
        
        // Check for duplicates
        const existing = profileCreator.checkForDuplicateMedicines(
          medicine.name,
          user.id,
          existingMedicines
        );

        if (existing) {
          // Update stock
          const updated = profileCreator.updateMedicineStock(existing, 30);
          updateMedicine(existing.id, updated);
          createdMedicines.push(existing);
          toast.info(`Updated stock for ${medicine.name}`);
        } else {
          // Create new
          addMedicine(medicine);
          createdMedicines.push(medicine);
          toast.success(`Added ${medicine.name}`);
        }
      }

      // Create schedules
      const schedules = profileCreator.createSchedules(
        createdMedicines,
        analysisResult.parsedMedications
      );

      for (const schedule of schedules) {
        addSchedule(schedule);
      }

      // Save prescription with analysis
      addPrescription({
        id: analysisResult.prescriptionId,
        userId: user.id,
        fileName: uploadedFile?.name || 'prescription.jpg',
        uploadedAt: analysisResult.uploadedAt,
        parsedMedicines: analysisResult.parsedMedications.map(m => ({
          name: m.name,
          strength: m.strength,
          frequency: `${m.frequency.timesPerDay || 1} times daily`,
          instructions: m.instructions,
          confirmed: true,
        })),
        status: 'processed',
        analysisResult: analysisResult,
        linkedDiseaseProfiles: createdProfileIds,
        isAnalyzed: true,
      });

      // Complete
      onAnalysisComplete({ ...analysisResult, status: 'confirmed' });
      setShowSummary(false);
      setUploadedFile(null);
      setAnalysisResult(null);

      toast.success(
        `Successfully created ${newProfiles.length} disease profiles and ${newMedicines.length} medications!`
      );
    } catch (error) {
      console.error('Failed to save analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save analysis. Please try again.';
      toast.error(errorMessage);
      setAnalysisStage('');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = (edited: AnalysisResult) => {
    setAnalysisResult(edited);
    setShowEditModal(false);
    toast.success('Changes saved!');
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleCancel = () => {
    setShowSummary(false);
    setUploadedFile(null);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-6">
      {!showSummary && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', elderlyMode && 'text-2xl')}>
              <FileText size={elderlyMode ? 28 : 22} className="text-primary" />
              Analyze Prescription
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isAnalyzing ? (
              <div
                className={cn(
                  'border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center',
                  'hover:border-primary/50 transition-colors cursor-pointer',
                  elderlyMode && 'p-12'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} className="text-primary" />
                </div>
                <h3 className={cn('text-lg font-semibold mb-2', elderlyMode && 'text-xl')}>
                  Upload Prescription Image or PDF
                </h3>
                <p className={cn('text-muted-foreground mb-4', elderlyMode && 'text-lg')}>
                  Drag and drop or click to select a file
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Supports JPEG, PNG, WebP, and PDF (max 10MB)
                </p>
                
                {/* Mobile Camera Button */}
                <div className="flex gap-3 justify-center md:hidden">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => document.getElementById('camera-capture')?.click()}
                  >
                    <Camera size={20} />
                    Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload size={20} />
                    Choose File
                  </Button>
                </div>
                
                <input
                  id="file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  id="camera-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <div className="flex-1">
                    <p className={cn('font-medium', elderlyMode && 'text-lg')}>{analysisStage}</p>
                    <Progress value={analysisProgress} className="mt-2" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {analysisProgress}% complete
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {showSummary && analysisResult && (
        <>
          <AnalysisSummaryCard
            result={analysisResult}
            onConfirm={handleConfirm}
            onEdit={handleEdit}
            onCancel={handleCancel}
            elderlyMode={elderlyMode}
          />
          
          <AnalysisEditModal
            result={analysisResult}
            open={showEditModal}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            elderlyMode={elderlyMode}
          />
        </>
      )}
    </div>
  );
};
