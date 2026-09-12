# Teacher API integration notes

Request paths and payloads follow the supplied OpenAPI document. Since its teacher
response schemas are unspecified, response types were checked against the sibling
NestJS service and the live backend.

| API response | Portal mapping |
| --- | --- |
| Dashboard `summary.classCount`, `studentCount`, `moduleAssignmentCount`, `submissionCount` | Summary cards; modules are labeled as assignments |
| `requestedReviewCount` + `inReviewCount` | Pending reviews |
| Class `studentCount`, `moduleCount` / `modules.length` | Class counts |
| Assigned module `displayOrder`, `problemCount` | Module metadata |
| Submission `problem.title`, `problem.module`, `student`, `classroom` | Submission identity and labels |
| Class submission list omits `classroom` | Preserve the class used to make the request |
| Review queue `submission.id`, `submission.studentClass` | Submission link, student and class |
| Submission `review` and review `requestedAt` / `reviewedAt` | Review status and dates |
| `automaticVerdict`: AC, WA, CE, RTE, TLE, MLE | Full verdict labels |
| `failureMessage`, `languageId`, `generatedCode` | Evaluation details |
| Paginated `items` / `nextCursor` | Follow pages before applying local filters |

The same-origin proxy exchanges login credentials for an HttpOnly session cookie.
It forwards authorization from that cookie, query strings, JSON payloads, file
content type and disposition, and 204 logout responses. Failed requests remain
visible instead of becoming empty lists or zero-valued dashboards.

Publishing a requested review first calls `POST /teachers/reviews/:id/start`, then
`PATCH /teachers/reviews/:id` with `{ teacherVerdict, feedback }`. Claim conflicts
stop the operation. The portal never uses a review ID as a submission ID.

The live file endpoint initially serialized a `StreamableFile` into JSON via the
global response envelope interceptor. The sibling backend fix bypasses that
wrapper for streams. The portal rejects JSON as a flowchart download.

Unsupported authoring, rejudge, profile mutation and draft controls were removed;
see README for the complete capability limits and setup instructions.

Protected page routes are guarded in `proxy.ts`. Cookie presence is followed by
a live `/teachers/me` validation before rendering. The API proxy also requires a
cookie, strips the bearer token from login responses, and clears the cookie on
logout or 401. Cross-origin mutation requests are rejected.

## Additional live endpoints verified on 2026-09-12

- `GET /teachers/classes/:classId/modules/:moduleId/problems`: full problem catalog, including inactive and unattempted problems.
- `GET /teachers/problems/:problemId`: description, difficulty, module, active state and submission count.
- `GET /teachers/problems/:problemId/statement`: authenticated PDF bytes. The portal uses this endpoint instead of following external statement metadata URLs.
- `GET /teachers/students/:studentId`: profile, teacher-visible memberships, summary and history.

Review details retain events, reviewer names and timestamps. Dashboard evaluation
counts and class/module/status filters are exposed in the UI. Public redirects
construct a new origin from the incoming host so a local port cannot leak into
ngrok links.
