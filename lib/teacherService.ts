import { apiFetch, apiRequest, ApiError, clearSession } from './api-client'

export type Teacher = { id: string; name: string; email: string; role: 'teacher' }
export type ReviewStatus = 'REQUESTED' | 'IN_REVIEW' | 'REVIEWED'
export type SubmissionReviewStatus = ReviewStatus | 'NOT_REQUESTED'
export type TeacherVerdict = 'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES'
export type SubmissionStatus = 'UPLOADED' | 'CONVERTING' | 'SUBMITTING' | 'JUDGING' | 'COMPLETED' | 'FAILED'
export type Student = {
  id: string; name: string; email: string; username: string; classId: string
  totalSubmissions: number; solvedProblems: number | null; accuracy: number | null
}
export type Review = {
  id: string; submissionId: string; teacherId: string | null
  teacherVerdict: TeacherVerdict | null; feedback: string; requestedAt: string
  reviewedAt: string | null; reviewStatus: ReviewStatus; submission?: Submission
  teacherName: string | null; startedAt: string | null; events: ReviewEvent[]
}
export type ReviewEvent = {
  id: string; status: ReviewStatus; teacherVerdict: TeacherVerdict | null
  feedback: string | null; createdAt: string; teacher?: { id: string; name: string } | null
}
export type Problem = {
  id: string; title: string; description: string | null; difficulty: string | null
  displayOrder: number; isActive: boolean; statementPdfUrl: string | null; statementHtmlUrl?: string | null
  domjudgeContestId: string; domjudgeProblemId: string; submissionCount: number
}
export type ProblemDetails = Problem & { module: { id: string; name: string } }
export type StudentProfile = {
  student: { id: string; name: string; email: string; username: string }
  classes: { id: string; name: string; code: string; joinedAt: string }[]
  summary: { submissionCount: number; completedCount: number; correctCount: number; accuracy: number }
  submissions: Submission[]
}
export type ClassItem = {
  id: string; name: string; code: string; isActive: boolean
  students: number; modules: number; pendingReviews: number | null
}
export type ModuleItem = {
  id: string; classId: string; name: string; description: string; problemCount: number
  completionPercentage: number | null; isActive: boolean; displayOrder: number
}
export type Submission = {
  id: string; studentId: string; classId: string; moduleId: string; problemId: string
  studentName: string; className: string; moduleName: string; problemName: string
  submissionTime: string; automaticStatus: SubmissionStatus; verdict: string
  reviewStatus: SubmissionReviewStatus; review?: Review
  domjudgeId: string; generatedCode: string; originalFileName: string; fileMimeType: string
  errorMessage: string | null; language: string
}

type ApiClass = {
  id: string; name: string; code: string; isActive: boolean; studentCount?: number
  moduleCount?: number; pendingReviewCount?: number; modules?: ApiModule[]
}
type ApiModule = {
  id: string; name: string; description: string | null; problemCount: number
  isActive: boolean; displayOrder: number
}
type ApiStudent = { id: string; name: string; email: string; username: string; submissionCount: number }
type ApiReview = {
  id: string; submissionId?: string; teacherId?: string | null; teacher?: { id: string; name?: string } | null
  teacherVerdict: TeacherVerdict | null; feedback: string | null; requestedAt: string
  reviewedAt: string | null; status: ReviewStatus; submission?: ApiSubmission
  startedAt?: string | null; events?: ReviewEvent[]
}
type ApiSubmission = {
  id: string; status: SubmissionStatus; automaticVerdict: string | null; createdAt: string
  student?: { id: string; name: string; username: string }
  classroom?: { id: string; name: string }
  studentClass?: { student: NonNullable<ApiSubmission['student']>; classroom: NonNullable<ApiSubmission['classroom']> }
  problem: { id: string; title: string; module: { id: string; name: string } }
  review?: ApiReview | null; generatedCode?: string | null; languageId?: string
  domjudgeSubmissionId?: string | null; originalFileName?: string; fileMimeType?: string
  failureMessage?: string | null
}
type ApiDashboard = {
  summary: { classCount: number; studentCount: number; moduleAssignmentCount: number
    submissionCount: number; requestedReviewCount: number; inReviewCount: number
    uploadedCount?: number; processingCount?: number; completedCount?: number; failedCount?: number; reviewedCount?: number }
  recentSubmissions: ApiSubmission[]
}

const segment = encodeURIComponent

export async function loginTeacher(email: string, password: string, remember = false) {
  const data = await apiFetch<{ teacher: Omit<Teacher, 'role'> }>('/teachers/login', {
    method: 'POST', body: JSON.stringify({ email: email.trim(), password, remember }),
  }, false)
  clearSession()
  return data
}

export async function logoutTeacher() {
  try {
    await apiFetch<void>('/teachers/logout', { method: 'POST' })
  } finally {
    clearSession()
    if (typeof window !== 'undefined') window.location.assign('/login')
  }
}

export async function getTeacher(): Promise<Teacher> {
  const data = await apiFetch<Omit<Teacher, 'role'>>('/teachers/me')
  return { ...data, role: 'teacher' }
}

function mapClass(row: ApiClass): ClassItem {
  return { id: row.id, name: row.name, code: row.code, isActive: row.isActive,
    students: row.studentCount ?? 0, modules: row.moduleCount ?? row.modules?.length ?? 0,
    pendingReviews: row.pendingReviewCount ?? null }
}

export async function listClasses(): Promise<ClassItem[]> {
  return (await apiFetch<ApiClass[]>('/teachers/classes')).map(mapClass)
}
export async function getClass(id: string): Promise<ClassItem> {
  return mapClass(await apiFetch<ApiClass>(`/teachers/classes/${segment(id)}`))
}
export async function createClass(payload: { name: string; code: string }): Promise<ClassItem> {
  return mapClass(await apiFetch<ApiClass>('/teachers/classes', {
    method: 'POST', body: JSON.stringify({ name: payload.name.trim(), code: payload.code.trim() }),
  }))
}
export async function updateClass(id: string, updates: { name?: string; isActive?: boolean }): Promise<ClassItem> {
  await apiFetch<ApiClass>(`/teachers/classes/${segment(id)}`, { method: 'PATCH', body: JSON.stringify(updates) })
  return getClass(id)
}
export async function listModules(classId: string): Promise<ModuleItem[]> {
  const data = await apiFetch<ApiClass>(`/teachers/classes/${segment(classId)}`)
  return (data.modules ?? []).map(row => ({ ...row, classId, description: row.description ?? '', completionPercentage: null }))
}
export async function getModule(id: string, classId: string): Promise<ModuleItem | undefined> {
  return (await listModules(classId)).find(row => row.id === id)
}
export async function listStudents(classId: string): Promise<Student[]> {
  return (await apiFetch<ApiStudent[]>(`/teachers/classes/${segment(classId)}/students`)).map(row => ({
    id: row.id, name: row.name, email: row.email, username: row.username, classId,
    totalSubmissions: row.submissionCount, solvedProblems: null, accuracy: null,
  }))
}
export async function getStudent(id: string): Promise<StudentProfile> {
  const data = await apiFetch<Omit<StudentProfile, 'submissions'> & { submissions: ApiSubmission[] }>(`/teachers/students/${segment(id)}`)
  return { ...data, submissions: data.submissions.map(row => mapSubmission({ ...row, student: data.student })) }
}
export async function listModuleProblems(classId: string, moduleId: string) {
  return apiFetch<{ module: Pick<ModuleItem, 'id' | 'name' | 'description' | 'isActive'>; problems: Problem[] }>(
    `/teachers/classes/${segment(classId)}/modules/${segment(moduleId)}/problems`)
}
export async function getProblem(id: string): Promise<ProblemDetails> {
  return apiFetch<ProblemDetails>(`/teachers/problems/${segment(id)}`)
}
export async function getProblemStatement(id: string): Promise<Blob> {
  // Use the authenticated endpoint even when metadata contains an old external URL.
  const response = await apiRequest(`/teachers/problems/${segment(id)}/statement`)
  const type = response.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()
  if (type !== 'application/pdf' && type !== 'text/html') {
    throw new ApiError('The problem statement is unavailable.', 502)
  }
  return new Blob([await response.arrayBuffer()], { type })
}

const verdicts: Record<string, string> = {
  AC: 'Correct', WA: 'Wrong Answer', CE: 'Compilation Error', RTE: 'Runtime Error',
  TLE: 'Time Limit Exceeded', MLE: 'Memory Limit Exceeded',
}
function mapSubmission(row: ApiSubmission, classroom?: { id: string; name: string }): Submission {
  const student = row.student ?? row.studentClass?.student
  const ownedClass = row.classroom ?? row.studentClass?.classroom ?? classroom
  return {
    id: row.id, studentId: student?.id ?? '', classId: ownedClass?.id ?? '',
    moduleId: row.problem.module.id, problemId: row.problem.id,
    studentName: student?.name ?? student?.username ?? 'Unavailable', className: ownedClass?.name ?? 'Unavailable',
    moduleName: row.problem.module.name, problemName: row.problem.title, submissionTime: row.createdAt,
    automaticStatus: row.status,
    verdict: row.automaticVerdict ? verdicts[row.automaticVerdict] ?? row.automaticVerdict
      : row.status === 'FAILED' ? 'Failed' : row.status === 'COMPLETED' ? 'Unavailable' : 'Processing',
    reviewStatus: row.review?.status ?? 'NOT_REQUESTED',
    review: row.review?.requestedAt ? mapReview(row.review, row.id) : undefined,
    domjudgeId: row.domjudgeSubmissionId ?? '—', generatedCode: row.generatedCode ?? '',
    originalFileName: row.originalFileName ?? 'flowchart', fileMimeType: row.fileMimeType ?? '',
    errorMessage: row.failureMessage ?? null,
    language: ({ cpp: 'C++', 'c++': 'C++', python3: 'Python', python: 'Python', java: 'Java' } as Record<string, string>)[row.languageId ?? ''] ?? row.languageId ?? 'Unavailable',
  }
}
function mapReview(row: ApiReview, submissionId?: string): Review {
  return {
    id: row.id, submissionId: row.submission?.id ?? row.submissionId ?? submissionId ?? '',
    teacherId: row.teacher?.id ?? row.teacherId ?? null, teacherVerdict: row.teacherVerdict,
    feedback: row.feedback ?? '', requestedAt: row.requestedAt, reviewedAt: row.reviewedAt,
    reviewStatus: row.status, submission: row.submission ? mapSubmission(row.submission) : undefined,
    teacherName: row.teacher?.name ?? null, startedAt: row.startedAt ?? null, events: row.events ?? [],
  }
}

// Follow the backend cursor so existing client-side filters cover the complete history.
async function allPages<T>(path: string, filters: Record<string, string | undefined> = {}): Promise<T[]> {
  const query = new URLSearchParams({ limit: '100' })
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value)
  const rows: T[] = []
  const seen = new Set<string>()
  while (true) {
    const page = await apiFetch<{ items: T[]; nextCursor: string | null }>(`${path}?${query}`)
    rows.push(...page.items)
    if (!page.nextCursor) return rows
    if (seen.has(page.nextCursor)) throw new ApiError('The server returned a repeated page. Please try again.', 502)
    seen.add(page.nextCursor)
    query.set('cursor', page.nextCursor)
  }
}
export async function listSubmissions(filters: { classId?: string; moduleId?: string; problemId?: string; status?: SubmissionStatus; studentId?: string; reviewStatus?: SubmissionReviewStatus } = {}): Promise<Submission[]> {
  const classes = filters.classId ? [await getClass(filters.classId)] : await listClasses()
  const rows: Submission[] = []
  for (const classroom of classes) {
    const page = await allPages<ApiSubmission>(`/teachers/classes/${segment(classroom.id)}/submissions`, {
      moduleId: filters.moduleId, problemId: filters.problemId, status: filters.status, studentId: filters.studentId,
      reviewStatus: filters.reviewStatus,
    })
    rows.push(...page.map(row => mapSubmission(row, classroom)))
  }
  return rows.sort((a, b) => b.submissionTime.localeCompare(a.submissionTime) || b.id.localeCompare(a.id))
}
export async function getSubmission(id: string): Promise<Submission> {
  return mapSubmission(await apiFetch<ApiSubmission>(`/teachers/submissions/${segment(id)}`))
}
export async function rejudgeSubmission(id: string): Promise<Submission> {
  return mapSubmission(await apiFetch<ApiSubmission>(`/teachers/submissions/${segment(id)}/rejudge`, { method: 'POST' }))
}
export async function getSubmissionFile(id: string): Promise<Blob> {
  const response = await apiRequest(`/teachers/submissions/${segment(id)}/file`)
  if (response.headers.get('Content-Type')?.includes('application/json')) {
    throw new ApiError('The flowchart file is unavailable. Please contact your administrator.', 502)
  }
  return response.blob()
}
export async function listReviews(filters: { status?: ReviewStatus; classId?: string; moduleId?: string } = {}): Promise<Review[]> {
  return (await allPages<ApiReview>('/teachers/reviews', filters)).map(row => mapReview(row))
}
export async function getReviewBySubmissionId(submissionId: string): Promise<Review | undefined> {
  return (await getSubmission(submissionId)).review
}
export async function startReview(submissionId: string): Promise<Review> {
  const review = await getReviewBySubmissionId(submissionId)
  if (!review) throw new Error('This submission has no review request.')
  return mapReview(await apiFetch<ApiReview>(`/teachers/reviews/${segment(review.id)}/start`, { method: 'POST' }), submissionId)
}
export async function saveReview(submissionId: string, teacherVerdict: TeacherVerdict, feedback: string) {
  if (!feedback.trim() || feedback.trim().length > 5000) throw new Error('Feedback must contain between 1 and 5,000 characters.')
  const review = await getReviewBySubmissionId(submissionId)
  if (!review) throw new Error('This submission has no review request.')
  if (review.reviewStatus === 'REVIEWED') throw new Error('This review has already been completed.')
  if (review.reviewStatus === 'REQUESTED') {
    await apiFetch<ApiReview>(`/teachers/reviews/${segment(review.id)}/start`, { method: 'POST' })
  }
  const updated = await apiFetch<ApiReview>(`/teachers/reviews/${segment(review.id)}`, {
    method: 'PATCH', body: JSON.stringify({ teacherVerdict, feedback: feedback.trim() }),
  })
  return mapReview(updated, submissionId)
}
export async function getDashboardStats(classId?: string) {
  const data = await apiFetch<ApiDashboard>(`/teachers/dashboard${classId ? `?${new URLSearchParams({ classId })}` : ''}`)
  return {
    totalClasses: data.summary.classCount, totalStudents: data.summary.studentCount,
    activeModules: data.summary.moduleAssignmentCount, totalSubmissions: data.summary.submissionCount,
    pendingReviews: data.summary.requestedReviewCount + data.summary.inReviewCount,
    evaluation: {
      uploaded: data.summary.uploadedCount ?? 0, processing: data.summary.processingCount ?? 0,
      completed: data.summary.completedCount ?? 0, failed: data.summary.failedCount ?? 0,
    },
    reviewedCount: data.summary.reviewedCount ?? 0,
    recentSubmissions: data.recentSubmissions.map(row => mapSubmission(row)),
  }
}
