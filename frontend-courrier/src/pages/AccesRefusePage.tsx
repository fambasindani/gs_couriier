import { EmptyState } from '@/components/ui/EmptyState'
import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export function AccesRefusePage() {
  return (
    <div className="mx-auto max-w-md py-20">
      <EmptyState
        icon={<ShieldAlert className="h-8 w-8" />}
        title="Accès refusé"
        description="Vous n'avez pas les droits nécessaires pour consulter cette page."
        action={
          <Link
            to="/"
            className="rounded-lg bg-primary px-4 py-2 text-[0.85rem] font-medium text-white hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        }
      />
    </div>
  )
}