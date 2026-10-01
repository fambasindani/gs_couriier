import { Component, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Card } from './Card'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/** Capture les erreurs de rendu d'une page pour éviter l'écran blanc. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error): void {
    // Visible dans la console du navigateur
    console.error('Erreur de rendu:', error)
  }

  render() {
    if (this.state.error) {
      return (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <h5 className="text-[0.95rem] font-semibold text-ink">
                Une erreur d'affichage est survenue sur cette page
              </h5>
              <p className="mt-1 break-words text-[0.83rem] text-danger">
                {this.state.error.message}
              </p>
              <button
                onClick={() => this.setState({ error: null })}
                className="mt-3 rounded-lg border border-line bg-white px-3 py-1.5 text-[0.8rem] font-medium hover:bg-slate-50"
              >
                Réessayer
              </button>
            </div>
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
