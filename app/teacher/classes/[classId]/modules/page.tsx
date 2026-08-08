import { redirect } from 'next/navigation'

type TeacherModulesProps = {
  params: Promise<{ classId: string }>
}

export default async function TeacherModulesRedirect({ params }: TeacherModulesProps) {
  const { classId } = await params
  redirect(`/classes/${classId}`)
}
