import { redirect } from 'next/navigation'

type TeacherClassRedirectProps = {
  params: Promise<{ classId: string }>
}

export default async function TeacherClassRedirect({ params }: TeacherClassRedirectProps) {
  const { classId } = await params
  redirect(`/classes/${classId}`)
}
