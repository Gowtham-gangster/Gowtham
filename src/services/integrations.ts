/*
  integrations.ts
  Frontend helpers to test and manage integration connectivity.

  These call server-side test endpoints under `/api/integrations/*`.
  The server should implement the actual vendor checks using stored credentials.
*/

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(`/api/integrations/${path}`, {
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

export async function testFulfillment(body: { provider: string; apiKey?: string; clientId?: string }) {
  return apiFetch('fulfillment/test', { method: 'POST', body: JSON.stringify(body) });
}

export async function testFDB(body: { apiKey?: string }) {
  return apiFetch('fdb/test', { method: 'POST', body: JSON.stringify(body) });
}

export async function testEPrescribe(body: { provider: string; apiKey?: string }) {
  return apiFetch('eprescribe/test', { method: 'POST', body: JSON.stringify(body) });
}

export async function testNotifications(body: { provider: string; apiKey?: string; accountSid?: string }) {
  return apiFetch('notifications/test', { method: 'POST', body: JSON.stringify(body) });
}

export default { testFulfillment, testFDB, testEPrescribe, testNotifications };
