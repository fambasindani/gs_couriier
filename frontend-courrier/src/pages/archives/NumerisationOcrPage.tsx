import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, FileScan, FileText, RotateCcw, Search, ScanLine } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { piecesService } from '@/services/pieces.service'
import { formatDate } from '@/lib/utils'
import { useConfirm } from '@/stores/confirm.store'
import type { CourrierPiece } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const CLIENT_PER_PAGE = 10

function tailleLisible(bytes?: number | null): string {
  const value = bytes ?? 0
  if (value < 1024) return `${value} B`
  if (value < 1048576) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1048576).toFixed(1)} MB`
}

function hasOcr(piece: CourrierPiece): boolean {
  return Boolean(piece.texte_ocr && piece.texte_ocr.trim().length > 0)
}

export function NumerisationOcrPage() {
  const confirm = useConfirm()
  const [items, setItems] = useState<CourrierPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [search, setSearch] = useState('')
  const [ocrFilter, setOcrFilter] = useState('')
  const [page, setPage] = useState(1)
  const [preview, setPreview] = useState<CourrierPiece | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setItems([])
      setLoading(false)
      return
    }

    piecesService
      .list({ per_page: 100 })
      .then((res) => {
        if (active) {
          setItems(res.data.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de chargement.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  useEffect(() => {
    setPage(1)
  }, [search, ocrFilter])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter((piece) => {
      if (ocrFilter === 'INDEXE' && !hasOcr(piece)) return false
      if (ocrFilter === 'EN_ATTENTE' && hasOcr(piece)) return false
      if (!term) return true
      return `${piece.nom_original} ${piece.courrier?.numero ?? ''}`.toLowerCase().includes(term)
    })
  }, [items, search, ocrFilter])

  const handleDownload = async (piece: CourrierPiece) => {
    const ok = await confirm({
      title: 'Télécharger la pièce',
      message: `Télécharger « ${piece.nom_original} » ?`,
      confirmLabel: 'Télécharger',
    })
    if (!ok) return
    try {
      await piecesService.download(piece.id, piece.nom_original)
    } catch {
      /* silencieux */
    }
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / CLIENT_PER_PAGE))
  const pageItems = filtered.slice((page - 1) * CLIENT_PER_PAGE, page * CLIENT_PER_PAGE)
  const indexedCount = items.filter(hasOcr).length

  return (
    <div>
      <PageHeader
        title="Numérisation & OCR"
        subtitle="Suivi de l'indexation OCR des pièces numérisées (service FastAPI)."
        actions={
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5 text-[0.8rem] font-medium hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Actualiser
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      {/* Compteurs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card className="p-4">
          <span className="text-[0.78rem] font-semibold text-slate-500">Pièces numérisées</span>
          <p className="mt-1 text-2xl font-bold text-ink">{items.length}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[0.78rem] font-semibold text-slate-500">OCR indexé</span>
          <p className="mt-1 text-2xl font-bold text-success">{indexedCount}</p>
        </Card>
        <Card className="p-4">
          <span className="text-[0.78rem] font-semibold text-slate-500">En attente d'OCR</span>
          <p className="mt-1 text-2xl font-bold text-warning">{items.length - indexedCount}</p>
        </Card>
      </div>

      <Card className="mt-5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (fichier, numéro de courrier)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={ocrFilter} onChange={(event) => setOcrFilter(event.target.value)}>
            <option value="">Tout l'état OCR</option>
            <option value="INDEXE">OCR indexé</option>
            <option value="EN_ATTENTE">En attente d'OCR</option>
          </Select>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Courrier</th>
                <th>Fichier</th>
                <th>Type</th>
                <th>Taille</th>
                <th>OCR</th>
                <th>Ajouté le</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={7} />}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={<FileScan className="h-6 w-6" />}
                      title="Aucune pièce"
                      description="Les pièces numérisées des courriers apparaîtront ici."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                pageItems.map((piece) => (
                  <tr key={piece.id}>
                    <td className="font-semibold text-primary">
                      {piece.courrier ? (
                        <Link to={`/courriers/${piece.courrier.id}`} className="hover:underline">
                          {piece.courrier.numero}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="max-w-[280px]">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span className="truncate">{piece.nom_original}</span>
                      </span>
                    </td>
                    <td className="text-slate-500">{piece.extension?.toUpperCase() ?? '—'}</td>
                    <td>{tailleLisible(piece.taille)}</td>
                    <td>
                      {hasOcr(piece) ? (
                        <Badge tone="success">INDEXÉ</Badge>
                      ) : (
                        <Badge tone="warning">EN ATTENTE</Badge>
                      )}
                    </td>
                    <td>{formatDate(piece.created_at, true)}</td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => setPreview(piece)}
                          className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                          title="Voir l'OCR"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => void handleDownload(piece)}
                          className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {filtered.length > CLIENT_PER_PAGE && (
          <div className="mt-4 flex items-center justify-between text-[0.8rem] text-slate-500">
            <span>
              {filtered.length} pièce(s) — page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(preview)}
        title={`OCR — ${preview?.nom_original ?? ''}`}
        size="lg"
        onClose={() => setPreview(null)}
        footer={
          <Button variant="outline" onClick={() => setPreview(null)}>
            Fermer
          </Button>
        }
      >
        <div className="mb-3 flex items-center gap-2 text-[0.8rem] text-slate-500">
          <ScanLine className="h-4 w-4" />
          {preview && hasOcr(preview)
            ? 'Texte extrait automatiquement (peut contenir des erreurs).'
            : "Cette pièce n'a pas encore été indexée par le service OCR."}
        </div>
        {preview && hasOcr(preview) ? (
          <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-4 text-[0.8rem] text-slate-700">
            {preview.texte_ocr}
          </pre>
        ) : (
          <EmptyState
            icon={<ScanLine className="h-6 w-6" />}
            title="Aucun texte OCR"
            description="Lancez l'OCR (FastAPI) pour extraire le contenu de cette pièce."
          />
        )}
      </Modal>
    </div>
  )
}
