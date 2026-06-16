import { Hammer } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import EmptyState from '@/components/common/EmptyState'

/** Temporary placeholder for pages still being built out. */
export default function ComingSoon({ title, subtitle, note }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <EmptyState
        icon={Hammer}
        title="Coming together"
        description={note ?? 'This page is being built. The foundation, API layer, and design system are ready.'}
      />
    </div>
  )
}
