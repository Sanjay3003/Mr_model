# ModelReach demo

ModelReach is a client-ready SaaS demonstration with a Next.js frontend and a Python FastAPI backend. All submissions and integrations are explicitly simulated; no agency application or Meta action is sent externally.

## Run locally

Start the API:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Start the frontend in another terminal:

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. API documentation is available at `http://localhost:8000/docs`.

## Realistic demo workflows

### Public agency sourcing

Open **Sources** to import organisation records from OpenStreetMap or Wikidata, or paste a CSV with `name,location,website,email` columns. Every record is staged in a verification queue. Approving it adds the agency to Discover with its original source URL; rejecting it keeps it out of the directory.

OpenStreetMap data requires the visible attribution `© OpenStreetMap contributors` and is used under ODbL. Public-source import is for business records, not personal social profiles.

### Owned-channel opportunities

Open **Opportunities** and submit the enquiry form. It creates a persistent SQLite record and can be advanced through:

## Guided tour and automation

First-time visitors see a five-step tour from profile setup through opportunity follow-up. It can be replayed from **Guided tour** in the sidebar.

The **Automation** workspace keeps manual input intentionally small: name, location, height, weight, chest, waist, hips, and shoe size. Agency discovery, match scoring, application preparation, follow-up scheduling, and response organization are demonstrated as automated stages. External applications and messages retain a final human approval gate and remain simulated in this demo.

## Contextual assistant and voice

The floating **ModelReach Assistant** changes its suggested commands with the active page. Commands can open agency matches, applications, opportunities, sources, profile essentials, and privacy settings. The assistant uses local page context and keeps consequential external actions behind an approval gate.

Voice input is opt-in and starts only when the microphone button is pressed. ModelReach does not store the audio recording. Browser speech-recognition availability and processing depend on the browser being used.

The fictional Alex Morgan profile includes a consistent generated headshot, full-body agency digital, and three-quarter profile image under `public/model/`.

```text
New → Reviewing → Qualified → Contacted → Casting → Won
```

This demonstrates the real website-form-to-inbox flow without sending messages or using third-party credentials.

### Key API routes

- `POST /api/imports/overpass`
- `POST /api/imports/wikidata`
- `POST /api/imports/csv`
- `GET /api/imports/candidates`
- `POST /api/imports/candidates/{id}/approve`
- `POST /api/imports/candidates/{id}/reject`
- `POST /api/public/enquiries`
- `GET /api/opportunities`
- `PATCH /api/opportunities/{id}`

## Free demo infrastructure

- Database: SQLite (included, no account required)
- API: FastAPI/Uvicorn (open source)
- Frontend: Next.js (open source)
- Hosting options: Vercel free tier for the frontend and Render/Railway free or trial tier for the Python API; hosted SQLite should be replaced by a free Postgres tier for multi-instance deployment.

## Optional production integrations

- Meta Graph API: free to call, but requires a Meta developer app, OAuth, correct permissions, a public HTTPS webhook, and possibly app review/business verification.
- Transactional email: Resend has a small free tier; production sending requires a verified domain.
- SMS/WhatsApp: Twilio/Meta conversation charges apply after trial/free allowances.
- Production database: Supabase or Neon both offer free Postgres tiers suitable for a demo.

The current demo requires **no paid API keys**. Keep real credentials in environment variables and never commit them.
