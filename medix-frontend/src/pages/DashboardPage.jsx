import ComingSoon from '@/components/common/ComingSoon'
import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <ComingSoon
      title={`Welcome, ${user?.name?.split(' ')[0] ?? 'there'}`}
      subtitle="Your health overview will live here."
      note="The dashboard — stats, biomarker cards, today's medications and trends — is the next page to be built."
    />
  )
}
