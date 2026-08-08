export type Teacher = {
  id: string
  name: string
  email: string
  role: 'teacher'
}

export type ReviewStatus = 'REQUESTED' | 'IN_REVIEW' | 'REVIEWED'

export type SubmissionStatus = 'UPLOADED' | 'CONVERTING' | 'SUBMITTING' | 'JUDGING' | 'COMPLETED' | 'FAILED'

export type Student = {
  id: string
  name: string
  email: string
  username: string
  classId: string
  totalSubmissions: number
  solvedProblems: number
  accuracy: number
}

export type Review = {
  id: string
  submissionId: string
  teacherId: string
  teacherVerdict: 'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES' | 'Needs Review'
  feedback: string
  requestedAt: string
  reviewedAt: string | null
  reviewStatus: ReviewStatus
  dueTime?: string
}

export type ClassItem = {
  id: string
  teacherId: string
  name: string
  code: string
  isActive: boolean
  students: number
  modules: number
  pendingReviews: number
}

export type ModuleItem = {
  id: string
  classId: string
  name: string
  description: string
  problemCount: number
  completionPercentage: number
  isActive: boolean
  displayOrder: number
}

export type ProblemItem = {
  id: string
  moduleId: string
  name: string
  domjudgeId: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  attempts: number
}

export type Submission = {
  id: string
  studentId: string
  classId: string
  moduleId: string
  problemId: string
  studentName: string
  className: string
  moduleName: string
  problemName: string
  submissionTime: string
  automaticStatus: SubmissionStatus
  verdict: 'Correct' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Processing'
  reviewStatus: ReviewStatus
  domjudgeId: string
  generatedCode: string
  flowchartUrl: string
  errorMessage?: string | null
  notes?: string
  language: 'C++' | 'Python' | 'Java'
}

const API_BASE = 'https://refutable-confound-parched.ngrok-free.dev/api'

// Helper to get auth token
function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('teacher-jwt')
}

function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('teacher-jwt', token)
  }
}

// Custom fetch wrapper
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()
  const headers = new Headers(options.headers)
  headers.set('ngrok-skip-browser-warning', 'true')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`)
  }
  
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  if (res.status === 204) return null
  
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export async function loginTeacher(email: string, password: string) {
  const res = await apiFetch('/teachers/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  if (res?.data?.accessToken) {
    setToken(res.data.accessToken)
  }
  return res
}

export async function logoutTeacher() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('teacher-jwt')
    window.location.href = '/'
  }
}

// Ensure token exists helper
function requireAuth() {
  if (!getToken() && typeof window !== 'undefined') {
    window.location.href = '/login'
    throw new Error('Not authenticated')
  }
}

export async function getTeacher(): Promise<Teacher> {
  requireAuth()
  const res = await apiFetch('/teachers/me')
  return {
    id: res.data?.id || 't1',
    name: res.data?.name || 'Anita Sharma',
    email: res.data?.email || 'anita.teacher@example.test',
    role: 'teacher'
  }
}

export async function listClasses(): Promise<ClassItem[]> {
  requireAuth()
  const res = await apiFetch('/teachers/classes')
  if (!res.data) return []
  return res.data.map((c: any) => ({
    id: c.id,
    teacherId: c.teacherId || 't1',
    name: c.name,
    code: c.code,
    isActive: c.isActive,
    students: c.studentCount || 0,
    modules: c.moduleCount || 0,
    pendingReviews: 0 // Approximated
  }))
}

export async function getClass(id: string): Promise<ClassItem | undefined> {
  requireAuth()
  const res = await apiFetch(`/teachers/classes/${id}`)
  if (!res.data) return undefined
  return {
    id: res.data.id,
    teacherId: res.data.teacherId || 't1',
    name: res.data.name,
    code: res.data.code,
    isActive: res.data.isActive,
    students: res.data.studentCount || res.data._count?.students || 0,
    modules: res.data.moduleCount || res.data.modules?.length || 0,
    pendingReviews: 0
  }
}

export async function createClass(payload: { name: string; code: string }): Promise<ClassItem> {
  requireAuth()
  const res = await apiFetch('/teachers/classes', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  return {
    id: res.data.id,
    teacherId: res.data.teacherId,
    name: res.data.name,
    code: res.data.code,
    isActive: res.data.isActive,
    students: 0,
    modules: 0,
    pendingReviews: 0
  }
}

export async function updateClass(id: string, updates: { name?: string; isActive?: boolean }): Promise<ClassItem | undefined> {
  requireAuth()
  const res = await apiFetch(`/teachers/classes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
  return getClass(id)
}

export async function listModules(classId: string): Promise<ModuleItem[]> {
  requireAuth()
  const res = await apiFetch(`/teachers/classes/${classId}`)
  if (!res.data?.modules) return []
  return res.data.modules.map((m: any) => ({
    id: m.id,
    classId: classId,
    name: m.name,
    description: m.description || '',
    problemCount: m.problemCount || m.problems?.length || 0,
    completionPercentage: 0,
    isActive: m.isActive,
    displayOrder: m.order || m.displayOrder || 0
  }))
}

export async function getModule(id: string): Promise<ModuleItem | undefined> {
  // We can't fetch a module directly easily without classId, so we mock or return a basic structure
  return undefined
}

export async function listProblems(moduleId: string): Promise<ProblemItem[]> {
  // Fallback to empty array as problems aren't directly exposed in teacher api
  return []
}

export async function createModule(classId: string, payload: { name: string; description?: string }): Promise<ModuleItem> {
  // Note: Backend doesn't support this yet, so we mock it optimistically for the UI
  return {
    id: `mod-${Date.now()}`,
    classId,
    name: payload.name,
    description: payload.description || '',
    problemCount: 0,
    completionPercentage: 0,
    isActive: true,
    displayOrder: 10
  }
}

export async function createProblem(moduleId: string, payload: { name: string; difficulty: 'Easy'|'Medium'|'Hard' }): Promise<ProblemItem> {
  // Note: Backend doesn't support this yet, so we mock it optimistically for the UI
  return {
    id: `prob-${Date.now()}`,
    moduleId,
    name: payload.name,
    domjudgeId: 'N/A',
    difficulty: payload.difficulty,
    attempts: 0
  }
}

export async function getProblem(id: string): Promise<ProblemItem | undefined> {
  return undefined
}

export async function listStudents(classId?: string): Promise<Student[]> {
  if (!classId) return []
  requireAuth()
  const res = await apiFetch(`/teachers/classes/${classId}/students`)
  if (!res.data) return []
  return res.data.map((s: any) => ({
    id: s.id,
    name: s.name || s.username || 'Student',
    email: s.email || '',
    username: s.username || '',
    classId,
    totalSubmissions: s.submissionCount || 0,
    solvedProblems: 0,
    accuracy: 0
  }))
}

export async function getStudent(id: string): Promise<Student | undefined> {
  requireAuth()
  const classes = await listClasses()
  for (const c of classes) {
    try {
      const res = await apiFetch(`/teachers/classes/${c.id}/students`)
      if (res.data) {
        const student = res.data.find((s: any) => s.id === id)
        if (student) {
          return {
            id: student.id,
            name: student.name,
            email: student.email,
            username: student.username,
            classId: c.id,
            totalSubmissions: 0,
            solvedProblems: 0,
            accuracy: 0
          }
        }
      }
    } catch(e) {}
  }
  return undefined
}

// Convert backend submission format to our UI format
function mapSubmission(s: any): Submission {
  return {
    id: s.id,
    studentId: s.student?.id || s.studentId || '',
    classId: s.problem?.module?.classId || s.classId || '',
    moduleId: s.problem?.moduleId || s.moduleId || '',
    problemId: s.problemId || '',
    studentName: s.student?.name || s.student?.username || 'Unknown Student',
    className: s.problem?.module?.class?.name || 'Class',
    moduleName: s.problem?.module?.name || 'Module',
    problemName: s.problem?.name || 'Unknown Problem',
    submissionTime: s.createdAt,
    automaticStatus: s.status as SubmissionStatus,
    verdict: s.verdict === 'CORRECT' ? 'Correct' : s.verdict === 'WRONG_ANSWER' ? 'Wrong Answer' : s.verdict === 'COMPILATION_ERROR' ? 'Compilation Error' : s.verdict === 'RUNTIME_ERROR' ? 'Runtime Error' : 'Processing',
    reviewStatus: s.reviewRequest ? s.reviewRequest.status : 'Not Requested',
    domjudgeId: s.domjudgeSubmissionId || 'N/A',
    generatedCode: s.generatedCode || '',
    flowchartUrl: s.fileUrl || '/flowchart-placeholder.png',
    language: 'Python'
  }
}

export async function listSubmissions(filters: { classId?: string; moduleId?: string; status?: string } = {}): Promise<Submission[]> {
  requireAuth()
  let classesToFetch: string[] = []
  
  if (filters.classId) {
    classesToFetch = [filters.classId]
  } else {
    const classes = await listClasses()
    classesToFetch = classes.map(c => c.id)
  }

  let allSubmissions: Submission[] = []
  
  for (const cid of classesToFetch) {
    try {
      let query = `?limit=100`
      if (filters.status) query += `&status=${filters.status}`
      if (filters.moduleId) query += `&moduleId=${filters.moduleId}`
      const res = await apiFetch(`/teachers/classes/${cid}/submissions${query}`)
      if (res.data?.items) {
        allSubmissions = allSubmissions.concat(res.data.items.map(mapSubmission))
      }
    } catch (e) {
      console.warn('Failed to fetch submissions for class', cid)
    }
  }
  
  return allSubmissions
}

export async function getSubmission(id: string): Promise<Submission | undefined> {
  requireAuth()
  const res = await apiFetch(`/teachers/submissions/${id}`)
  if (!res.data) return undefined
  return mapSubmission(res.data)
}

export async function listReviews(filters: { teacherId?: string; status?: string } = {}): Promise<Review[]> {
  requireAuth()
  let query = '?limit=100'
  if (filters.status) query += `&status=${filters.status}`
  const res = await apiFetch(`/teachers/reviews${query}`)
  if (!res.data?.items) return []
  return res.data.items.map((r: any) => ({
    id: r.id,
    submissionId: r.submissionId,
    teacherId: r.teacherId,
    teacherVerdict: r.teacherVerdict || 'Needs Review',
    feedback: r.feedback || '',
    requestedAt: r.createdAt,
    reviewedAt: r.updatedAt,
    reviewStatus: r.status as ReviewStatus
  }))
}

export async function getReviewBySubmissionId(submissionId: string): Promise<Review | undefined> {
  requireAuth()
  const res = await apiFetch(`/teachers/submissions/${submissionId}`)
  if (!res.data?.reviewRequest) return undefined
  const r = res.data.reviewRequest
  return {
    id: r.id,
    submissionId: r.submissionId,
    teacherId: r.teacherId,
    teacherVerdict: r.teacherVerdict || 'Needs Review',
    feedback: r.feedback || '',
    requestedAt: r.createdAt,
    reviewedAt: r.updatedAt,
    reviewStatus: r.status as ReviewStatus
  }
}

export async function saveReview(submissionId: string, teacherVerdict: 'CORRECT' | 'INCORRECT' | 'NEEDS_CHANGES', feedback: string, status: Review['reviewStatus'] = 'REVIEWED'): Promise<any> {
  requireAuth()
  // First, get the reviewId from the submission
  const review = await getReviewBySubmissionId(submissionId)
  if (!review) throw new Error("No review request found for this submission")
  
  // If we need to start it
  if (review.reviewStatus === 'REQUESTED') {
    await apiFetch(`/teachers/reviews/${review.id}/start`, { method: 'POST' })
  }
  
  // Then complete it
  await apiFetch(`/teachers/reviews/${review.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      teacherVerdict,
      feedback
    })
  })
  
  return { review: await getReviewBySubmissionId(submissionId), submission: await getSubmission(submissionId) }
}

export async function startReview(submissionId: string): Promise<Review | undefined> {
  requireAuth()
  const review = await getReviewBySubmissionId(submissionId)
  if (review && review.reviewStatus === 'REQUESTED') {
    await apiFetch(`/teachers/reviews/${review.id}/start`, { method: 'POST' })
    return getReviewBySubmissionId(submissionId)
  }
  return review
}

export async function getDashboardStats() {
  requireAuth()
  try {
    const res = await apiFetch('/teachers/dashboard')
    if (res && res.data) {
      return {
        totalClasses: res.data.totalClasses || 0,
        totalStudents: res.data.totalStudents || 0,
        activeModules: res.data.activeModules || 0,
        totalSubmissions: res.data.totalSubmissions || 0,
        pendingReviews: res.data.pendingReviews || 0,
      }
    }
  } catch (error) {
    console.warn("Failed to fetch dashboard stats from API, returning default zeros.", error)
  }
  
  return {
    totalClasses: 0,
    totalStudents: 0,
    activeModules: 0,
    totalSubmissions: 0,
    pendingReviews: 0,
  }
}

export async function rejudgeSubmission(id: string): Promise<Submission | undefined> {
  // Not explicitly supported in the Swagger JSON, return current submission
  return getSubmission(id)
}

export async function getSubmissionSubmissionsForProblem(problemId: string): Promise<Submission[]> {
  return []
}

export function isDemoMode() {
  return false
}
