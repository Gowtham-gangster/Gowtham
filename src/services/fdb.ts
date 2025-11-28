/*
  fdb.ts
  Minimal client helper to request clinical checks (CDS) from server-side FDB integration.

  NOTE: FDB MedKnowledge is a licensed product. The frontend cannot call FDB
  directly; the server must host the FDB integration and expose limited
  endpoints like `/api/fdb/check` that accept minimal inputs and return
  structured CDS results. Below we call those endpoints.
*/

export type CDSResult = {
  ok: boolean;
  issues: Array<{ code: string; severity: 'low'|'moderate'|'high'; summary: string }>;
  matchedProduct?: { id?: string; name?: string; rxcui?: string };
};

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api/fdb/${path}`, {
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

export async function checkMedication(payload: { medication: string; patientId?: string }) : Promise<CDSResult> {
  return apiFetch('check', { method: 'POST', body: JSON.stringify(payload) });
}

export default { checkMedication };
