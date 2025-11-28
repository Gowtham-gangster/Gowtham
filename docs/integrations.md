# Integrations & Security Notes

This document describes recommended integration patterns for telehealth, e-prescribing, clinical decision support (CDS), and fulfillment in the application.

Important: Do NOT embed vendor API keys or PHI-handling logic in the frontend. Implement server-side proxies that hold credentials, perform authentication, and log/audit requests.

Recommended server endpoints (examples):

- `/api/telehealth/schedule` (POST): create a scheduled consult with a telehealth partner (Truepill consult, Livestream provider, or partner EHR). Returns `{ roomId, joinUrl, providerJoinUrl, status }`.
- `/api/telehealth/instant` (POST): create an instant meeting room and return embed URL.
- `/api/telehealth/status/:roomId` (GET): get status for a room.

- `/api/fulfillment/patients` (POST): create or update patient record in Truepill/FuzeRx.
- `/api/fulfillment/prescriptions` (POST): submit a prescription to the fulfillment backend.
- `/api/fulfillment/orders` (POST): create an order (payment should be processed with a PCI partner like Stripe; pass token to server).
- `/api/fulfillment/orders/:orderId` (GET): fetch order status and tracking.

- `/api/fdb/check` (POST): pass minimal medication/patient context to your FDB integration and return CDS results (DDIs, DAIs, dosage alerts).

Public data sources used by the frontend (no secret required):

- RxNorm / RxNav: medication name lookups and RxCUI identifiers. Endpoint used: `https://rxnav.nlm.nih.gov/REST/drugs.json?name=...`.

Security & Compliance:

- Use HTTPS everywhere.
- Store secrets (API keys, client secrets, etc.) only on the server using environment variables.
- Sign a BAA with any third-party vendor handling PHI (Truepill, Twilio, etc.).
- Restrict access to APIs and implement per-request audit logging.

References:

- Truepill docs: https://docs.truepill.com/
- FuzeRx: https://rx.fuzehealth.com/
- FDB MedKnowledge: https://www.fdbhealth.com/
- RxNav (RxNorm API): https://rxnav.nlm.nih.gov/
- Surescripts overview: https://surescripts.com/what-we-do/e-prescribing
