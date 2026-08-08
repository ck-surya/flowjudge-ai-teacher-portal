# flowjudge-ai-teacher-portal

This is a Next.js based teacher web feature prototype for FlowJudge.

## Demo mode (backend not ready)

The app is now wired to a local mock service in:
- `lib/teacherDemoService.ts`

It exposes demo implementations for:
- Authentication/session mock (`getTeacher`)
- Class CRUD (`listClasses`, `getClass`, `createClass`, `updateClass`)
- Modules/Problems/Submissions/Reviews/Students read and basic write operations
- Rejudge + review save actions

## Route expectation for demo
The documented teacher routes are available as `/teacher/...` aliases:
- `/teacher`
- `/teacher/classes`
- `/teacher/classes/{classId}`
- `/teacher/classes/{classId}/modules/{moduleId}`
- `/teacher/submissions`
- `/teacher/submissions/{submissionId}`
- `/teacher/reviews`
- `/teacher/reviews/{reviewId}`

Those aliases redirect to the existing implementation pages so you can walk through
flows without a backend.

## How to show the demo now
1. Run `pnpm install` (or `npm install`)
2. Run `pnpm dev`
3. Open `http://localhost:3000/teacher`
4. Walk through:
   - Dashboard cards and class list
   - Class details, modules, and problems
   - Submission list and submission review page
   - Review queue

Note: since backend contracts are not available in this environment, all responses are in-memory and reset on server restart. The UI remains fully interactive for demos.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
