# Teacher portal UX review

Date: 12 September 2026  
Branch: `feat/teacher-portal-ux-polish`

The review used the running portal in Brave through the Chrome extension, plus
an isolated copy connected to synthetic data. The live teacher had one class,
two students and no submissions or reviews. Class creation, edits and review
publishing were exercised against the isolated API, without changing live
student records.

## Improvements implemented

- Fixed light mode on devices that prefer dark mode. Both theme classes are now
  set explicitly; the saved preference applies before the first paint, persists
  after reload and synchronizes between the header, Settings and browser tabs.
- Improved light-theme text and border contrast and dark-theme badges and icons.
- Removed navigation redirects from sidebar, class cards, module cards and
  dashboard shortcuts while retaining old routes for existing bookmarks.
- Made class totals open the related section or filtered submissions. Added a
  working processing shortcut covering conversion, submission and judging.
- Preserved class context when opening dashboard submissions and reviews.
- Preserved originating submission/review filters in detail-page back links,
  including submission search text and verdict selection.
- Made rapid filter changes use the latest URL without a page navigation.
  Added visible verdict labels and readable evaluation-status labels.
- Shared teacher profile state across protected pages to avoid repeated client
  profile requests. Server-side session validation still runs for protected routes.
- Kept class selectors independent of review-count requests. If review counts
  fail, class management remains available with an explanatory notice.
- Added visible keyboard focus, a skip link, dialog close buttons, initial form
  focus, reduced-motion support, and mobile sidebar visibility/accessibility fixes.
- Kept review-publish success feedback visible after the saved data loads.
- Regenerated both lockfiles, removed analytics entries and pinned pnpm tooling.

## Browser verification

| Area | Checks performed |
| --- | --- |
| Theme | Reproduced the original light-mode failure; verified explicit light, dark, reload persistence and Settings/header synchronization |
| Navigation | Sidebar, class cards, student profile, class return links, module-to-problem navigation, problem submission history |
| Class management | Required-field validation, Cancel/Escape, create, rename, deactivate, settings save and success notices; writes used synthetic data |
| Class sections | Students tab, keyboard tab selection, statistic-to-tab link, Settings form |
| Submissions | Processing shortcut, requested/reviewed filtering, search and verdict controls, fast combined filters, problem/class/module URL context, detail opening and filtered back link |
| Reviews | Start review, publish after starting, direct publish, saved feedback, read-only completed state, review history and persistent success notice; synthetic data |
| Files | Flowchart image loaded at its expected dimensions; authenticated PDF visibly rendered in the embedded viewer; download links were present |
| Settings/menus | Theme selector, mobile account navigation, account menu, notification menu, Escape dismissal, logout |
| Public pages/auth | Login error, password show/hide, remember-me control, successful login, logout, landing-page feature anchor and protected-page redirect after logout |
| Mobile | 390 × 844 viewport: review cards, filter layout, settings, navigation drawer and menus; no horizontal page overflow in the inspected Settings view |

The browser download-event observer timed out, so successful file saving to disk
was not confirmed. Preview rendering and authenticated binary responses were
verified separately. Native PDF viewer controls are browser-provided.

## Automated verification

- `npm test`: passed.
- `node tests/teacher-api.test.cjs`: 42 passed, 0 failed.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- Clean temporary pnpm install with `--frozen-lockfile --ignore-scripts`: passed.
- Production build and all 42 tests using that clean pnpm installation: passed.
- `npm ci --dry-run --ignore-scripts --offline`: passed against the npm lockfile.
- `git diff --check`: passed.

Regression coverage includes explicit light mode over a dark system preference,
blocked preference storage, processing stages across cursor pages, class loading
during review API failure, paginated pending counts, safe filtered back links and
rapid successive filter changes.

## Remaining validation and later improvements

- Repeat submission/review mutation and download tests against a populated
  staging account. Synthetic checks validate frontend behavior, not production
  authorization, storage, or concurrent reviewer conflicts.
- With a large production dataset, replace loading all cursor pages at once with
  incremental pagination and extend backend filtering for grouped processing
  statuses. This needs contract/performance work beyond the current UI fixes.
- Profile/password editing and module assignment need backend capabilities;
  the portal continues to explain how to request these changes from an administrator.
- The browser reported a hydration warning involving Grammarly-added body
  attributes. The app builds successfully; extension-free browser testing would
  separate that warning from application behavior.
