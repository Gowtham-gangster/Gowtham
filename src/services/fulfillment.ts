/*
  fulfillment.ts
  Frontend-facing helpers for pharmacy fulfillment flows.

  This file intentionally calls server-side endpoints under `/api/fulfillment/*`.
  The server should implement calls to Truepill and FuzeRx (with secrets stored
  in environment variables) and must handle PHI securely.
*/

export type PatientCreate = {
  name: string;
  dob?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
};

export type PrescriptionPayload = {
  patientId: string;
  prescriberId?: string;
  medication: string;
  strength?: string;
  directions?: string;
  quantity?: number;
  refills?: number;
};

export type OrderRequest = {
  patientId: string;
  prescriptionId?: string;
  items: Array<{ sku?: string; name: string; quantity: number }>;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  paymentToken?: string; // frontend should use a PCI partner (Stripe Checkout, etc.)
};

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api/fulfillment/${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

export async function createPatient(payload: PatientCreate) {
  return apiFetch('patients', { method: 'POST', body: JSON.stringify(payload) });
}

export async function submitPrescription(payload: PrescriptionPayload) {
  return apiFetch('prescriptions', { method: 'POST', body: JSON.stringify(payload) });
}

export async function createOrder(payload: OrderRequest) {
  return apiFetch('orders', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getOrderStatus(orderId: string) {
  return apiFetch(`orders/${encodeURIComponent(orderId)}`);
}

export default { createPatient, submitPrescription, createOrder, getOrderStatus };
