# FlowJudge Teacher Portal

Next.js teacher portal connected to the FlowJudge teacher API. Requests go through
`/api/backend/teachers/...`; the server reads the HttpOnly session cookie and forwards its bearer token and the
ngrok warning bypass header. The backend URL is configured on the server.

## Run locally

Use Node.js 24 and install dependencies with `npm ci` (or `pnpm install`).

1. Copy `.env.example` to `.env.local` and set `FLOWJUDGE_API_URL` to the backend
   base URL **including `/api`**. The example uses the current ngrok tunnel.
2. Run `npm run dev -- --port 3001`.
3. Open `http://localhost:3001/login` and sign in with your teacher account.

Port 3001 leaves port 3000 available for a local backend. Restart the portal when
changing `.env.local`. Tunnel URLs may change; update the environment variable
when that happens. `.env.local` is ignored by Git.

## Connected features

- Teacher login, profile, session expiration and logout/revocation. Tokens are
  stored in an HttpOnly cookie. “Remember me” makes the cookie persistent;
  otherwise it is a browser-session cookie. Backend token expiry still applies.
  Every protected page validates the session on the server before rendering;
  missing, expired, revoked or invalid sessions redirect to `/login`.
- Dashboard summary, class filters, evaluation totals and recent submissions.
- Class listing, creation, renaming, activation, assigned modules and students.
- Submission history across owned classes, with cursor pagination, search,
  class/verdict filters, generated code, failure messages and authenticated files.
- Review queue with requested, in-progress and completed states. Starting a review
  claims it; publishing sends the verdict and feedback. Completed reviews are read-only.
- Assigned module problem catalogs, problem details and authenticated PDF preview/download.
- Student profiles, all teacher-visible class memberships, submission history and server-provided accuracy.
- Review history, assigned reviewer details, class/module queue filters and live pending-review notifications.

The `/teacher/...` aliases remain available. A review URL resolves its review ID
to the corresponding submission ID before opening the review screen.

## API limits

The live API has no teacher endpoints for module/problem creation, rejudging,
review drafts, profile/password updates or notification preferences. Those operations do not claim to save changes. Assigned modules, problems, PDF statements and module submissions remain accessible. Progress metrics absent from the API are
shown as unavailable; dashboard module totals count assignments, not active modules.

Flowchart downloads require the backend response interceptor to pass NestJS
`StreamableFile` responses through unchanged. A matching fix and regression test
are included in the sibling backend repository on its integration branch. Deploy
or restart that backend with the fix if `/teachers/submissions/:id/file` returns
JSON instead of image/PDF bytes.

## Validation

- `npm run typecheck`
- `npm test` — API contract, session, pagination, review transition and proxy tests
- `npm run build`

The existing `lint` script requires an ESLint dependency/configuration that this
prototype does not currently provide; the checks above run independently of it.

Sessions from older versions stored in local/session storage are no longer used.
Sign in again after upgrading to establish the server-managed cookie session.

## Browser flow

- LAN development origins are derived from this computer's network interfaces so
  Next.js can establish its development connection on the printed Network URL.
- Login has an ordinary POST fallback if JavaScript has not initialized.
- Class dialogs validate names/codes, report API failures, announce successful
  saves, and support Cancel, Escape, and keyboard focus.
- Class tabs support arrow keys and URL fragments such as `#students`, `#modules`
  and `#settings`. Back links return to the corresponding class section.
- Theme changes stay synchronized between the header and Settings and persist
  across reloads. Menus, navigation toggles and filters have accessible labels.
- Submissions, reviews and class lists include explicit refresh actions. Submission
  details can refresh evaluation status and preserve the backend's review rules.

For a public development tunnel, set `FLOWJUDGE_DEV_ORIGINS` to its hostname
(without `https://`). Redirects use the public request origin and do not carry
the local development port onto the tunnel URL.
