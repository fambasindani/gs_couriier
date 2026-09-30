import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function NotFoundPage() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-5xl font-bold text-primary">404</h1>
      <p className="text-[0.9rem] text-slate-500">La page que vous recherchez est introuvable.</p>
      <Link to="/">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </Card>
  )
}
