require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

// Simple store search endpoint. Tries Amazon PA-API if configured, otherwise falls back to RxNav name search for medication info.
app.post('/api/store/search', async (req, res) => {
  const { query } = req.body || {};
  if (!query || query.trim().length < 2) return res.status(400).json({ error: 'Query too short' });

  // If Amazon credentials provided, attempt to call an implementation there.
  if (process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY && process.env.AMAZON_ASSOC_TAG) {
    // NOTE: Implementing full PA-API v5 signing is outside the scope here.
    // Placeholder to show where you'd call Amazon Product Advertising API.
    return res.status(501).json({ error: 'Amazon PA-API integration not implemented in this scaffold. Provide your own implementation or use a library.' });
  }

  // Fallback: search RxNav for medication names (not a retailer catalog, but authoritative Rx info)
  try {
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`;
    const r = await fetch(url);
    const data = await r.json();
    return res.json({ source: 'rxnav', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

// Telehealth scheduling endpoints (server should call Truepill or telehealth provider if configured)
app.post('/api/telehealth/schedule', async (req, res) => {
  const payload = req.body;
  // real implementation: call Truepill Consult API or partner EHR
  if (!process.env.TRUEPILL_API_KEY) {
    return res.status(501).json({ error: 'Telehealth provider not configured on server (TRUEPILL_API_KEY missing).' });
  }
  // Example response shape
  return res.json({ roomId: `tp-${Date.now()}`, joinUrl: 'https://example-telehealth/join/123', providerJoinUrl: null, status: 'scheduled', payload });
});

app.post('/api/telehealth/instant', async (req, res) => {
  if (!process.env.TRUEPILL_API_KEY) {
    // create a basic Jitsi room URL as fallback
    const room = `medroom-${Math.random().toString(36).slice(2,8)}`;
    return res.json({ roomId: room, joinUrl: `https://meet.jit.si/${encodeURIComponent(room)}`, status: 'ready' });
  }
  // Otherwise server should call provider to create instant room
  return res.json({ error: 'Instant provider integration not implemented.' });
});

// Fulfillment endpoints - proxy to Truepill/FuzeRx
app.post('/api/fulfillment/orders', async (req, res) => {
  if (!process.env.TRUEPILL_API_KEY) return res.status(501).json({ error: 'Fulfillment provider not configured' });
  // Production: call Truepill orders endpoint here.
  return res.json({ orderId: `order_${Date.now()}`, status: 'placed' });
});

// Integrations test endpoints
app.post('/api/integrations/fulfillment/test', async (req, res) => {
  // server would attempt to call the provider with stored credentials
  if (!process.env.TRUEPILL_API_KEY) return res.status(500).json({ ok: false, message: 'Truepill not configured' });
  return res.json({ ok: true, provider: 'truepill' });
});

app.post('/api/integrations/fdb/test', async (req, res) => {
  if (!process.env.FDB_API_KEY) return res.status(500).json({ ok: false, message: 'FDB not configured' });
  return res.json({ ok: true });
});

app.post('/api/integrations/eprescribe/test', async (req, res) => {
  // Surescripts access is restricted; server must have integration
  return res.status(501).json({ ok: false, message: 'E-Prescribe provider integration requires Surescripts account and server-side implementation.' });
});

app.post('/api/integrations/notifications/test', async (req, res) => {
  if (!process.env.TWILIO_ACCOUNT_SID) return res.status(500).json({ ok: false, message: 'Twilio not configured' });
  return res.json({ ok: true });
});

app.listen(PORT, () => console.log(`API proxy server listening on ${PORT}`));
