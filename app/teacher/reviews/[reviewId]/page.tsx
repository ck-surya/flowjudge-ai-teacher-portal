import { redirect } from 'next/navigation'

type TeacherReviewRedirectProps = {
  params: Promise<{ reviewId: string }>
}

export default async function TeacherReviewRedirect({ params }: TeacherReviewRedirectProps) {
  const { reviewId } = await params
  redirect(`/submissions/${reviewId}`)
}
