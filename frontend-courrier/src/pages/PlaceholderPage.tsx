import { Construction } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'

interface PlaceholderPageProps {
  title: string
  subtitle?: string
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </span>
        <h5 className="text-base font-semibold text-ink">Module « {title} »</h5>
        <p className="max-w-md text-[0.85rem] text-slate-500">
          Cette page est prête à être branchée sur l'API SGEC. Le socle (layout, thème, routing,
          authentification et permissions) est en place.
        </p>
      </Card>
    </div>
  )
}
