import Tesseract, { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: TextBlock[];
}

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });
      this.isInitialized = true;
      console.log('OCR worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      this.isInitialized = false;
      this.worker = null;
      throw new Error('OCR service initialization failed. Please refresh the page and try again.');
    }
  }

  async extractText(file: File): Promise<OCRResult> {
    try {
      // Validate file
      if (!this.isValidFile(file)) {
        throw new Error('Invalid file type or size. Please upload an image (JPEG, PNG, WebP) or PDF under 10MB.');
      }

      // Initialize worker if needed
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Handle PDF files
      if (file.type === 'application/pdf') {
        return await this.extractTextFromPDF(file);
      }

      // Handle image files
      return await this.extractTextFromImage(file);
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to extract text from document. Please try a clearer image.');
    }
  }

  private async extractTextFromImage(file: File): Promise<OCRResult> {
    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    // Preprocess image for better OCR accuracy
    const preprocessedBlob = await this.preprocessImage(file);
    
    // Perform OCR
    const result = await this.worker.recognize(preprocessedBlob);
    
    // Extract blocks with confidence
    const blocks: TextBlock[] = result.data.blocks.map(block => ({
      text: block.text,
      confidence: block.confidence / 100,
      bbox: {
        x0: block.bbox.x0,
        y0: block.bbox.y0,
        x1: block.bbox.x1,
        y1: block.bbox.y1,
      },
    }));

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
      blocks,
    };
  }

  private async extractTextFromPDF(file: File): Promise<OCRResult> {
    try {
      // Try method 1: Extract text directly from PDF (faster, works for text-based PDFs)
      try {
        const textResult = await this.extractTextDirectlyFromPDF(file);
        if (textResult.text && textResult.text.trim().length > 50) {
          console.log('Successfully extracted text directly from PDF');
          return textResult;
        }
      } catch (directError) {
        console.log('Direct text extraction failed, falling back to OCR:', directError);
      }

      // Method 2: Render PDF to image and OCR (works for scanned PDFs)
      return await this.extractTextFromPDFViaOCR(file);
    } catch (error) {
      console.error('PDF processing failed:', error);
      throw new Error('Failed to process PDF. Please try uploading as an image.');
    }
  }

  private async extractTextDirectlyFromPDF(file: File): Promise<OCRResult> {
    // Set worker source to local file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    if (pdfDocument.numPages === 0) {
      throw new Error('PDF has no pages');
    }

    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= Math.min(pdfDocument.numPages, 5); pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    // Create a simple OCRResult from extracted text
    return {
      text: fullText,
      confidence: 0.95, // High confidence for direct text extraction
      blocks: [{
        text: fullText,
        confidence: 0.95,
        bbox: { x0: 0, y0: 0, x1: 100, y1: 100 }
      }]
    };
  }

  private async extractTextFromPDFViaOCR(file: File): Promise<OCRResult> {
    // Set worker source to local file
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf-worker/pdf.worker.min.mjs';

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;
    
    if (pdfDocument.numPages === 0) {
      throw new Error('PDF has no pages');
    }

    // Get first page
    const page = await pdfDocument.getPage(1);
    
    // Set scale for better quality
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };
    
    await page.render(renderContext).promise;
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert PDF to image'));
      }, 'image/png');
    });

    // OCR the rendered image
    const imageFile = new File([blob], 'pdf-page.png', { type: 'image/png' });
    return await this.extractTextFromImage(imageFile);
  }

  private async preprocessImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        // Limit image size for performance
        const maxDimension = 2000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Enhance contrast for better OCR
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Simple contrast enhancement
        const factor = 1.2;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * factor);     // Red
          data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
          data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to preprocess image'));
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private isValidFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  getConfidenceScore(result: OCRResult): number {
    return result.confidence;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

export const ocrService = new OCRService();
