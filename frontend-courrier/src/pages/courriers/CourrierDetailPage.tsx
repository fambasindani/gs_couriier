import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  Download,
  FileText,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  Unlink,
  Upload,
  User as UserIcon,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, ConfidentialiteBadge, StatutBadge } from '@/components/ui/Badge'
import { Field, Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { courriersService } from '@/services/courriers.service'
import { piecesService } from '@/services/pieces.service'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import type { Courrier, CourrierDetail, TimelineItem } from '@/types'

type Tab = 'infos' | 'pieces' | 'workflow' | 'circuit'

const TABS: { key: Tab; label: string }[] = [
  { key: 'infos', label: 'Informations' },
  { key: 'pieces', label: 'Pièces jointes' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'circuit', label: 'Circuit' },
]

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="block text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="mt-0.5 block text-[0.88rem] text-ink">{value ?? '—'}</span>
    </div>
  )
}

export function CourrierDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const [courrier, setCourrier] = useState<CourrierDetail | null>(null)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [timelineLoading, setTimelineLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('infos')
  const [actionError, setActionError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [archiveOpen, setArchiveOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [linkQuery, setLinkQuery] = useState('')
  const [linkResults, setLinkResults] = useState<Courrier[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)

    courriersService
      .show(id)
      .then((res) => {
        if (active) {
          setCourrier(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de chargement.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    setTimelineLoading(true)
    courriersService
      .timeline(id)
      .then((res) => {
        if (active) setTimeline(res.data.timeline ?? [])
      })
      .catch(() => {
        if (active) setTimeline([])
      })
      .finally(() => {
        if (active) setTimelineLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, reloadKey])

  useEffect(() => {
    const term = linkQuery.trim()
    if (term.length < 2) {
      setLinkResults([])
      return
    }
    let active = true
    courriersService
      .list({ search: term, per_page: 5 })
      .then((res) => {
        if (active) setLinkResults(res.data.data.filter((item) => String(item.id) !== id))
      })
      .catch(() => {
        if (active) setLinkResults([])
      })
    return () => {
      active = false
    }
  }, [linkQuery, id])

  const pieces = courrier?.pieces ?? []

  const actions = useMemo(
    () => ({
      modifier: hasPermission('courriers.update'),
      supprimer: hasPermission('courriers.delete'),
    }),
    [hasPermission],
  )

  const refresh = () => setReloadKey((value) => value + 1)

  const handleArchive = async () => {
    if (!courrier) return
    setActionError(null)
    try {
      await courriersService.archiver(courrier.id)
      setArchiveOpen(false)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de l'archivage.")
    }
  }

  const handleLink = async (parentId: number) => {
    if (!courrier) return
    setActionError(null)
    try {
      await courriersService.lier(courrier.id, parentId)
      setLinkOpen(false)
      setLinkQuery('')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la liaison.')
    }
  }

  const handleUnlink = async () => {
    if (!courrier) return
    setActionError(null)
    try {
      await courriersService.delier(courrier.id)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la déliaison.')
    }
  }

  const handleDelete = async () => {
    if (!courrier) return
    try {
      await courriersService.remove(courrier.id)
      navigate('/courriers', { replace: true })
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  const handleUpload = async (file: File) => {
    if (!courrier) return
    setActionError(null)
    try {
      await piecesService.upload(courrier.id, file)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Erreur lors de l'upload.")
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDeletePiece = async (pieceId: number) => {
    try {
      await piecesService.remove(pieceId)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <TimelineSkeleton rows={5} />
      </Card>
    )
  }

  if (error || !courrier) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="Courrier introuvable"
          description={error ?? "Impossible de charger ce courrier."}
          action={
            <Link to="/courriers">
              <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
                Retour à la liste
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <div>
      <PageHeader
        title={courrier.numero}
        subtitle={courrier.objet}
        actions={
          <>
            <Link to="/courriers">
              <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Retour
              </Button>
            </Link>
            {actions.modifier && (
              <Link to={`/courriers/${courrier.id}/modifier`}>
                <Button variant="outline" icon={<Pencil className="h-4 w-4" />}>
                  Modifier
                </Button>
              </Link>
            )}
            {actions.modifier && (
              <Button
                variant="outline"
                icon={<Archive className="h-4 w-4" />}
                onClick={() => setArchiveOpen(true)}
              >
                Archiver
              </Button>
            )}
            {actions.supprimer && (
              <Button
                variant="danger"
                icon={<Trash2 className="h-4 w-4" />}
                onClick={() => setDeleteOpen(true)}
              >
                Supprimer
              </Button>
            )}
          </>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {actionError}
        </div>
      )}

      {/* En-tête */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="primary">{courrier.type_courrier?.libelle ?? 'Type'}</Badge>
          <StatutBadge code={courrier.statut?.code} libelle={courrier.statut?.libelle} />
          <ConfidentialiteBadge value={courrier.confidentialite} />
          {courrier.priorite && <Badge tone="warning">{courrier.priorite.libelle}</Badge>}
        </div>
      </Card>

      {/* Onglets */}
      <div className="mt-5 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[0.85rem] font-medium transition-colors ${
              tab === item.key
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Informations */}
      {tab === 'infos' && (
        <Card className="mt-5 p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <InfoRow label="Référence externe" value={courrier.reference_externe} />
            <InfoRow label="Type" value={courrier.type_courrier?.libelle} />
            <InfoRow label="Catégorie" value={courrier.categorie?.libelle} />
            <InfoRow label="Priorité" value={courrier.priorite?.libelle} />
            <InfoRow label="Statut" value={courrier.statut?.libelle} />
            <InfoRow label="Expéditeur" value={courrier.expediteur?.nom} />
            <InfoRow label="Destinataire" value={courrier.destinataire?.nom} />
            <InfoRow label="Date du courrier" value={formatDate(courrier.date_courrier)} />
            <InfoRow label="Date de réception" value={formatDate(courrier.date_reception, true)} />
            <InfoRow label="Date limite" value={formatDate(courrier.date_limite, true)} />
            <InfoRow label="Date de clôture" value={formatDate(courrier.date_cloture, true)} />
            <InfoRow label="Créé par" value={courrier.createur?.name} />
          </div>
          {courrier.contenu && (
            <div className="mt-5 border-t border-line pt-5">
              <span className="mb-1 block text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400">
                Contenu
              </span>
              <p className="whitespace-pre-line text-[0.88rem] text-slate-600">{courrier.contenu}</p>
            </div>
          )}
        </Card>
      )}

      {/* Pièces */}
      {tab === 'pieces' && (
        <Card className="mt-5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h6 className="section-title mb-0">Pièces jointes ({pieces.length})</h6>
            {actions.modifier && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void handleUpload(file)
                  }}
                />
                <Button
                  icon={<Upload className="h-4 w-4" />}
                  onClick={() => fileRef.current?.click()}
                >
                  Ajouter
                </Button>
              </>
            )}
          </div>

          {pieces.length === 0 ? (
            <EmptyState
              icon={<Paperclip className="h-6 w-6" />}
              title="Aucune pièce jointe"
              description="Ajoutez des fichiers numérisés à ce courrier."
            />
          ) : (
            <ul className="divide-y divide-line">
              {pieces.map((piece) => (
                <li key={piece.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-[0.85rem] font-medium text-ink">
                        {piece.nom_original}
                        {piece.est_principal && (
                          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                            PRINCIPAL
                          </span>
                        )}
                      </span>
                      <span className="text-[0.75rem] text-slate-400">
                        {formatDate(piece.created_at, true)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => void piecesService.download(piece.id, piece.nom_original)}
                      className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {actions.modifier && (
                      <button
                        onClick={() => void handleDeletePiece(piece.id)}
                        className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {/* Workflow */}
      {tab === 'workflow' && (
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="p-5">
            <h6 className="section-title">Affectations ({(courrier.affectations ?? []).length})</h6>
            {(courrier.affectations ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucune affectation.</p>
            ) : (
              <ul className="space-y-3">
                {(courrier.affectations ?? []).map((item) => (
                  <li key={item.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.83rem] font-medium text-ink">
                        {item.direction?.libelle ?? item.departement?.libelle ?? item.service?.libelle ?? '—'}
                      </span>
                      <Badge tone="info">{item.statut}</Badge>
                    </div>
                    <span className="mt-1 block text-[0.75rem] text-slate-400">
                      {formatDate(item.date_affectation, true)}
                      {item.user?.name ? ` • ${item.user.name}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h6 className="section-title">Annotations ({(courrier.annotations ?? []).length})</h6>
            {(courrier.annotations ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucune annotation.</p>
            ) : (
              <ul className="space-y-3">
                {(courrier.annotations ?? []).map((item) => (
                  <li key={item.id} className="rounded-lg border border-line p-3">
                    <p className="text-[0.83rem] text-slate-600">{item.annotation}</p>
                    <span className="mt-1 flex items-center gap-1 text-[0.75rem] text-slate-400">
                      <UserIcon className="h-3 w-3" /> {item.user?.name ?? 'Système'} •{' '}
                      {formatDate(item.created_at, true)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h6 className="section-title">Validations ({(courrier.validations ?? []).length})</h6>
            {(courrier.validations ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucune validation.</p>
            ) : (
              <ul className="space-y-3">
                {(courrier.validations ?? []).map((item) => (
                  <li key={item.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.83rem] font-medium text-ink">
                        {item.user?.name ?? 'Système'}
                      </span>
                      <Badge tone={item.decision === 'REJETE' ? 'danger' : 'success'}>
                        {item.decision}
                      </Badge>
                    </div>
                    {item.commentaire && (
                      <p className="mt-1 text-[0.78rem] text-slate-500">{item.commentaire}</p>
                    )}
                    <span className="mt-1 block text-[0.75rem] text-slate-400">
                      {formatDate(item.date_validation ?? item.created_at, true)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {/* Circuit */}
      {tab === 'circuit' && (
        <Card className="mt-5 p-5">
          <h6 className="section-title">Circuit de traitement</h6>
          {timelineLoading ? (
            <TimelineSkeleton rows={5} />
          ) : timeline.length === 0 ? (
            <p className="text-[0.83rem] text-slate-400">Aucune étape enregistrée.</p>
          ) : (
            <div className="text-[0.85rem]">
              {timeline.map((item, index) => (
                <div key={index} className="timeline-item">
                  <span className="block font-semibold text-ink">{item.titre}</span>
                  <span className="block text-[0.78rem] text-slate-500">{item.description}</span>
                  <span className="text-[0.75rem] text-slate-400">
                    {item.auteur} • {item.date}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Actions liées */}
      <Card className="mt-5 flex flex-wrap items-center gap-3 p-4">
        <span className="text-[0.85rem] font-semibold text-ink">Courriers liés :</span>
        {courrier.parent ? (
          <>
            <Link
              to={`/courriers/${courrier.parent.id}`}
              className="text-[0.84rem] font-medium text-primary hover:underline"
            >
              Parent : {courrier.parent.numero}
            </Link>
            {actions.modifier && (
              <Button variant="ghost" icon={<Unlink className="h-4 w-4" />} onClick={handleUnlink}>
                Délier
              </Button>
            )}
          </>
        ) : (
          actions.modifier && (
            <Button variant="outline" icon={<Link2 className="h-4 w-4" />} onClick={() => setLinkOpen(true)}>
              Lier à un courrier parent
            </Button>
          )
        )}
        <span className="text-[0.84rem] text-slate-500">
          {(courrier.reponses ?? []).length} réponse(s)
        </span>
      </Card>

      {/* Modal archivage */}
      <Modal
        open={archiveOpen}
        title={`Archiver ${courrier.numero}`}
        size="sm"
        onClose={() => setArchiveOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleArchive}>Archiver</Button>
          </>
        }
      >
        <p className="text-[0.85rem] text-slate-600">
          Le courrier sera marqué comme archivé et une cote d'archive sera générée.
        </p>
      </Modal>

      {/* Modal liaison */}
      <Modal
        open={linkOpen}
        title="Lier à un courrier parent"
        onClose={() => setLinkOpen(false)}
        footer={
          <Button variant="outline" onClick={() => setLinkOpen(false)}>
            Fermer
          </Button>
        }
      >
        <Field label="Rechercher un courrier (numéro, référence, objet)">
          <Input
            value={linkQuery}
            onChange={(event) => setLinkQuery(event.target.value)}
            placeholder="Saisir au moins 2 caractères..."
          />
        </Field>
        <ul className="mt-3 divide-y divide-line">
          {linkResults.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleLink(item.id)}
                className="flex w-full items-center justify-between gap-2 py-2.5 text-left hover:bg-slate-50"
              >
                <span>
                  <span className="block text-[0.83rem] font-semibold text-primary">
                    {item.numero}
                  </span>
                  <span className="block text-[0.78rem] text-slate-500">{item.objet}</span>
                </span>
                <Plus className="h-4 w-4 text-slate-400" />
              </button>
            </li>
          ))}
          {linkQuery.trim().length >= 2 && linkResults.length === 0 && (
            <li className="py-3 text-center text-[0.8rem] text-slate-400">Aucun résultat.</li>
          )}
        </ul>
      </Modal>

      {/* Modal suppression */}
      <Modal
        open={deleteOpen}
        title="Supprimer le courrier"
        size="sm"
        onClose={() => setDeleteOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-[0.85rem] text-slate-600">
          Confirmez-vous la suppression définitive de{' '}
          <span className="font-semibold text-ink">{courrier.numero}</span> ?
        </p>
      </Modal>
    </div>
  )
}
