# CampusSphere

CampusSphere is a campus-club and events discovery frontend with separate public and workspace experiences. The visual system uses a Harvard Crimson accent, a consistent locally bundled Manrope variable font, responsive layouts, and reduced-motion-aware GSAP interactions.

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
- `/login` — sign-in information and development preview entry (student, executive, president/OB, mentor, Student Affairs)

### Workspace

- `/app` — role-specific workspace overview
- `/app/clubs` — club information
- `/app/events` — event listings and applications for eligible students and club roles

Workspace routes require a session. Legacy role URLs redirect to `/app`.

## MongoDB setup

The browser calls the Express API; it must never connect directly to MongoDB or contain a database password. The API uses MongoDB when `server/.env` contains a valid `MONGO_URI`. Copy the safe template and fill it with connection details from the database owner:

```powershell
cd server
Copy-Item .env.example .env
```

Set `PORT=5001`, `MONGO_DATABASE=CampusSphereDB`, and `DEMO_MODE=false` in `server/.env`. Replace the example `MONGO_URI` with a fresh Atlas URI; do not leave the angle-bracket placeholders in place. Never commit or share `.env`; the repository ignores it. Atlas Network Access must allow the API host's current IP, and the database user should have read/write access only to the application database. MongoDB transactions used when registering students require a replica set; Atlas provides this.

Start the API from `server` with `npm install` and `npm run dev`. It connects to MongoDB before opening the port; a failed connection is a startup failure rather than a silent fallback. To demo with local sample data without contacting MongoDB, set `DEMO_MODE=true`. Check `/api/health`: `database` is `connected` for MongoDB and `demo` for sample data.

The API reads these collections and field shapes:

- `clubs`: `name`, optional `category`, `description`, `facultyCoordinator`, `members`, and `events`.
- `events`: `title`, `date` (or `eventDate`), `venue`, `capacity`, optional `registeredCount`, `clubName` or a `clubId` referencing a club `_id`, and `status`. Public event listings include documents whose status is `APPROVED` or is absent.
- `clubMembers`: `clubId` referencing a club `_id`, `name` (or `fullName`), and `role`.
- `registrations`: created by the API when students register. A unique `(eventId, regNo)` index prevents duplicate applications.
- Optional dashboard collections: `announcements`, `attendance`, and `fundingRequests`.

The `database/schema.sql` and `database/seed.sql` files are PostgreSQL examples; they are not MongoDB setup scripts. If the database owner has already chosen Supabase/Postgres instead, pause before configuring MongoDB: the server currently does not use Supabase, and supporting Supabase would require a separate API/database implementation. Use one database as the source of truth unless the team deliberately designs synchronization.

## Preview and production limitations

The role-based entry points on `/login` are development previews, not authentication. The workflow preview demonstrates president event requests and approval tracking, mentor and Student Affairs decisions, club creation, executive event-time ID-card photo capture, President-to-mentor capture-count hand-off, mentor-to-Student-Affairs OD review, executive department assignments, event publishing with poster/application attachments, date-filtered event listings, and student applications. The preview does not scan barcodes or identify students from captured cards; that integration depends on the separate scanner app. Preview changes and attachments are held in the current browser session only and are not sent to the server.

MongoDB mode persists and reads public club/event listings and student event registrations. The API does not yet authenticate users or enforce production authorization. Dashboard summaries are not tied to a signed-in profile, and the full role-based approval/attendance workflows remain browser-only previews. Implement real sign-in, profile endpoints, authenticated workflow APIs, server-side role and mentor permissions, and appropriate data validation before production use.
