const { test, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// Compile the actual TypeScript modules in memory; no browser or test dependencies required.
const modules = new Map()
function load(relative) {
  const filename = path.resolve(__dirname, '..', relative)
  if (modules.has(filename)) return modules.get(filename).exports
  const mod = new Module(filename, module)
  modules.set(filename, mod)
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = mod.require.bind(mod)
  mod.require = name => name.startsWith('@/') ? load(`${name.slice(2)}.ts`) : name.startsWith('.')
    ? load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${name}.ts`)))
    : originalRequire(name)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename)
  return mod.exports
}
const api = load('lib/api-client.ts')
const service = load('lib/teacherService.ts')
const proxy = load('app/api/backend/[...path]/route.ts')
const routeGuard = load('proxy.ts')
const nativeLogin = load('app/api/auth/login/route.ts')
const { NextRequest } = require('next/server')
const cookieName = 'flowjudge-teacher-session'
function request(url, options = {}, authenticated = true) {
  const headers = new Headers(options.headers)
  if (authenticated) headers.set('Cookie', `${cookieName}=test-token`)
  return new NextRequest(new URL(url, 'http://portal.test'), { ...options, headers })
}
const realFetch = global.fetch
let calls, redirects
function storage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
function respond(data, status = 200) { return Response.json({ data }, { status }) }
function mock(handler) {
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    return handler(String(url), options)
  }
}
const classroom = { id: 'class-1', name: 'Algorithms', code: 'ALG', isActive: true, studentCount: 7, moduleCount: 2 }
const review = { id: 'review-1', submissionId: 'sub-1', teacherId: null, status: 'REQUESTED', teacherVerdict: null, feedback: null, requestedAt: '2026-09-12T10:00:00Z', reviewedAt: null }
const submission = {
  id: 'sub-1', status: 'COMPLETED', automaticVerdict: 'AC', createdAt: '2026-09-12T09:00:00Z',
  student: { id: 'student-1', name: 'Test Student', username: 'test' }, classroom,
  problem: { id: 'problem-1', title: 'Find the maximum', module: { id: 'module-1', name: 'Conditions' } },
  review, generatedCode: 'print(42)', languageId: 'python3', originalFileName: 'answer.png', fileMimeType: 'image/png',
}
beforeEach(() => {
  calls = []; redirects = []
  global.window = { localStorage: storage(), sessionStorage: storage(), location: { assign: url => redirects.push(url) } }
  window.localStorage.setItem('teacher-jwt', 'legacy-token')
})
afterEach(() => { global.fetch = realFetch; delete global.window })

test('login sends remember preference and removes legacy browser tokens', async () => {
  mock(() => respond({ teacher: { id: 'teacher-1', name: 'Teacher', email: 'teacher@example.test' } }))
  await service.loginTeacher(' teacher@example.test ', 'test-password', true)
  assert.equal(calls[0].url, '/api/backend/teachers/login')
  assert.equal(calls[0].options.headers.has('Authorization'), false)
  assert.equal(calls[0].options.credentials, 'same-origin')
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: 'teacher@example.test', password: 'test-password', remember: true })
  assert.equal(window.localStorage.getItem('teacher-jwt'), null)
})
test('login displays credential errors without redirecting', async () => {
  mock(() => Response.json({ error: { message: 'The email or password is incorrect.' } }, { status: 401 }))
  await assert.rejects(service.loginTeacher('x', 'y'), /email or password/)
  assert.deepEqual(redirects, [])
})
test('401 responses redirect and clear legacy browser tokens', async () => {
  mock(() => Response.json({ error: { code: 'UNAUTHORIZED', message: 'Session expired' } }, { status: 401 }))
  await assert.rejects(service.getTeacher(), /Session expired/)
  assert.equal(window.localStorage.getItem('teacher-jwt'), null)
  assert.deepEqual(redirects, ['/login?error=session'])
})
test('logout uses the cookie session, handles 204 and redirects to login', async () => {
  mock(() => new Response(null, { status: 204 }))
  await service.logoutTeacher()
  assert.equal(calls[0].url, '/api/backend/teachers/logout')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.credentials, 'same-origin')
  assert.equal(window.localStorage.getItem('teacher-jwt'), null)
  assert.deepEqual(redirects, ['/login'])
})
test('logout clears legacy tokens even if revocation is unavailable', async () => {
  mock(() => { throw new Error('Offline') })
  await assert.rejects(service.logoutTeacher(), /Unable to reach/)
  assert.equal(window.localStorage.getItem('teacher-jwt'), null)
})
test('dashboard maps nested summary and real recent activity', async () => {
  mock(() => respond({ summary: { classCount: 2, studentCount: 7, moduleAssignmentCount: 3, submissionCount: 21, requestedReviewCount: 4, inReviewCount: 2 }, recentSubmissions: [submission] }))
  const result = await service.getDashboardStats('class-1')
  assert.equal(result.totalClasses, 2); assert.equal(result.totalStudents, 7)
  assert.equal(result.activeModules, 3); assert.equal(result.totalSubmissions, 21); assert.equal(result.pendingReviews, 6)
  assert.equal(result.recentSubmissions[0].problemName, 'Find the maximum')
  assert.equal(calls[0].url, '/api/backend/teachers/dashboard?classId=class-1')
})
test('class creation and updates use the documented payloads', async () => {
  mock(() => respond(classroom))
  const created = await service.createClass({ name: ' Algorithms ', code: ' ALG ' })
  assert.equal(created.students, 7)
  assert.deepEqual(JSON.parse(calls[0].options.body), { name: 'Algorithms', code: 'ALG' })
  await service.updateClass('class-1', { isActive: false })
  assert.equal(calls[1].options.method, 'PATCH')
  assert.deepEqual(JSON.parse(calls[1].options.body), { isActive: false })
})
test('modules are read from class assignments and unavailable progress stays null', async () => {
  mock(() => respond({ ...classroom, modules: [{ id: 'module-1', name: 'Conditions', description: null, isActive: true, problemCount: 5, displayOrder: 2 }] }))
  const result = await service.getModule('module-1', 'class-1')
  assert.equal(result.classId, 'class-1'); assert.equal(result.problemCount, 5)
  assert.equal(result.displayOrder, 2); assert.equal(result.completionPercentage, null)
})
test('submission pagination preserves class context, filters, and verdicts', async () => {
  mock(url => {
    if (url.endsWith('/classes/class-1')) return respond(classroom)
    const query = new URL(url, 'http://portal.test').searchParams
    assert.equal(query.get('moduleId'), 'module-1'); assert.equal(query.get('studentId'), 'student-1'); assert.equal(query.get('status'), 'COMPLETED')
    return respond(query.has('cursor')
      ? { items: [{ ...submission, classroom: undefined, id: 'sub-2', automaticVerdict: 'TLE' }], nextCursor: null }
      : { items: [{ ...submission, classroom: undefined }], nextCursor: 'sub-1' })
  })
  const rows = await service.listSubmissions({ classId: 'class-1', moduleId: 'module-1', studentId: 'student-1', status: 'COMPLETED' })
  assert.equal(rows.length, 2)
  assert.equal(rows[0].className, 'Algorithms'); assert.equal(rows[0].classId, 'class-1')
  assert.deepEqual(rows.map(row => row.verdict), ['Time Limit Exceeded', 'Correct'])
  assert.equal(rows[0].problemId, 'problem-1'); assert.equal(rows[0].moduleId, 'module-1')
})
test('failed class requests are surfaced instead of silently returning partial results', async () => {
  mock(url => url.endsWith('/classes') ? respond([classroom]) : Response.json({ error: { message: 'Database unavailable' } }, { status: 503 }))
  await assert.rejects(service.listSubmissions(), /Database unavailable/)
})
test('submission detail maps all verdict codes, missing reviews, and failure state', async () => {
  for (const [code, label] of Object.entries({ AC: 'Correct', WA: 'Wrong Answer', CE: 'Compilation Error', RTE: 'Runtime Error', TLE: 'Time Limit Exceeded', MLE: 'Memory Limit Exceeded' })) {
    mock(() => respond({ ...submission, automaticVerdict: code }))
    const row = await service.getSubmission('sub-1')
    assert.equal(row.verdict, label); assert.equal(row.language, 'Python'); assert.equal(row.review.id, 'review-1')
  }
  mock(() => respond({ ...submission, review: null, status: 'FAILED', automaticVerdict: null, failureMessage: 'Conversion failed' }))
  const row = await service.getSubmission('sub-1')
  assert.equal(row.reviewStatus, 'NOT_REQUESTED'); assert.equal(row.verdict, 'Failed'); assert.equal(row.errorMessage, 'Conversion failed')
})
test('review queue uses nested submission IDs, membership names, real dates and cursor', async () => {
  mock(url => respond({ items: [{ ...review, submissionId: undefined, teacherId: undefined, teacher: { id: 'teacher-1' }, submission: { ...submission, student: undefined, classroom: undefined, review: undefined, studentClass: { student: submission.student, classroom } } }], nextCursor: url.includes('cursor=') ? null : 'review-1' }))
  const rows = await service.listReviews({ status: 'IN_REVIEW', classId: 'class-1' })
  assert.equal(rows.length, 2); assert.equal(rows[0].submissionId, 'sub-1')
  assert.equal(rows[0].teacherId, 'teacher-1'); assert.equal(rows[0].requestedAt, review.requestedAt)
  assert.equal(rows[0].reviewedAt, null); assert.equal(rows[0].submission.className, 'Algorithms')
  assert.match(calls[0].url, /status=IN_REVIEW/)
})
test('publish claims a requested review before PATCH and sends exact verdict/feedback fields', async () => {
  mock((url, options) => url.includes('/submissions/') ? respond(submission) : respond({ ...review, status: options.method === 'POST' ? 'IN_REVIEW' : 'REVIEWED', teacherVerdict: 'NEEDS_CHANGES', feedback: 'Fix arrows' }))
  const result = await service.saveReview('sub-1', 'NEEDS_CHANGES', ' Fix arrows ')
  assert.deepEqual(calls.map(call => [call.url, call.options.method ?? 'GET']), [
    ['/api/backend/teachers/submissions/sub-1', 'GET'], ['/api/backend/teachers/reviews/review-1/start', 'POST'], ['/api/backend/teachers/reviews/review-1', 'PATCH'],
  ])
  assert.deepEqual(JSON.parse(calls[2].options.body), { teacherVerdict: 'NEEDS_CHANGES', feedback: 'Fix arrows' })
  assert.equal(result.reviewStatus, 'REVIEWED')
})
test('claim conflict stops publishing and exposes the server message', async () => {
  mock(url => url.includes('/submissions/') ? respond(submission) : Response.json({ error: { message: 'Review assigned to another teacher' } }, { status: 409 }))
  await assert.rejects(service.saveReview('sub-1', 'CORRECT', 'Good'), /another teacher/)
  assert.equal(calls.some(call => call.options.method === 'PATCH'), false)
})
test('completed and missing review requests cannot be published; feedback is required', async () => {
  await assert.rejects(service.saveReview('sub-1', 'CORRECT', '  '), /Feedback/)
  assert.equal(calls.length, 0)
  mock(() => respond({ ...submission, review: { ...review, status: 'REVIEWED' } }))
  await assert.rejects(service.saveReview('sub-1', 'CORRECT', 'Good'), /already been completed/)
  mock(() => respond({ ...submission, review: null }))
  await assert.rejects(service.saveReview('sub-1', 'CORRECT', 'Good'), /no review request/)
})
test('flowcharts are fetched as authenticated binary data', async () => {
  mock(() => new Response(new Uint8Array([137, 80, 78, 71]), { headers: { 'Content-Type': 'image/png' } }))
  const blob = await service.getSubmissionFile('sub-1')
  assert.equal(blob.type, 'image/png'); assert.equal(blob.size, 4)
  assert.equal(calls[0].url, '/api/backend/teachers/submissions/sub-1/file')
  assert.equal(calls[0].options.credentials, 'same-origin')
})
test('invalid envelopes, network errors and repeated pagination cursors are reported', async () => {
  mock(() => Response.json('unexpected'))
  await assert.rejects(service.getTeacher(), /unexpected response format/)
  mock(() => { throw new Error('Network offline') })
  await assert.rejects(service.getTeacher(), /Unable to reach/)
  mock(() => respond({ items: [], nextCursor: 'same-cursor' }))
  await assert.rejects(service.listReviews(), /repeated page/)
})
test('proxy preserves auth, query, binary content and rejects non-teacher routes', async () => {
  const oldBase = process.env.FLOWJUDGE_API_URL
  process.env.FLOWJUDGE_API_URL = 'http://backend.test/api/'
  try {
    mock(() => new Response('binary', { headers: { 'Content-Type': 'image/png', 'Content-Disposition': 'attachment; filename="answer.png"' } }))
    const req = request('/api/backend/teachers/submissions/sub-1/file?x=1')
    const result = await proxy.GET(req, { params: Promise.resolve({ path: ['teachers', 'submissions', 'sub-1', 'file'] }) })
    assert.equal(calls[0].url, 'http://backend.test/api/teachers/submissions/sub-1/file?x=1')
    assert.equal(calls[0].options.headers.get('Authorization'), 'Bearer test-token')
    assert.equal(calls[0].options.headers.get('ngrok-skip-browser-warning'), 'true')
    assert.equal(result.headers.get('Cache-Control'), 'no-store'); assert.equal(await result.text(), 'binary')
    for (const parts of [['students'], ['teachers', '..'], ['teachers', 'bad/path']]) {
      assert.equal((await proxy.GET(req, { params: Promise.resolve({ path: parts }) })).status, 404)
    }
    assert.equal(calls.length, 1)
  } finally { if (oldBase === undefined) delete process.env.FLOWJUDGE_API_URL; else process.env.FLOWJUDGE_API_URL = oldBase }
})
test('proxy preserves logout 204 and handles connection failure', async () => {
  const req = request('/api/backend/teachers/logout', { method: 'POST' })
  const context = { params: Promise.resolve({ path: ['teachers', 'logout'] }) }
  mock(() => new Response(null, { status: 204 }))
  assert.equal((await proxy.POST(new NextRequest(req.clone()), context)).status, 204)
  mock(() => { throw new Error('Offline') })
  const result = await proxy.POST(new NextRequest(req.clone()), context)
  assert.equal(result.status, 502); assert.equal((await result.json()).error.code, 'BACKEND_UNAVAILABLE')
})

test('JSON stream metadata is never offered as a flowchart download', async () => {
  mock(() => respond({ stream: { path: '/internal/storage/file' } }))
  await assert.rejects(service.getSubmissionFile('sub-1'), /flowchart file is unavailable/)
})

test('protected pages redirect without a cookie before fetching or rendering', async () => {
  mock(() => { throw new Error('Must not fetch') })
  for (const url of ['/teacher', '/teacher/classes/class-1', '/classes', '/submissions/sub-1', '/review-requests', '/settings', '/students/student-1', '/problems/problem-1']) {
    const result = await routeGuard.proxy(request(url, {}, false))
    assert.equal(result.status, 307)
    assert.equal(result.headers.get('Location'), 'http://portal.test/login')
    assert.equal(result.headers.get('Cache-Control'), 'no-store')
  }
  assert.equal(calls.length, 0)
})
test('forged, expired and revoked cookies do not unlock protected pages', async () => {
  mock(() => Response.json({ error: { message: 'Unauthorized' } }, { status: 401 }))
  const result = await routeGuard.proxy(request('/teacher'))
  assert.equal(result.status, 307)
  assert.equal(result.headers.get('Location'), 'http://portal.test/login?error=session')
  assert.match(result.headers.get('Set-Cookie'), /Expires=Thu, 01 Jan 1970/)
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token')
})
test('only a backend-validated session can render a protected page', async () => {
  mock(() => respond({ id: 'teacher-1', name: 'Teacher' }))
  const result = await routeGuard.proxy(request('/teacher'))
  assert.equal(result.headers.get('x-middleware-next'), '1')
  assert.equal(result.headers.get('Cache-Control'), 'no-store')
})
test('page guard fails closed on backend errors or malformed profiles', async () => {
  for (const response of [respond({}), Response.json('not a profile'), new Response(null, { status: 503 })]) {
    mock(() => response)
    const result = await routeGuard.proxy(request('/teacher'))
    assert.equal(result.status, 307)
    assert.equal(result.headers.get('Location'), 'http://portal.test/login?error=unavailable')
    assert.equal(result.headers.get('Set-Cookie'), null)
  }
  mock(() => { throw new Error('Offline') })
  assert.equal((await routeGuard.proxy(request('/teacher'))).status, 307)
})
test('login proxy sets an HttpOnly session cookie and never returns the token to JavaScript', async () => {
  mock(() => respond({ accessToken: 'secret-test-token', teacher: { id: 'teacher-1' } }))
  for (const remember of [false, true]) {
    const req = request('https://portal.test/api/backend/teachers/login', { method: 'POST', body: JSON.stringify({ email: 'teacher@example.test', password: 'password', remember }) }, false)
    const result = await proxy.POST(req, { params: Promise.resolve({ path: ['teachers', 'login'] }) })
    assert.equal(result.status, 200)
    const cookie = result.headers.get('Set-Cookie')
    assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=lax/)
    assert.equal(cookie.includes('Max-Age='), remember)
    assert.deepEqual(await result.json(), { data: { teacher: { id: 'teacher-1' } } })
    assert.deepEqual(JSON.parse(calls.at(-1).options.body), { email: 'teacher@example.test', password: 'password' })
    assert.equal(calls.at(-1).options.headers.has('Authorization'), false)
  }
})
test('API proxy rejects missing cookie sessions even when a bearer header is supplied', async () => {
  mock(() => { throw new Error('Must not fetch') })
  const result = await proxy.GET(request('/api/backend/teachers/me', { headers: { Authorization: 'Bearer legacy-token' } }, false), { params: Promise.resolve({ path: ['teachers', 'me'] }) })
  assert.equal(result.status, 401)
  assert.equal(calls.length, 0)
})
test('API proxy clears the session on expiration and logout, including upstream failure', async () => {
  for (const status of [204, 502]) {
    mock(() => new Response(null, { status }))
    const result = await proxy.POST(request('/api/backend/teachers/logout', { method: 'POST' }), { params: Promise.resolve({ path: ['teachers', 'logout'] }) })
    assert.match(result.headers.get('Set-Cookie'), /Expires=Thu, 01 Jan 1970/)
  }
  mock(() => Response.json({ error: { message: 'Expired' } }, { status: 401 }))
  const result = await proxy.GET(request('/api/backend/teachers/me'), { params: Promise.resolve({ path: ['teachers', 'me'] }) })
  assert.match(result.headers.get('Set-Cookie'), /Expires=Thu, 01 Jan 1970/)
})
test('cross-origin mutations cannot use the cookie session', async () => {
  mock(() => { throw new Error('Must not fetch') })
  const result = await proxy.POST(request('/api/backend/teachers/classes', { method: 'POST', headers: { Origin: 'https://other.test' } }), { params: Promise.resolve({ path: ['teachers', 'classes'] }) })
  assert.equal(result.status, 403); assert.equal(calls.length, 0)
})

test('same-origin login works when Next.js normalizes the internal hostname', async () => {
  mock(() => respond({ accessToken: 'test-token', teacher: { id: 'teacher-1' } }))
  const req = request('http://localhost:3001/api/backend/teachers/login', {
    method: 'POST', headers: { Host: '127.0.0.1:3001', Origin: 'http://127.0.0.1:3001' },
    body: JSON.stringify({ email: 'teacher@example.test', password: 'password' }),
  }, false)
  const result = await proxy.POST(req, { params: Promise.resolve({ path: ['teachers', 'login'] }) })
  assert.equal(result.status, 200)
})

test('native login posts credentials and establishes the same cookie without JavaScript', async () => {
  mock(() => respond({ accessToken: 'native-token', teacher: { id: 'teacher-1' } }))
  const req = request('http://localhost:3001/api/auth/login', {
    method: 'POST', headers: { Host: '172.20.10.4:3001', Origin: 'http://172.20.10.4:3001', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email: 'teacher@example.test', password: 'password', 'remember-me': 'on' }).toString(),
  }, false)
  const result = await nativeLogin.POST(req)
  assert.equal(result.status, 303)
  assert.equal(result.headers.get('Location'), 'http://172.20.10.4:3001/teacher')
  assert.match(result.headers.get('Set-Cookie'), /HttpOnly/)
  assert.deepEqual(JSON.parse(calls[0].options.body), { email: 'teacher@example.test', password: 'password' })
})
test('native login failures never expose credentials in redirect URLs', async () => {
  mock(() => Response.json({ error: { message: 'Invalid credentials' } }, { status: 401 }))
  const result = await nativeLogin.POST(request('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email: 'teacher@example.test', password: 'secret-test-password' }).toString(),
  }, false))
  assert.equal(result.headers.get('Location'), 'http://portal.test/login?error=credentials')
  assert.equal(result.headers.has('Set-Cookie'), false)
})

test('public tunnel redirects never inherit the local server port', async () => {
  const headers = { Host: 'portal.ngrok-free.app', Origin: 'https://portal.ngrok-free.app', 'Content-Type': 'application/x-www-form-urlencoded' }
  for (const success of [true, false]) {
    mock(() => success ? respond({ accessToken: 'tunnel-token', teacher: { id: 'teacher-1' } }) : Response.json({ error: { message: 'Invalid credentials' } }, { status: 401 }))
    const result = await nativeLogin.POST(request('https://localhost:3001/api/auth/login', {
      method: 'POST', headers, body: new URLSearchParams({ email: 'teacher@example.test', password: 'password' }).toString(),
    }, false))
    assert.equal(result.headers.get('Location'), `https://portal.ngrok-free.app/${success ? 'teacher' : 'login?error=credentials'}`)
  }
  const guarded = await routeGuard.proxy(request('https://localhost:3001/teacher', { headers }, false))
  assert.equal(guarded.headers.get('Location'), 'https://portal.ngrok-free.app/login')
})
test('module catalogs preserve unattempted and inactive problems', async () => {
  const catalog = { module: { id: 'module-1', name: 'Conditions' }, problems: [{ id: 'p1', isActive: true, submissionCount: 0 }, { id: 'p2', isActive: false, submissionCount: 2 }] }
  mock(() => respond(catalog))
  assert.deepEqual(await service.listModuleProblems('class-1', 'module-1'), catalog)
  assert.equal(calls[0].url, '/api/backend/teachers/classes/class-1/modules/module-1/problems')
})
test('problem details and PDFs use teacher endpoints instead of external statement URLs', async () => {
  const problem = { id: 'p1', title: 'Hello', statementPdfUrl: 'https://old-tunnel.test/statement', module: { id: 'm1', name: 'Conditions' } }
  mock(url => url.endsWith('/statement') ? new Response('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf; name="hello.pdf"' } }) : respond(problem))
  assert.deepEqual(await service.getProblem('p1'), problem)
  const pdf = await service.getProblemStatement('p1')
  assert.equal(pdf.type, 'application/pdf'); assert.equal(await pdf.text(), '%PDF-1.7')
  assert.deepEqual(calls.map(call => call.url), ['/api/backend/teachers/problems/p1', '/api/backend/teachers/problems/p1/statement'])
  for (const type of ['application/json', 'text/html']) {
    mock(() => new Response('not a PDF', { headers: { 'Content-Type': type } }))
    await assert.rejects(service.getProblemStatement('p1'), /PDF is unavailable/)
  }
})
test('student detail preserves all visible memberships, server metrics and submission identity', async () => {
  const student = { ...submission.student, email: 'student@example.test' }
  const classes = [classroom, { id: 'class-2', name: 'Empty class', code: 'EMPTY' }]
  const summary = { submissionCount: 20, correctCount: 5, completedCount: 10, accuracy: 50 }
  mock(() => respond({ student, classes, summary, submissions: [{ ...submission, student: undefined }] }))
  const result = await service.getStudent(student.id)
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/backend/teachers/students/student-1')
  assert.deepEqual(result.classes, classes); assert.deepEqual(result.summary, summary)
  assert.equal(result.submissions[0].studentName, student.name)
  assert.equal(result.submissions[0].studentId, student.id)
  mock(() => respond({ student, classes, summary, submissions: [] }))
  assert.equal((await service.getStudent(student.id)).classes.length, 2)
})
test('review detail preserves immutable history and assigned teacher', async () => {
  const events = [{ id: 'event-1', status: 'IN_REVIEW', createdAt: '2026-09-12T11:00:00Z', teacher: { id: 'teacher-1', name: 'Anita' }, teacherVerdict: null, feedback: null }]
  mock(() => respond({ ...submission, review: { ...review, status: 'IN_REVIEW', startedAt: events[0].createdAt, teacher: events[0].teacher, events } }))
  const row = (await service.getSubmission('sub-1')).review
  assert.deepEqual(row.events, events); assert.equal(row.teacherName, 'Anita'); assert.equal(row.startedAt, events[0].createdAt)
})
