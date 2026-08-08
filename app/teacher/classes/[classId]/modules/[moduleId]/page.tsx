import { redirect } from 'next/navigation'

type TeacherModuleRedirectProps = {
  params: Promise<{ classId: string; moduleId: string }>
}

export default async function TeacherModuleRedirect({ params }: TeacherModuleRedirectProps) {
  const { classId, moduleId } = await params
  redirect(`/classes/${classId}/modules/${moduleId}`)
}
