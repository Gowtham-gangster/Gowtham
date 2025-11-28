import emailjs from '@emailjs/browser';
import { Notification, User, Prescription, Order } from '@/types';

// Configuration (provided)
const EMAILJS_PUBLIC_KEY = 'lXsR2US8dy_gnOecI';
const EMAILJS_SERVICE_ID = 'service_0u93hyl';
const TEMPLATE_ID_1 = 'template_fmyfges';
const TEMPLATE_ID_2 = 'template_j8whnq5';

// Initialize EmailJS SDK
export function initEmail() {
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  } catch (e) {
    console.warn('EmailJS init warning', e);
  }
}

// Rate limiting to prevent infinite loops
let lastEmailTime = 0;
const EMAIL_COOLDOWN = 2000; // 2 seconds between emails

async function sendEmail(templateId: string, templateParams: Record<string, unknown>) {
  try {
    // Rate limiting check
    const now = Date.now();
    if (now - lastEmailTime < EMAIL_COOLDOWN) {
      console.log('Email rate limited, skipping');
      return null;
    }
    lastEmailTime = now;

    const res = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    return res;
  } catch (err) {
    console.error('EmailJS send error', err);
    // Don't throw - just log and continue
    return null;
  }
}

export async function sendNotificationEmail(notification: Notification, user?: User | null) {
  if (!user || !user.email) return null;

  try {
    // Map notification types to templates
    const templateId = notification.type === 'REFILL_WARNING' ? TEMPLATE_ID_2 : TEMPLATE_ID_1;

    const params = {
      to_name: user.name,
      to_email: user.email,
      notification_type: notification.type,
      message: notification.message,
      medicine_id: notification.medicineId || '',
      created_at: notification.createdAt
    };

    return await sendEmail(templateId, params);
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return null;
  }
}

export async function sendPrescriptionUploadEmail(prescription: Prescription, user?: User | null) {
  if (!user || !user.email) return null;

  try {
    const params = {
      to_name: user.name,
      to_email: user.email,
      prescription_file: prescription.fileName,
      uploaded_at: prescription.uploadedAt,
      prescription_id: prescription.id
    };

    // Use TEMPLATE_ID_2 for prescription notices (configurable)
    return await sendEmail(TEMPLATE_ID_2, params);
  } catch (error) {
    console.error('Failed to send prescription email:', error);
    return null;
  }
}

export async function sendOrderEmail(order: Order, user?: User | null) {
  if (!user || !user.email) return;

  const params = {
    to_name: user.name,
    to_email: user.email,
    order_id: order.id,
    vendor_name: order.vendor.name,
    item_count: order.items.length,
    created_at: order.createdAt,
    delivery_status: order.delivery.status
  };

  return sendEmail(TEMPLATE_ID_1, params);
}

export default {
  initEmail,
  sendNotificationEmail,
  sendPrescriptionUploadEmail,
  sendOrderEmail
};
