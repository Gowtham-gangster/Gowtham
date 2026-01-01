import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { generateId, parseFrequencyToSchedule } from '@/services/api';
import { ocrService } from '@/services/ocr-service';
import { medicationParser } from '@/services/medication-parser';
import { sectionBasedParser } from '@/services/section-based-parser';
import { Button } from '@/components/ui/button';
import { ButtonEnhanced } from '@/components/ui/button-enhanced';
import { InputEnhanced } from '@/components/ui/input-enhanced';
import { CardEnhanced } from '@/components/ui/card-enhanced';
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
  Sparkles,
  AlertCircle,
  Clock
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
  const [step, setStep] = useState<'upload' | 'review' | 'schedule'>('upload');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

  const validateReviewStep = (): boolean => {
    const errors: string[] = [];
    const confirmedMedicines = parsedMedicines.filter(m => m.confirmed);

    if (confirmedMedicines.length === 0) {
      errors.push('Please confirm at least one medicine');
    }

    confirmedMedicines.forEach((med, index) => {
      if (!med.name.trim()) {
        errors.push(`Medicine ${index + 1}: Name is required`);
      }
      if (!med.strength.trim()) {
        errors.push(`Medicine ${index + 1}: Strength is required`);
      }
      if (!med.frequency.trim()) {
        errors.push(`Medicine ${index + 1}: Frequency is required`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinueToSchedule = () => {
    if (validateReviewStep()) {
      setStep('schedule');
    } else {
      toast.error('Please fix the validation errors before continuing');
    }
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
          onClick={() => {
            if (step === 'schedule') setStep('review');
            else if (step === 'review') setStep('upload');
            else navigate('/prescriptions');
          }}
          className="gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>

        {/* Multi-step Progress Indicator */}
        <CardEnhanced variant="glass" padding="md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className={cn(
                'flex items-center gap-2 mb-2',
                step === 'upload' && 'text-violet-400'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 'upload' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400'
                )}>
                  1
                </div>
                <span className={cn('text-sm font-medium', elderlyMode && 'text-base')}>
                  Upload
                </span>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gray-700 mx-2">
              <div className={cn(
                'h-full bg-violet-600 transition-all duration-300',
                (step === 'review' || step === 'schedule') ? 'w-full' : 'w-0'
              )} />
            </div>
            <div className="flex-1">
              <div className={cn(
                'flex items-center gap-2 mb-2',
                step === 'review' && 'text-violet-400'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 'review' ? 'bg-violet-600 text-white' : 
                  step === 'schedule' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                )}>
                  {step === 'schedule' ? <Check size={16} /> : '2'}
                </div>
                <span className={cn('text-sm font-medium', elderlyMode && 'text-base')}>
                  Review
                </span>
              </div>
            </div>
            <div className="flex-1 h-0.5 bg-gray-700 mx-2">
              <div className={cn(
                'h-full bg-violet-600 transition-all duration-300',
                step === 'schedule' ? 'w-full' : 'w-0'
              )} />
            </div>
            <div className="flex-1">
              <div className={cn(
                'flex items-center gap-2 mb-2',
                step === 'schedule' && 'text-violet-400'
              )}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold',
                  step === 'schedule' ? 'bg-violet-600 text-white' : 'bg-gray-700 text-gray-400'
                )}>
                  3
                </div>
                <span className={cn('text-sm font-medium', elderlyMode && 'text-base')}>
                  Schedule
                </span>
              </div>
            </div>
          </div>
        </CardEnhanced>

        <div>
          <h1 className={cn('text-2xl font-bold', elderlyMode && 'text-3xl')}>
            {step === 'upload' ? 'Upload Prescription' : 
             step === 'review' ? 'Review Extracted Medicines' : 
             'Set Dosage Schedule'}
          </h1>
          <p className={cn('text-muted-foreground', elderlyMode && 'text-lg')}>
            {step === 'upload'
              ? 'Upload a photo or PDF of your prescription to extract medication information'
              : step === 'review'
              ? 'Verify the extracted information and confirm the medicines to add'
              : 'Configure when and how often to take each medication'
            }
          </p>
        </div>

        {/* Validation Summary */}
        {validationErrors.length > 0 && (
          <CardEnhanced variant="bordered" padding="md" className="border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-500 mb-2">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-400">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardEnhanced>
        )}

        {step === 'upload' && (
          <CardEnhanced variant="glass" padding="lg">
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
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-violet-500', 'bg-violet-500/10');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-violet-500', 'bg-violet-500/10');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-violet-500', 'bg-violet-500/10');
                    const droppedFile = e.dataTransfer.files?.[0];
                    if (droppedFile) {
                      setFile(droppedFile);
                      if (droppedFile.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setPreview(e.target?.result as string);
                        };
                        reader.readAsDataURL(droppedFile);
                      }
                    }
                  }}
                  className={cn(
                    'border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer',
                    'hover:border-primary hover:bg-primary/5 transition-all duration-200',
                    'focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20'
                  )}
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-magenta-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <Upload size={40} className="text-white" />
                  </div>
                  <h3 className={cn('font-semibold text-lg mb-2', elderlyMode && 'text-xl')}>
                    Drag & Drop or Click to Upload
                  </h3>
                  <p className={cn('text-muted-foreground mb-4', elderlyMode && 'text-base')}>
                    Upload a clear photo or PDF of your prescription
                  </p>
                  <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
                      <Image size={16} className="text-violet-400" /> 
                      <span>JPG, PNG</span>
                    </span>
                    <span className="flex items-center gap-2 bg-background-secondary px-3 py-2 rounded-lg">
                      <FileText size={16} className="text-violet-400" /> 
                      <span>PDF</span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    Tip: Ensure good lighting and all text is clearly visible
                  </p>
                </div>

                {/* Mobile Camera Button */}
                <div className="md:hidden">
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'xl' : 'lg'}
                    fullWidth
                    leftIcon={<Camera size={20} />}
                    onClick={() => document.getElementById('camera-capture')?.click()}
                  >
                    Take Photo with Camera
                  </ButtonEnhanced>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {preview && (
                  <div className="relative rounded-lg overflow-hidden border-2 border-violet-600/30 shadow-glow">
                    <img
                      src={preview}
                      alt="Prescription preview"
                      className="w-full max-h-64 object-contain bg-muted"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-violet-600/20 flex items-center justify-center">
                      <FileText size={24} className="text-violet-400" />
                    </div>
                    <div>
                      <p className={cn('font-medium', elderlyMode && 'text-lg')}>{file.name}</p>
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
                  <ButtonEnhanced
                    variant="primary"
                    size={elderlyMode ? 'xl' : 'lg'}
                    fullWidth
                    leftIcon={<Sparkles size={20} />}
                    onClick={handleUpload}
                  >
                    Scan Prescription with AI
                  </ButtonEnhanced>
                )}
              </div>
            )}
          </CardEnhanced>
        )}

        {step === 'review' && (
          <div className="space-y-4">
            {/* Section Summaries */}
            {sectionSummaries.length > 0 && (
              <CardEnhanced variant="bordered" padding="md" className="border-primary/20">
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
              </CardEnhanced>
            )}

            {/* Extracted Text Preview */}
            {extractedText && (
              <CardEnhanced variant="bordered" padding="md" className="border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-primary" />
                  <h3 className={cn('font-semibold', elderlyMode && 'text-lg')}>Full Extracted Text</h3>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className={cn('text-sm text-muted-foreground whitespace-pre-wrap', elderlyMode && 'text-base')}>
                    {extractedText}
                  </p>
                </div>
              </CardEnhanced>
            )}

            <div className="flex justify-between items-center">
              <h2 className={cn('text-lg font-semibold', elderlyMode && 'text-xl')}>Extracted Medicines</h2>
              <ButtonEnhanced
                variant="outline"
                size={elderlyMode ? 'lg' : 'md'}
                leftIcon={<Plus size={18} />}
                onClick={() => setParsedMedicines(prev => [...prev, { name: '', strength: '', frequency: '', confirmed: true }])}
              >
                Add Medicine
              </ButtonEnhanced>
            </div>
            
            {parsedMedicines.map((medicine, index) => (
              <CardEnhanced
                key={index}
                variant="glass"
                padding="md"
                className={cn(
                  'transition-all',
                  medicine.confirmed && 'ring-2 ring-success shadow-glow'
                )}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={medicine.confirmed}
                    onCheckedChange={() => toggleMedicineConfirmed(index)}
                    className="mt-1"
                  />

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-magenta-600 flex items-center justify-center shadow-glow">
                        <Pill size={20} className="text-white" />
                      </div>
                      <InputEnhanced
                        value={medicine.name}
                        onChange={(e) => updateParsedMedicine(index, 'name', e.target.value)}
                        placeholder="e.g., Aspirin, Metformin, Lisinopril"
                        className={cn('font-semibold', elderlyMode && 'text-lg h-12')}
                        label="Medicine Name"
                        required
                        error={!medicine.name.trim() && medicine.confirmed ? 'Name is required' : undefined}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputEnhanced
                        value={medicine.strength}
                        onChange={(e) => updateParsedMedicine(index, 'strength', e.target.value)}
                        placeholder="e.g., 100mg, 500mg, 10mg"
                        label="Strength/Dosage"
                        helperText="Include unit (mg, ml, etc.)"
                        required
                        error={!medicine.strength.trim() && medicine.confirmed ? 'Strength is required' : undefined}
                      />
                      <InputEnhanced
                        value={medicine.frequency}
                        onChange={(e) => updateParsedMedicine(index, 'frequency', e.target.value)}
                        placeholder="e.g., 2 times daily, Every 8 hours"
                        label="Frequency"
                        helperText="How often to take"
                        required
                        error={!medicine.frequency.trim() && medicine.confirmed ? 'Frequency is required' : undefined}
                      />
                    </div>

                    <InputEnhanced
                      value={medicine.instructions || ''}
                      onChange={(e) => updateParsedMedicine(index, 'instructions', e.target.value)}
                      placeholder="e.g., Take with food, Take on empty stomach, Avoid alcohol"
                      label="Special Instructions (Optional)"
                      helperText="Any special directions from your doctor"
                    />
                  </div>
                </div>
              </CardEnhanced>
            ))}

            <div className="flex gap-3 pt-4">
              <ButtonEnhanced
                variant="outline"
                size={elderlyMode ? 'xl' : 'lg'}
                fullWidth
                onClick={() => setStep('upload')}
              >
                Scan Again
              </ButtonEnhanced>
              <ButtonEnhanced
                variant="primary"
                size={elderlyMode ? 'xl' : 'lg'}
                fullWidth
                leftIcon={<Check size={20} />}
                onClick={handleContinueToSchedule}
              >
                Continue ({parsedMedicines.filter(m => m.confirmed).length} Medicine{parsedMedicines.filter(m => m.confirmed).length !== 1 ? 's' : ''})
              </ButtonEnhanced>
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="space-y-4">
            <CardEnhanced variant="glass" padding="md">
              <h2 className={cn('text-lg font-semibold mb-4', elderlyMode && 'text-xl')}>
                Set Dosage Times
              </h2>
              <p className="text-muted-foreground mb-6">
                Choose when you want to take your medications each day
              </p>

              {/* Visual Time Picker Presets */}
              <div className="space-y-4">
                <Label className={cn('text-base font-medium', elderlyMode && 'text-lg')}>
                  Quick Presets
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    leftIcon={<Clock size={18} />}
                    onClick={() => {
                      toast.success('Morning time preset applied (8:00 AM)');
                    }}
                  >
                    <div className="text-center">
                      <div>Morning</div>
                      <div className="text-xs text-muted-foreground">8:00 AM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    leftIcon={<Clock size={18} />}
                    onClick={() => {
                      toast.success('Afternoon time preset applied (2:00 PM)');
                    }}
                  >
                    <div className="text-center">
                      <div>Afternoon</div>
                      <div className="text-xs text-muted-foreground">2:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    leftIcon={<Clock size={18} />}
                    onClick={() => {
                      toast.success('Evening time preset applied (6:00 PM)');
                    }}
                  >
                    <div className="text-center">
                      <div>Evening</div>
                      <div className="text-xs text-muted-foreground">6:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    leftIcon={<Clock size={18} />}
                    onClick={() => {
                      toast.success('Bedtime preset applied (10:00 PM)');
                    }}
                  >
                    <div className="text-center">
                      <div>Bedtime</div>
                      <div className="text-xs text-muted-foreground">10:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                </div>
              </div>

              <div className="my-6 border-t border-gray-700" />

              <div className="space-y-4">
                <Label className={cn('text-base font-medium', elderlyMode && 'text-lg')}>
                  Common Schedules
                </Label>
                <div className="grid gap-3">
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    onClick={() => {
                      toast.success('Once daily schedule applied');
                    }}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Once Daily</div>
                      <div className="text-xs text-muted-foreground">8:00 AM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    onClick={() => {
                      toast.success('Twice daily schedule applied');
                    }}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Twice Daily</div>
                      <div className="text-xs text-muted-foreground">8:00 AM, 8:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    onClick={() => {
                      toast.success('Three times daily schedule applied');
                    }}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Three Times Daily</div>
                      <div className="text-xs text-muted-foreground">8:00 AM, 2:00 PM, 8:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                  <ButtonEnhanced
                    variant="outline"
                    size={elderlyMode ? 'lg' : 'md'}
                    fullWidth
                    onClick={() => {
                      toast.success('Four times daily schedule applied');
                    }}
                    className="justify-start"
                  >
                    <div className="text-left">
                      <div className="font-semibold">Four Times Daily</div>
                      <div className="text-xs text-muted-foreground">8:00 AM, 12:00 PM, 4:00 PM, 8:00 PM</div>
                    </div>
                  </ButtonEnhanced>
                </div>
              </div>
            </CardEnhanced>

            <div className="flex gap-3 pt-4">
              <ButtonEnhanced
                variant="outline"
                size={elderlyMode ? 'xl' : 'lg'}
                fullWidth
                onClick={() => setStep('review')}
              >
                Back to Review
              </ButtonEnhanced>
              <ButtonEnhanced
                variant="primary"
                size={elderlyMode ? 'xl' : 'lg'}
                fullWidth
                leftIcon={<Check size={20} />}
                onClick={handleSave}
              >
                Save All Medicines
              </ButtonEnhanced>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PrescriptionUpload;
