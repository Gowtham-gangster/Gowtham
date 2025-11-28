import { Medicine, Schedule, DoseLog, User, Prescription, ParsedMedicine } from '@/types';
import Tesseract from 'tesseract.js';

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Generate invite code
export const generateInviteCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Mock user authentication
export const mockLogin = async (email: string, password: string): Promise<User> => {
  await delay(500);
  
  // Simulate authentication
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  const user: User = {
    id: generateId(),
    name: email.split('@')[0],
    email,
    role: 'PATIENT',
    elderlyMode: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    caregiverInviteCode: generateInviteCode(),
    voiceRemindersEnabled: true,
    notificationsEnabled: true,
    notificationSettings: {
      doseReminders: true,
      missedDoseAlerts: true,
      refillWarnings: true,
      orderNotifications: true,
      emailEnabled: true
    }
  };
  
  return user;
};

export const mockSignup = async (
  name: string, 
  email: string, 
  password: string, 
  role: 'PATIENT' | 'CAREGIVER'
): Promise<User> => {
  await delay(500);
  
  if (!name || !email || !password) {
    throw new Error('All fields are required');
  }
  
  const user: User = {
    id: generateId(),
    name,
    email,
    role,
    elderlyMode: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    caregiverInviteCode: role === 'PATIENT' ? generateInviteCode() : undefined,
    voiceRemindersEnabled: true,
    notificationsEnabled: true,
    notificationSettings: {
      doseReminders: true,
      missedDoseAlerts: true,
      refillWarnings: true,
      orderNotifications: true,
      emailEnabled: true
    }
  };
  
  return user;
};

// Prescription parsing using tesseract.js OCR
export const parsePrescription = async (file: File): Promise<ParsedMedicine[]> => {
  // Read file into data URL
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Preprocess the image in-browser to improve OCR (grayscale + contrast stretch)
  const preprocess = async (src: string) => {
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image();
        i.crossOrigin = 'anonymous';
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = src;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return src;

      // scale large images down to a reasonable size to help OCR speed and stability
      const maxDim = 2000;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const scale = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const v = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = v;
      }

      // find min/max for contrast stretch
      let min = 255, max = 0;
      for (let i = 0; i < data.length; i += 4) {
        const v = data[i];
        if (v < min) min = v;
        if (v > max) max = v;
      }
      const range = max - min || 1;
      for (let i = 0; i < data.length; i += 4) {
        const v = data[i];
        const stretched = ((v - min) * 255) / range;
        data[i] = data[i + 1] = data[i + 2] = stretched;
      }

      ctx.putImageData(imageData, 0, 0);
      return canvas.toDataURL('image/png');
    } catch (e) {
      return src;
    }
  };

  const preprocessedUrl = await preprocess(dataUrl);

  // Run Tesseract with default English model; logger disabled for clean output
  const result = await Tesseract.recognize(preprocessedUrl, 'eng', { logger: null });
  const text = result?.data?.text || '';

  // Split into lines, filter noise
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const parsed: ParsedMedicine[] = [];

  // Patterns
  const dosagePatterns = /(\b(OD|BD|BID|TID|QID|HS|PRN|QHS|Q2H|Q4H|Q6H|Q8H|Q12H|SOS)\b|\b\d{1}-\d{1}-\d{1}\b|\b\d{1}-\d{1}\b|\b\d\/\d\b)/i;
  const strengthRegex = /(\d+(?:\.\d+)?\s?(mg|mcg|g|ml|iu|u|mcg\/ml))/i;
  const durationRegex = /(\d+)\s*(days?|weeks?|months?)/i;

  // Heuristic parsing: try to detect name, strength and frequency across nearby lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^(Dr|Patient|Date|Rx|Signature|Reg|Address|Tel|Phone)/i.test(line)) continue;

    let name = '';
    let strength = '';
    let frequency = '';
    let instructions: string | undefined;

    // If the line contains explicit strength/frequency, try to split tokens
    const sMatch = line.match(strengthRegex)?.[0];
    const fMatch = line.match(dosagePatterns)?.[0];
    const dMatch = line.match(durationRegex)?.[0];

    // Build name by removing detected strength/freq tokens
    const maybeName = line.replace(sMatch || '', '').replace(fMatch || '', '').replace(dMatch || '', '').trim();
    // if remaining is short (like 1-2 letters), fallback to full line or next line
    if (maybeName.length > 2 && /[A-Za-z]/.test(maybeName)) {
      name = maybeName.split(/\s{2,}|\s\d/)[0].trim();
    } else {
      // try next line as name if current is only details
      const next = lines[i + 1];
      if (next && !/\d/.test(next) && next.length > 2) {
        name = next;
        // try to pull details from current line
        strength = sMatch || '';
        frequency = fMatch || '';
        instructions = dMatch ? `For ${dMatch}` : undefined;
        i++; // consumed next line
      } else {
        // fallback: use current line as name
        name = line.split(/\s{2,}/)[0];
      }
    }

    // If we didn't capture strength/frequency yet, look at current and next lines
    if (!strength) strength = sMatch || (lines[i + 1]?.match(strengthRegex)?.[0] || '');
    if (!frequency) frequency = fMatch || (lines[i + 1]?.match(dosagePatterns)?.[0] || '');
    if (!instructions && dMatch) instructions = `For ${dMatch}`;

    // sanitize name
    name = name.replace(/^[-,.:]+|[-,.:]+$/g, '').trim();

    // Only push plausible medicine entries (must contain letters and not be header/footer)
    if (name && /[A-Za-z]/.test(name) && (strength || frequency || instructions)) {
      parsed.push({ name, strength: strength || '', frequency: frequency || '', instructions, confirmed: false });
    }
  }

  // Consolidate by basic dedupe (merge entries with same name)
  const map = new Map<string, ParsedMedicine>();
  for (const p of parsed) {
    const key = p.name.toLowerCase();
    if (!map.has(key)) map.set(key, p);
    else {
      const existing = map.get(key)!;
      existing.strength = existing.strength || p.strength;
      existing.frequency = existing.frequency || p.frequency;
      existing.instructions = existing.instructions || p.instructions;
    }
  }

  const consolidated = Array.from(map.values());
  return consolidated.length > 0 ? consolidated : [];
};

export const parseFrequencyToSchedule = (frequency: string): { type: 'DAILY' | 'WEEKDAYS' | 'CUSTOM_DAYS' | 'EVERY_X_DAYS' | 'EVERY_X_HOURS', times: string[] } => {
  const freq = frequency.toUpperCase();
  
  if (freq.includes('OD') || freq === '1-0-0' || freq === '0-1-0' || freq === '0-0-1') return { type: 'DAILY', times: ['09:00'] };
  if (freq.includes('BD') || freq.includes('BID') || freq === '1-0-1') return { type: 'DAILY', times: ['09:00', '21:00'] };
  if (freq.includes('TID') || freq.includes('TDS') || freq === '1-1-1') return { type: 'DAILY', times: ['09:00', '14:00', '21:00'] };
  if (freq.includes('QID') || freq === '1-1-1-1') return { type: 'DAILY', times: ['09:00', '13:00', '17:00', '21:00'] };
  if (freq.includes('HS') || freq.includes('QHS')) return { type: 'DAILY', times: ['22:00'] };
  if (freq.includes('SOS') || freq.includes('PRN')) return { type: 'DAILY', times: ['09:00'] }; // Default to daily, user can edit
  
  // Default fallback
  return { type: 'DAILY', times: ['09:00'] };
};

// Calculate next dose time based on schedule
export const getNextDoseTime = (schedule: Schedule): Date | null => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Check if schedule is active
  if (schedule.endDate && new Date(schedule.endDate) < now) {
    return null;
  }
  
  if (new Date(schedule.startDate) > now) {
    return new Date(schedule.startDate);
  }
  
  // Find next dose time today
  for (const time of schedule.timesOfDay.sort()) {
    const [hours, minutes] = time.split(':').map(Number);
    const doseTime = new Date(today);
    doseTime.setHours(hours, minutes, 0, 0);
    
    if (doseTime > now) {
      return doseTime;
    }
  }
  
  // Next dose is tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [hours, minutes] = schedule.timesOfDay[0].split(':').map(Number);
  tomorrow.setHours(hours, minutes, 0, 0);
  
  return tomorrow;
};

// Calculate estimated depletion date
export const getEstimatedDepletionDate = (medicine: Medicine, schedule: Schedule): Date | null => {
  if (medicine.stockCount <= 0) return null;
  
  const dosesPerDay = schedule.timesOfDay.length * schedule.dosageAmount;
  const daysLeft = Math.floor(medicine.stockCount / dosesPerDay);
  
  const depletionDate = new Date();
  depletionDate.setDate(depletionDate.getDate() + daysLeft);
  
  return depletionDate;
};

// Get today's scheduled doses
export const getTodaysDoses = (
  medicines: Medicine[],
  schedules: Schedule[],
  doseLogs: DoseLog[]
): { time: string; medicine: Medicine; schedule: Schedule; status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED' }[] => {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const doses: { time: string; medicine: Medicine; schedule: Schedule; status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED' }[] = [];
  
  for (const schedule of schedules) {
    const medicine = medicines.find(m => m.id === schedule.medicineId);
    if (!medicine) continue;
    
    // Check if schedule is active today
    if (new Date(schedule.startDate) > now) continue;
    if (schedule.endDate && new Date(schedule.endDate) < now) continue;
    
    // Check day of week for WEEKDAYS or CUSTOM_DAYS
    const dayOfWeek = now.getDay();
    if (schedule.frequencyType === 'WEEKDAYS' && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
    if (schedule.frequencyType === 'CUSTOM_DAYS' && schedule.daysOfWeek && !schedule.daysOfWeek.includes(dayOfWeek)) continue;
    
    for (const time of schedule.timesOfDay) {
      const scheduledDateTime = `${today}T${time}:00`;
      
      // Check if dose was already logged
      const existingLog = doseLogs.find(
        log => log.medicineId === medicine.id && 
               log.scheduledTime.startsWith(scheduledDateTime.substring(0, 16))
      );
      
      let status: 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED' = 'PENDING';
      if (existingLog) {
        status = existingLog.status;
      } else {
        // Check if dose time has passed
        const [hours, minutes] = time.split(':').map(Number);
        const doseTime = new Date(today);
        doseTime.setHours(hours, minutes, 0, 0);
        
        if (doseTime < now && (now.getTime() - doseTime.getTime()) > 30 * 60 * 1000) {
          status = 'MISSED';
        }
      }
      
      doses.push({ time, medicine, schedule, status });
    }
  }
  
  return doses.sort((a, b) => a.time.localeCompare(b.time));
};

// Adherence calculation
export const calculateAdherence = (doseLogs: DoseLog[], days: number = 7): number => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const recentLogs = doseLogs.filter(log => new Date(log.scheduledTime) >= startDate);
  
  if (recentLogs.length === 0) return 100;
  
  const takenCount = recentLogs.filter(log => log.status === 'TAKEN').length;
  return Math.round((takenCount / recentLogs.length) * 100);
};
