import { redirect } from 'next/navigation'

type TeacherSubmissionProps = {
  params: Promise<{ submissionId: string }>
}

export default async function TeacherSubmissionRedirect({ params }: TeacherSubmissionProps) {
  const { submissionId } = await params
  redirect(`/submissions/${submissionId}`)
}
