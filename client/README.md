# CampusSphere

CampusSphere is a campus-club and events discovery frontend with separate public and workspace experiences. The visual system uses a Harvard Crimson accent, editorial typography, responsive layouts, and reduced-motion-aware GSAP interactions.

## Run locally

Start the demo API in one terminal:

```powershell
cd server
npm install
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd client
npm install
npm run dev
```

The frontend uses `http://localhost:5001/api` by default. To use another API origin, set `VITE_API_URL` before starting Vite, for example:

```powershell
$env:VITE_API_URL = "http://localhost:5001/api"
npm run dev
```

Useful frontend commands:

```powershell
npm run build
npm run lint
npm run preview
```

## Routes

### Public

- `/` — campus landing page
- `/clubs` — club directory
- `/clubs/:clubId` — club details
- `/events` — event listings
- `/login` — sign-in information and development preview entry

### Workspace

- `/app` — role-specific workspace overview
- `/app/clubs` — club information
- `/app/events` — event listings and student registration

Workspace routes require a session. Legacy role URLs redirect to `/app`.

## Demo and production limitations

The role-based entry points on `/login` are development previews, not authentication. Preview session state is stored in `sessionStorage`; preview controls are omitted from production builds. The demo API serves sample data from in-memory arrays and does not connect to PostgreSQL, authenticate users, or enforce production authorization. Its data and duplicate-registration guard reset when the server restarts.

Student event registration and the admin attendance CSV export use the currently available demo API endpoints. Committee/faculty approval workflows and other actions without API support are intentionally not presented as working features. Production deployment requires a campus identity provider, server-side authorization, durable database-backed endpoints, and the corresponding workflow APIs.
