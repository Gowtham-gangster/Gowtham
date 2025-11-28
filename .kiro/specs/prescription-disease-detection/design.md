# Design Document

## Overview

The Prescription Disease Detection feature extends MedReminder's prescription management capabilities by adding intelligent OCR-based analysis that automatically detects chronic diseases and medications from uploaded prescription documents. The system uses Tesseract.js for text extraction, pattern matching for disease and medication detection, and cross-referencing logic to infer chronic conditions from prescribed medications. The feature integrates seamlessly with existing prescription upload, chronic disease management, and medication tracking modules while maintaining the futuristic dark neon UI theme.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Prescription│  │   Analysis   │  │   Summary    │     │
│  │   Upload     │  │   Progress   │  │     Card     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Business Logic Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     OCR      │  │   Disease    │  │  Medication  │     │
│  │   Service    │  │   Detector   │  │    Parser    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Medication  │  │  Confidence  │  │   Profile    │     │
│  │   Mapper     │  │   Scorer     │  │   Creator    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Zustand    │  │   Disease    │  │  Medication  │     │
│  │    Store     │  │   Database   │  │   Database   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
PrescriptionUpload (Enhanced Page)
├── ExistingPrescriptionList
├── PrescriptionAnalysisSection (NEW)
│   ├── FileUploadZone
│   ├── CameraCapture (mobile)
│   ├── AnalysisProgress
│   └── AnalysisSummaryCard
│       ├── DetectedDiseasesSection
│       ├── DetectedMedicationsSection
│       ├── PrecautionsSection
│       └── ActionButtons
└── AnalysisEditModal (NEW)
    ├── DiseaseEditForm
    └── MedicationEditForm
```

## Components and Interfaces

### 1. Component: PrescriptionAnalysisSection

**Purpose**: Main container for the prescription analysis feature on the Prescriptions page.

**Props**:
```typescript
interface PrescriptionAnalysisSectionProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  elderlyMode: boolean;
}
```

**State**:
- `uploadedFile: File | null`
- `isAnalyzing: boolean`
- `analysisProgress: number`
- `analysisResult: AnalysisResult | null`
- `showSummary: boolean`

**Key Methods**:
- `handleFileUpload(file: File): Promise<void>`
- `handleCameraCapture(blob: Blob): Promise<void>`
- `startAnalysis(): Promise<void>`
- `handleConfirm(): void`
- `handleEdit(): void`

### 2. Component: AnalysisSummaryCard

**Purpose**: Displays detected diseases, medications, and precautions in a futuristic neon-themed card.

**Props**:
```typescript
interface AnalysisSummaryCardProps {
  result: AnalysisResult;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
  elderlyMode: boolean;
}
```

**Features**:
- Glassmorphism card with neon borders
- Confidence badges for detected items
- Color-coded precaution warnings
- Smooth expand/collapse animations
- Responsive layout

### 3. Component: AnalysisEditModal

**Purpose**: Allows users to edit detected diseases and medications before saving.

**Props**:
```typescript
interface AnalysisEditModalProps {
  result: AnalysisResult;
  onSave: (edited: AnalysisResult) => void;
  onCancel: () => void;
  elderlyMode: boolean;
}
```

**Features**:
- Inline editing for all detected items
- Add/remove diseases and medications
- Form validation
- Real-time preview

### 4. Service: OCRService

**Purpose**: Handles text extraction from prescription images and PDFs.

**Interface**:
```typescript
interface OCRService {
  extractText(file: File): Promise<OCRResult>;
  preprocessImage(file: File): Promise<Blob>;
  getConfidenceScore(result: OCRResult): number;
}

interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

interface TextBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}
```

**Implementation**:
- Uses Tesseract.js for OCR
- Preprocesses images for better accuracy (contrast, brightness, rotation)
- Handles both images and PDFs (convert PDF pages to images)
- Returns structured text with confidence scores

### 5. Service: DiseaseDetector

**Purpose**: Identifies chronic disease mentions in prescription text.

**Interface**:
```typescript
interface DiseaseDetector {
  detectDiseases(text: string): DetectedDisease[];
  calculateConfidence(disease: DetectedDisease, context: string): number;
}

interface DetectedDisease {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  matchedTerms: string[];
  context: string;
}
```

**Algorithm**:
1. Tokenize and normalize text (lowercase, remove punctuation)
2. Search for disease keywords and synonyms
3. Check for common abbreviations (DM for diabetes, HTN for hypertension)
4. Analyze surrounding context for confirmation
5. Calculate confidence based on match quality and context
6. Return sorted list by confidence

**Disease Keywords Database**:
```typescript
const diseaseKeywords = {
  diabetes: ['diabetes', 'diabetic', 'dm', 'type 1', 'type 2', 'blood sugar', 'glucose'],
  hypertension: ['hypertension', 'htn', 'high blood pressure', 'bp', 'elevated bp'],
  asthma: ['asthma', 'asthmatic', 'bronchial', 'wheezing'],
  // ... more diseases
};
```

### 6. Service: MedicationParser

**Purpose**: Extracts medication names, dosages, and frequencies from text.

**Interface**:
```typescript
interface MedicationParser {
  parseMedications(text: string): ParsedMedication[];
  extractDosage(text: string): DosageInfo;
  extractFrequency(text: string): FrequencyInfo;
}

interface ParsedMedication {
  name: string;
  strength: string;
  form: MedicineForm;
  dosage: DosageInfo;
  frequency: FrequencyInfo;
  instructions: string;
  confidence: number;
}

interface DosageInfo {
  amount: number;
  unit: string;
}

interface FrequencyInfo {
  type: FrequencyType;
  timesPerDay?: number;
  specificTimes?: string[];
  interval?: number;
  instructions?: string;
}
```

**Parsing Patterns**:
```typescript
const medicationPatterns = {
  name: /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/, // Capitalized words
  strength: /(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|units?)/i,
  frequency: {
    'once daily': { type: 'DAILY', timesPerDay: 1 },
    'twice daily': { type: 'DAILY', timesPerDay: 2 },
    'three times daily': { type: 'DAILY', timesPerDay: 3 },
    'every 8 hours': { type: 'EVERY_X_HOURS', interval: 8 },
    'before meals': { type: 'DAILY', instructions: 'before meals' },
    // ... more patterns
  }
};
```

### 7. Service: MedicationMapper

**Purpose**: Cross-references medications with chronic diseases.

**Interface**:
```typescript
interface MedicationMapper {
  mapMedicationToDiseases(medication: string): DiseaseMapping[];
  getCombinedConfidence(
    explicitDiseases: DetectedDisease[],
    medicationMappings: DiseaseMapping[]
  ): DetectedDisease[];
}

interface DiseaseMapping {
  diseaseId: string;
  diseaseName: string;
  likelihood: number;
  medicationClass: string;
}
```

**Medication-Disease Database**:
```typescript
const medicationDiseaseMap = {
  // Diabetes medications
  metformin: [{ diseaseId: 'diabetes', likelihood: 0.95, class: 'Biguanide' }],
  insulin: [{ diseaseId: 'diabetes', likelihood: 0.98, class: 'Insulin' }],
  glipizide: [{ diseaseId: 'diabetes', likelihood: 0.90, class: 'Sulfonylurea' }],
  
  // Hypertension medications
  lisinopril: [{ diseaseId: 'hypertension', likelihood: 0.90, class: 'ACE Inhibitor' }],
  amlodipine: [{ diseaseId: 'hypertension', likelihood: 0.85, class: 'Calcium Channel Blocker' }],
  
  // Asthma medications
  albuterol: [{ diseaseId: 'asthma', likelihood: 0.95, class: 'Bronchodilator' }],
  fluticasone: [
    { diseaseId: 'asthma', likelihood: 0.80, class: 'Corticosteroid' },
    { diseaseId: 'copd', likelihood: 0.60, class: 'Corticosteroid' }
  ],
  
  // ... more mappings
};
```

### 8. Service: ProfileCreator

**Purpose**: Creates disease profiles and medication schedules from analysis results.

**Interface**:
```typescript
interface ProfileCreator {
  createDiseaseProfiles(
    diseases: DetectedDisease[],
    medications: ParsedMedication[],
    userId: string
  ): DiseaseProfile[];
  
  createMedicineEntries(
    medications: ParsedMedication[],
    userId: string
  ): Medicine[];
  
  createSchedules(
    medicines: Medicine[],
    medications: ParsedMedication[]
  ): Schedule[];
  
  linkPrescriptionToProfiles(
    prescriptionId: string,
    profileIds: string[]
  ): void;
}
```

**Creation Logic**:
1. Check for existing disease profiles and offer merge
2. Create new profiles with detected disease and basic info
3. Mark profiles as "incomplete" for user to fill remaining fields
4. Create medicine entries with all detected details
5. Generate schedules based on frequency information
6. Link prescription document to created profiles
7. Generate guidelines and precautions
8. Return summary of created items

## Data Models

### AnalysisResult

```typescript
interface AnalysisResult {
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

interface OverallConfidence {
  overall: number;
  ocr: number;
  diseaseDetection: number;
  medicationParsing: number;
}
```

### Enhanced Prescription Model

```typescript
interface Prescription {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  parsedMedicines: ParsedMedicine[];
  status: "pending" | "processed" | "error";
  
  // NEW FIELDS
  analysisResult?: AnalysisResult;
  linkedDiseaseProfiles?: string[]; // Profile IDs
  isAnalyzed: boolean;
}
```

### DetectedDisease (Extended)

```typescript
interface DetectedDisease {
  diseaseId: string;
  diseaseName: string;
  confidence: number;
  matchedTerms: string[];
  context: string;
  source: 'explicit' | 'medication' | 'combined';
  relatedMedications: string[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File upload validation

*For any* uploaded file, the system should accept the file if and only if it is an image (JPEG, PNG, WebP) or PDF format and the file size is less than or equal to 10MB.
**Validates: Requirements 1.1**

### Property 2: OCR text extraction

*For any* valid prescription image, the OCR service should return a non-empty text string with a confidence score between 0 and 1.
**Validates: Requirements 1.3**

### Property 3: Disease detection completeness

*For any* prescription text containing disease keywords from the supported list, the disease detector should identify at least one chronic disease.
**Validates: Requirements 1.4**

### Property 4: Medication name extraction

*For any* prescription text containing medication patterns, the medication parser should extract at least the medication name.
**Validates: Requirements 2.1**

### Property 5: Dosage extraction format

*For any* extracted dosage, the format should include a numeric amount and a valid unit (mg, mcg, g, ml, units).
**Validates: Requirements 2.2**

### Property 6: Frequency parsing validity

*For any* parsed frequency, the result should map to one of the valid FrequencyType values (DAILY, WEEKDAYS, CUSTOM_DAYS, EVERY_X_DAYS, EVERY_X_HOURS).
**Validates: Requirements 2.3**

### Property 7: Medication-disease mapping consistency

*For any* medication in the mapping database, all associated diseases should exist in the chronic diseases list.
**Validates: Requirements 3.1**

### Property 8: Confidence score bounds

*For any* detected disease or medication, the confidence score should be a number between 0 and 1 inclusive.
**Validates: Requirements 3.2**

### Property 9: Summary card completeness

*For any* analysis result, the summary card should display all detected diseases, all parsed medications, and all relevant precautions.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 10: Edit preservation

*For any* analysis result, after editing and saving, all user modifications should be reflected in the updated result.
**Validates: Requirements 5.5**

### Property 11: Profile creation atomicity

*For any* confirmed analysis, either all disease profiles and medication entries are created successfully, or none are created (rollback on error).
**Validates: Requirements 6.1, 6.3, 6.4**

### Property 12: Duplicate prevention

*For any* detected disease that matches an existing profile by diseaseId and userId, the system should offer to update rather than create a duplicate.
**Validates: Requirements 9.1**

### Property 13: Medication duplicate check

*For any* detected medication that matches an existing medicine by name and userId, the system should offer to update quantity rather than create a duplicate.
**Validates: Requirements 9.3**

### Property 14: Prescription linkage

*For any* created disease profile from a prescription analysis, the profile should maintain a reference to the source prescription ID.
**Validates: Requirements 9.4**

### Property 15: Guideline generation trigger

*For any* disease profile created from prescription analysis, the system should automatically generate guidelines using the guideline generator service.
**Validates: Requirements 10.1**

### Property 16: Mobile camera availability

*For any* mobile device with camera capabilities, the system should provide a camera capture option in addition to file upload.
**Validates: Requirements 11.1**

### Property 17: Touch target sizing on mobile

*For any* interactive element in the analysis UI on mobile devices, the minimum touch target size should be at least 44px × 44px.
**Validates: Requirements 11.4**

### Property 18: Original file preservation

*For any* analyzed prescription, the original uploaded file should be stored and retrievable from the prescriptions collection.
**Validates: Requirements 12.1**

### Property 19: Analysis badge display

*For any* prescription that has been analyzed, the prescription list should display an "Analyzed" badge with the count of detected diseases.
**Validates: Requirements 12.3**

### Property 20: OCR error handling

*For any* OCR operation that fails or produces low-confidence results (< 0.5), the system should display an appropriate error or warning message.
**Validates: Requirements 8.1, 8.2, 8.3**

## Error Handling

### OCR Errors

**Strategy**: Graceful degradation with user feedback

**Error Scenarios**:
1. **Tesseract Initialization Failure**: Show error "OCR service unavailable. Please try again later."
2. **Image Too Blurry**: Show warning "Image quality is low. Results may be inaccurate. Consider uploading a clearer image."
3. **No Text Detected**: Show message "No text found in image. Please ensure the prescription is clearly visible."
4. **PDF Conversion Failure**: Show error "Unable to process PDF. Please try uploading as an image."

**Implementation**:
```typescript
try {
  const ocrResult = await ocrService.extractText(file);
  if (ocrResult.confidence < 0.5) {
    toast.warning("Low confidence OCR result. Please review carefully.");
  }
} catch (error) {
  console.error("OCR failed:", error);
  toast.error("Unable to extract text from image. Please try again.");
  return null;
}
```

### Detection Errors

**Strategy**: Partial results with user review

**Error Scenarios**:
1. **No Diseases Detected**: Show message "No chronic diseases detected. You can manually select conditions."
2. **No Medications Found**: Show message "No medications detected. Please add them manually."
3. **Ambiguous Medication**: Show multiple options for user selection
4. **Conflicting Information**: Present all possibilities with confidence scores

### Save Errors

**Strategy**: Transaction rollback with clear messaging

**Error Scenarios**:
1. **Profile Creation Failure**: Rollback all changes, show error "Failed to create disease profiles. Please try again."
2. **Medicine Creation Failure**: Rollback, show error "Failed to save medications. Please try again."
3. **Schedule Creation Failure**: Rollback, show error "Failed to create schedules. Please try again."
4. **Partial Save**: If some items save but others fail, show detailed error listing what succeeded and what failed

## Testing Strategy

### Unit Testing

**Framework**: Vitest + React Testing Library

**Test Coverage**:

1. **OCR Service Tests**:
   - Text extraction from various image formats
   - Confidence score calculation
   - Image preprocessing
   - Error handling for invalid files

2. **Disease Detector Tests**:
   - Keyword matching accuracy
   - Confidence calculation
   - Multiple disease detection
   - False positive prevention

3. **Medication Parser Tests**:
   - Name extraction from various formats
   - Dosage parsing with different units
   - Frequency pattern matching
   - Instruction extraction

4. **Medication Mapper Tests**:
   - Correct disease mapping for known medications
   - Likelihood scoring
   - Multiple disease associations
   - Unknown medication handling

5. **Component Tests**:
   - File upload validation
   - Summary card rendering
   - Edit modal functionality
   - Action button behavior

**Example Unit Test**:
```typescript
describe('DiseaseDetector', () => {
  it('should detect diabetes from prescription text', () => {
    const text = "Patient has Type 2 Diabetes. Prescribed Metformin 500mg.";
    const detected = diseaseDetector.detectDiseases(text);
    
    expect(detected).toHaveLength(1);
    expect(detected[0].diseaseId).toBe('diabetes');
    expect(detected[0].confidence).toBeGreaterThan(0.8);
  });
});
```

### Property-Based Testing

**Framework**: fast-check

**Configuration**: Each property test should run a minimum of 100 iterations

**Test Coverage**:

1. **File Validation Property**:
   - Generate random file objects with various sizes and types
   - Verify acceptance criteria

2. **Confidence Score Property**:
   - Generate random detection results
   - Verify all confidence scores are between 0 and 1

3. **Medication Parsing Property**:
   - Generate random prescription text with medication patterns
   - Verify at least medication name is extracted

4. **Duplicate Prevention Property**:
   - Generate random existing profiles and new detections
   - Verify no duplicates are created

**Example Property Test**:
```typescript
import fc from 'fast-check';

describe('Confidence Score Property', () => {
  it('should always return confidence between 0 and 1', () => {
    /**
     * Feature: prescription-disease-detection, Property 8: Confidence score bounds
     */
    fc.assert(
      fc.property(fc.string(), (text) => {
        const diseases = diseaseDetector.detectDiseases(text);
        return diseases.every(d => d.confidence >= 0 && d.confidence <= 1);
      }),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Scope**: End-to-end analysis flow

**Test Scenarios**:

1. **Complete Analysis Flow**:
   - Upload prescription image
   - Wait for OCR completion
   - Verify diseases detected
   - Verify medications parsed
   - Confirm and save
   - Verify profiles created

2. **Edit and Save Flow**:
   - Analyze prescription
   - Edit detected items
   - Save changes
   - Verify updated data

3. **Duplicate Handling Flow**:
   - Create existing profile
   - Analyze prescription with same disease
   - Verify merge option presented
   - Confirm merge
   - Verify profile updated, not duplicated

## Performance Considerations

### Optimization Strategies

1. **OCR Performance**:
   - Preprocess images in Web Worker to avoid blocking UI
   - Use progressive loading for large images
   - Cache OCR results to avoid reprocessing
   - Limit image resolution to 2000px max dimension

2. **Text Processing**:
   - Use efficient string matching algorithms (Boyer-Moore)
   - Memoize disease detection results
   - Batch medication parsing operations
   - Debounce edit operations

3. **UI Responsiveness**:
   - Show progress indicators during OCR
   - Stream results as they become available
   - Use React.memo for summary card components
   - Lazy load edit modal

### Performance Targets

- **OCR Processing**: < 10 seconds for images, < 15 seconds for PDFs
- **Disease Detection**: < 500ms
- **Medication Parsing**: < 1 second
- **Profile Creation**: < 2 seconds
- **UI Render**: < 100ms

## Accessibility

### WCAG 2.1 AA Compliance

**Requirements**:

1. **File Upload**:
   - Keyboard accessible drag-and-drop
   - Screen reader announcements for upload status
   - Clear error messages

2. **Summary Card**:
   - Semantic HTML structure
   - ARIA labels for confidence badges
   - Keyboard navigation through sections
   - Focus management

3. **Edit Modal**:
   - Trap focus within modal
   - Escape key to close
   - Clear form labels
   - Error announcements

**Implementation**:
```typescript
<div
  role="region"
  aria-label="Prescription Analysis Results"
  className="summary-card"
>
  <h2 id="detected-diseases">Detected Chronic Diseases</h2>
  <ul aria-labelledby="detected-diseases">
    {diseases.map(disease => (
      <li key={disease.id}>
        <span>{disease.name}</span>
        <span
          role="status"
          aria-label={`Confidence: ${disease.confidence * 100}%`}
        >
          {disease.confidence * 100}%
        </span>
      </li>
    ))}
  </ul>
</div>
```

## Security Considerations

### Data Privacy

**Measures**:
1. **Client-Side Processing**: OCR and analysis performed entirely in browser
2. **No External API Calls**: All processing uses local libraries
3. **Secure Storage**: Prescription images stored with user authentication
4. **Data Encryption**: Sensitive health data encrypted at rest

### Input Validation

**Measures**:
1. **File Type Validation**: Strict MIME type checking
2. **File Size Limits**: Enforce 10MB maximum
3. **Malicious File Detection**: Scan for executable content
4. **XSS Prevention**: Sanitize all extracted text before display

## Deployment Considerations

### Dependencies

**New Dependencies**:
- `tesseract.js` (^4.0.0) - OCR engine
- `pdf-lib` (^1.17.1) - PDF processing (if not already included)

**Bundle Impact**:
- Tesseract.js: ~2MB (loaded lazily)
- Worker files: ~500KB
- Language data: ~1MB (English only)

### Build Configuration

**Vite Configuration**:
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'prescription-analysis': [
            './src/services/ocr-service.ts',
            './src/services/disease-detector.ts',
            './src/services/medication-parser.ts',
            './src/services/medication-mapper.ts'
          ],
          'tesseract': ['tesseract.js']
        }
      }
    }
  },
  worker: {
    format: 'es'
  }
});
```

### Browser Compatibility

**Requirements**:
- Chrome 90+ (Web Workers, File API)
- Firefox 88+ (Web Workers, File API)
- Safari 14+ (Web Workers, File API)
- Edge 90+ (Web Workers, File API)

**Polyfills**:
- None required for target browsers

### Monitoring

**Metrics to Track**:
1. OCR success rate
2. Average processing time
3. Disease detection accuracy
4. Medication parsing accuracy
5. User confirmation rate (vs. rejection)
6. Edit frequency
7. Error rates by type

**Implementation**:
```typescript
analytics.track('prescription_analyzed', {
  ocrConfidence: result.confidence.ocr,
  diseasesDetected: result.detectedDiseases.length,
  medicationsDetected: result.parsedMedications.length,
  processingTime: endTime - startTime,
  userConfirmed: true
});
```
