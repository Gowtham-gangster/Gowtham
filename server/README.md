MedMinder - Local API Proxy (server)
===================================

This small Express server provides proxy endpoints that the frontend calls
to integrate with third-party APIs (Amazon PA-API, Truepill, FDB, Twilio,
etc.). It is intentionally minimal and shows where vendor integrations
should be implemented server-side with secrets stored in environment variables.

Getting started
---------------

1. Copy `.env.example` to `.env` and fill in any provider credentials you have.
2. Install dependencies inside `server/`:

```powershell
cd server
npm install
npm run dev
```

3. Start the frontend dev server in `med-minder-pro`:

```powershell
cd ..
npm run dev
```

Notes
-----
- The Amazon PA-API integration is not fully implemented in this scaffold (PA-API requires signed requests and a registered account). You should integrate using an official SDK or a library once you have credentials.
- Truepill/FuzeRx/FDB/Surescripts and Twilio require commercial access and BAAs for PHI handling; implement those calls on the server and never expose credentials on the frontend.
