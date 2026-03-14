import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  redirect(`/crm/${id}`)
}
