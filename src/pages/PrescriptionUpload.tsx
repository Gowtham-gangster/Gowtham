import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { generateId, parseFrequencyToSchedule } from '@/services/api';
import { ocrService } from '@/services/ocr-service';
import { medicationParser } from '@/services/medication-parser';
import { sectionBasedParser } from '@/services/section-based-parser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  Image,
  Loader2,
  Check,
  ArrowLeft,
  Camera,
  Plus,
  Pill,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { ParsedMedicine, Prescription, Medicine, Schedule } from '@/types';

export const PrescriptionUpload = () => {
  const navigate = useNavigate();
  const { addPrescription, addMedicine, addSchedule, user, elderlyMode } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [sectionSummaries, setSectionSummaries] = useState<{ section: string; content: string; medicationCount: number }[]>([]);
  const [parsedMedicines, setParsedMedicines] = useState<ParsedMedicine[]>([]);
  const [step, setStep] = useState<'upload' | 'review'>('upload');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setParsing(true);
    setScanProgress(0);
    
    try {
      // Stage 1: OCR Text Extraction
      setScanStage('Extracting text from prescription...');
      setScanProgress(20);
      
      const ocrResult = await ocrService.extractText(file);
      setScanProgress(50);

      if (!ocrResult.text || ocrResult.text.trim().length === 0) {
        toast.error('No text found in image. Please try a clearer image.');
        setParsing(false);
        return;
      }

      if (ocrResult.confidence < 0.5) {
        toast.warning('Low confidence scan. Please review the extracted information carefully.');
      }

      setExtractedText(ocrResult.text);
      
      // Stage 2: Identify Sections
      setScanStage('Identifying PRECAUTIONS and GUIDELINES sections...');
      setScanProgress(60);
      
      const summaries = sectionBasedParser.getSectionSummaries(ocrResult.text);
      setSectionSummaries(summaries);
      
      // Stage 3: Parse Medications from Sections
      setScanStage('Extracting medications from sections...');
      setScanProgress(80);
      
      const parsedMeds = sectionBasedParser.extractFromSections(ocrResult.text);
      
      // Convert to ParsedMedicine format
      const medicines: ParsedMedicine[] = parsedMeds.map(med => ({
        name: med.name,
        strength: med.strength,
        frequency: med.frequency.timesPerDay 
          ? `${med.frequency.timesPerDay} times daily`
          : med.frequency.interval
          ? `Every ${med.frequency.interval} hours`
          : 'As directed',
        instructions: med.instructions || undefined,
        confirmed: true
      }));

      setScanProgress(100);
      setScanStage('Scan complete!');
      
      if (medicines.length === 0) {
        toast.warning('No medications detected. You can add them manually.');
        // Add empty medicine for manual entry
        setParsedMedicines([{ name: '', strength: '', frequency: '', confirmed: true }]);
      } else {
        setParsedMedicines(medicines);
        toast.success(`Successfully extracted ${medicines.length} medication(s)!`);
      }
      
      setStep('review');
    } catch (error) {
      console.error('Scan failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan prescription. Please try again.';
      toast.error(errorMessage);
      setScanStage('');
      setScanProgress(0);
    } finally {
      setParsing(false);
    }
  };

  const toggleMedicineConfirmed = (index: number) => {
    setParsedMedicines(prev =>
      prev.map((med, i) =>
        i === index ? { ...med, confirmed: !med.confirmed } : med
      )
    );
  };

  const updateParsedMedicine = (index: number, field: keyof ParsedMedicine, value: string) => {
    setParsedMedicines(prev =>
      prev.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    );
  };

  const handleSave = () => {
    const confirmedMedicines = parsedMedicines.filter(m => m.confirmed);

    if (confirmedMedicines.length === 0) {
      toast.error('Please confirm at least one medicine');
      return;
    }

    // Save the prescription record
    const prescription: Prescription = {
      id: generateId(),
      userId: user?.id || '',
      fileName: file?.name || 'Prescription',
      uploadedAt: new Date().toISOString(),
      parsedMedicines: confirmedMedicines,
      status: 'processed'
    };
    addPrescription(prescription);

    // Create Medicine and Schedule entries
    let addedCount = 0;
    confirmedMedicines.forEach(parsed => {
      const medicineId = generateId();

      // Create Medicine
      const medicine: Medicine = {
        id: medicineId,
        userId: user?.id || '',
        name: parsed.name,
        strength: parsed.strength,
        form: 'tablet', // Default, user can edit later
        colorTag: 'blue', // Default
        stockCount: 30, // Default assumption
        refillThreshold: 5,
        instructions: parsed.instructions,
        createdAt: new Date().toISOString()
      };
      addMedicine(medicine);

      // Create Schedule
      const { type, times } = parseFrequencyToSchedule(parsed.frequency);
      const schedule: Schedule = {
        id: generateId(),
        medicineId: medicineId,
        frequencyType: type,
        timesOfDay: times,
        startDate: new Date().toISOString(),
        dosageAmount: 1,
        dosageUnit: 'tablet'
      };
      addSchedule(schedule);
      addedCount++;
    });

    toast.success(`${addedCount} medicine(s) added to your schedule`);
    navigate('/medicines');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => step === 'review' ? setStep('upload') : navigate('/prescriptions')}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        <div>
          <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
            {step === 'upload' ? 'Upload Prescription' : 'Review Extracted Medicines'}
          </h1>
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            {step === 'upload'
              ? 'Upload a photo or PDF of your prescription'
              : 'Verify the extracted information and confirm the medicines to add'
            }
          </p>
        </div>

        {step === 'upload' && (
          <Card className="shadow-soft">
            <CardContent className="p-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                id="camera-capture"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer',
                      'hover:border-primary hover:bg-primary/5 transition-colors'
                    )}
                  >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload size={32} className="text-primary" />
                    </div>
                    <h3 className={cn('font-semibold text-lg mb-2', elderlyMode && 'text-xl')}>
                      Click to upload
                    </h3>
                    <p className={cn('text-muted-foreground mb-4', elderlyMode && 'text-base')}>
                      or drag and drop your prescription here
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Image size={14} /> JPG, PNG
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} /> PDF
                      </span>
                    </div>
                  </div>

                  {/* Mobile Camera Button */}
                  <div className="md:hidden">
                    <Button
                      variant="outline"
                      className={cn('w-full gap-2', elderlyMode && 'h-14 text-lg')}
                      onClick={() => document.getElementById('camera-capture')?.click()}
                    >
                      <Camera size={20} />
                      Take Photo with Camera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {preview && (
                    <div className="relative rounded-lg overflow-hidden border border-border">
                      <img
                        src={preview}
                        alt="Prescription preview"
                        className="w-full max-h-64 object-contain bg-muted"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={24} className="text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>

                  {parsing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={24} />
                        <div className="flex-1">
                          <p className={cn('font-medium', elderlyMode && 'text-lg')}>{scanStage}</p>
                          <Progress value={scanProgress} className="mt-2" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        {scanProgress}% complete
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleUpload}
                      className={cn('w-full gradient-primary gap-2 shadow-glow', elderlyMode && 'h-14 text-lg')}
                    >
                      <Sparkles size={20} />
                      Scan Prescription with AI
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            {/* Section Summaries */}
            {sectionSummaries.length > 0 && (
              <Card className="shadow-soft border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-primary" />
                    <h3 className={cn('font-semibold', elderlyMode && 'text-lg')}>Identified Sections</h3>
                  </div>
                  <div className="space-y-2">
                    {sectionSummaries.map((summary, index) => (
                      <div key={index} className="bg-muted/30 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn('font-medium text-primary', elderlyMode && 'text-base')}>
                            {summary.section}
                          </span>
                          {summary.medicationCount > 0 && (
                            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                              {summary.medicationCount} medication{summary.medicationCount !== 1 ? 's' : ''} found
                            </span>
                          )}
                        </div>
                        <p className={cn('text-xs text-muted-foreground', elderlyMode && 'text-sm')}>
                          {summary.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Extracted Text Preview */}
            {extractedText && (
              <Card className="shadow-soft border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={18} className="text-primary" />
                    <h3 className={cn('font-semibold', elderlyMode && 'text-lg')}>Full Extracted Text</h3>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className={cn('text-sm text-muted-foreground whitespace-pre-wrap', elderlyMode && 'text-base')}>
                      {extractedText}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between items-center">
              <h2 className={cn('text-lg font-semibold', elderlyMode && 'text-xl')}>Extracted Medicines</h2>
              <Button
                variant="outline"
                onClick={() => setParsedMedicines(prev => [...prev, { name: '', strength: '', frequency: '', confirmed: true }])}
                className={cn(elderlyMode && 'h-12 text-lg')}
              >
                <Plus className="mr-2" /> Add Medicine
              </Button>
            </div>
            {parsedMedicines.map((medicine, index) => (
              <Card
                key={index}
                className={cn(
                  'shadow-soft transition-all',
                  medicine.confirmed && 'ring-2 ring-success'
                )}
              >
                <CardContent className={cn('p-4', elderlyMode && 'p-6')}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={medicine.confirmed}
                      onCheckedChange={() => toggleMedicineConfirmed(index)}
                      className="mt-1"
                    />

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-pill-blue flex items-center justify-center">
                          <Pill size={20} className="text-primary-foreground" />
                        </div>
                        <Input
                          value={medicine.name}
                          onChange={(e) => updateParsedMedicine(index, 'name', e.target.value)}
                          className={cn('font-semibold', elderlyMode && 'text-lg h-12')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">Strength</Label>
                          <Input
                            value={medicine.strength}
                            onChange={(e) => updateParsedMedicine(index, 'strength', e.target.value)}
                            className={cn(elderlyMode && 'h-12')}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Frequency</Label>
                          <Input
                            value={medicine.frequency}
                            onChange={(e) => updateParsedMedicine(index, 'frequency', e.target.value)}
                            className={cn(elderlyMode && 'h-12')}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Instructions</Label>
                        <Input
                          value={medicine.instructions || ''}
                          onChange={(e) => updateParsedMedicine(index, 'instructions', e.target.value)}
                          placeholder="Add special instructions..."
                          className={cn(elderlyMode && 'h-12')}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('upload')}
                className={cn('flex-1', elderlyMode && 'h-14 text-lg')}
              >
                Scan Again
              </Button>
              <Button
                onClick={handleSave}
                className={cn('flex-1 gradient-primary', elderlyMode && 'h-14 text-lg')}
              >
                <Check className="mr-2" size={20} />
                Save {parsedMedicines.filter(m => m.confirmed).length} Medicine(s)
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PrescriptionUpload;
