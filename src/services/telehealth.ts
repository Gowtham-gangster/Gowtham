/*
  telehealth.ts
  Client-side wrapper that talks to server-side telehealth endpoints.

  IMPORTANT: For HIPAA compliance and to keep API keys/secrets safe, all
  Truepill/FuzeRx/Livestorm/Jitsi integrations must be performed through
  a server-side proxy. The frontend should call these `/api/telehealth/*`
  endpoints. The server will call the vendor APIs and return minimal info
  (room id, join URL, status). Do NOT embed any private keys in the frontend.
*/

export type ConsultRequest = {
  patientId: string;
  providerId?: string;
  scheduledAt?: string; // ISO datetime
  reason?: string;
  telehealthType?: 'video' | 'phone';
};

export type ConsultRoom = {
  roomId: string;
  joinUrl: string;
  providerJoinUrl?: string;
  status: 'scheduled' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
};

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api/telehealth/${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function scheduleConsult(req: ConsultRequest): Promise<ConsultRoom> {
  return apiFetch('schedule', { method: 'POST', body: JSON.stringify(req) });
}

export async function createInstantRoom(req: { patientId: string; providerId?: string }): Promise<ConsultRoom> {
  return apiFetch('instant', { method: 'POST', body: JSON.stringify(req) });
}

export async function getConsultStatus(roomId: string): Promise<ConsultRoom> {
  return apiFetch(`status/${encodeURIComponent(roomId)}`);
}

export default { scheduleConsult, createInstantRoom, getConsultStatus };
