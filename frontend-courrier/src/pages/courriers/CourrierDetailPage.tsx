import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Archive,
  CheckCheck,
  Copy,
  Download,
  FileCheck,
  FileText,
  Link2,
  MailPlus,
  Paperclip,
  Pencil,
  Plus,
  Printer,
  Trash2,
  Unlink,
  Upload,
  User as UserIcon,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, ConfidentialiteBadge, StatutBadge } from '@/components/ui/Badge'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { courriersService } from '@/services/courriers.service'
import { piecesService } from '@/services/pieces.service'
import { affectationsService } from '@/services/traitement.service'
import { lettreModelesService } from '@/services/lettres.service'
import { nomFichierLettre, telechargerBlob } from '@/lib/lettreFichiers'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import { useToast } from '@/stores/toast.store'
import { transitionsAutorisees } from '@/lib/statuts'
import { projetStatutLabel, projetStatutTone } from '@/lib/projetStatuts'
import type {
  Courrier,
  CourrierAffectation,
  CourrierDetail,
  CourrierPiece,
  LettreGeneree,
  LettreModele,
  TimelineItem,
} from '@/types'

type Tab = 'infos' | 'pieces' | 'workflow' | 'circuit'

const TABS: { key: Tab; label: string }[] = [
  { key: 'infos', label: 'Informations' },
  { key: 'pieces', label: 'Pièces jointes' },
  { key: 'workflow', label: 'Traitement' },
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
  const confirm = useConfirm()
  const toast = useToast()

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
  const [unlinkOpen, setUnlinkOpen] = useState(false)
  const [pieceToDelete, setPieceToDelete] = useState<CourrierPiece | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)
  const [lettreOpen, setLettreOpen] = useState(false)
  const [lettreModeles, setLettreModeles] = useState<LettreModele[]>([])
  const [lettreModeleId, setLettreModeleId] = useState('')
  const [lettre, setLettre] = useState<LettreGeneree | null>(null)
  const [lettreBusy, setLettreBusy] = useState(false)
  const [lettreError, setLettreError] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [accuseBusy, setAccuseBusy] = useState(false)
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
      affecter: hasPermission('courriers.affecter'),
      annuler: hasPermission('courriers.annuler'),
    }),
    [hasPermission],
  )

  const isArchived = courrier?.statut?.code === 'ARCHIVE'

  // Rafraîchissement automatique (accusé de réception / traçabilité en temps réel)
  useEffect(() => {
    const timer = setInterval(() => { if (document.visibilityState === 'visible') setReloadKey((value) => value + 1) }, 30000)
    return () => clearInterval(timer)
  }, [])

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

  const handleCloturer = async () => {
    if (!courrier) return
    const ok = await confirm({
      title: 'Clôturer le courrier',
      message: (
        <>
          Clôturer <span className="font-semibold text-ink">{courrier.numero}</span> ? Le dossier sera
          marqué comme clôturé (date de clôture enregistrée).
        </>
      ),
      confirmLabel: 'Clôturer',
    })
    if (!ok) return

    setActionError(null)
    try {
      await courriersService.cloturer(courrier.id)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la clôture.')
    }
  }

  const handleAnnulerCourrier = async () => {
    if (!courrier) return
    const ok = await confirm({
      title: 'Annuler le courrier',
      message: `Annuler ${courrier.numero} ? (permission dédiée requise)`,
      confirmLabel: 'Annuler',
      tone: 'danger',
    })
    if (!ok) return
    setActionError(null)
    try {
      await courriersService.annuler(courrier.id)
      toast('Courrier annulé')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de l’annulation.')
    }
  }

  const handleAccuserReception = async (affectation: CourrierAffectation) => {
    if (!courrier) return
    const ok = await confirm({
      title: 'Accuser réception',
      message: `Confirmer la réception du courrier ${courrier.numero} par votre service ?`,
      confirmLabel: 'Accuser',
    })
    if (!ok) return
    setActionError(null)
    try {
      await affectationsService.accuserReception(affectation.id)
      toast('Réception accusée')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de l’accusé de réception.')
    }
  }

  const texteLettre = (l: LettreGeneree) => (l.objet ? `${l.objet}\n\n` : '') + l.corps

  const openLettre = async () => {
    setLettreOpen(true)
    setLettre(null)
    setLettreError(null)
    setLettreModeleId('')
    try {
      const res = await lettreModelesService.list({ actif: 1, per_page: 100 })
      setLettreModeles(res.data.data.filter((m) => m.actif))
    } catch {
      setLettreModeles([])
    }
  }

  const handleGenererLettre = async () => {
    if (!courrier || !lettreModeleId) return
    setLettreBusy(true)
    setLettreError(null)
    try {
      const res = await courriersService.genererLettre(courrier.id, Number(lettreModeleId))
      setLettre(res.data)
    } catch (err) {
      setLettreError(err instanceof Error ? err.message : 'Erreur lors de la génération.')
    } finally {
      setLettreBusy(false)
    }
  }

  const handleCopyLettre = async () => {
    if (!lettre) return
    try {
      await navigator.clipboard.writeText(texteLettre(lettre))
    } catch {
      /* presse-papiers indisponible */
    }
  }

  const handleTelechargerPdf = async () => {
    if (!lettre || !courrier) return
    setExportBusy(true)
    setLettreError(null)
    try {
      const { genererLettrePdfBlob } = await import('@/lib/lettrePdf')
      const blob = await genererLettrePdfBlob(lettre.objet, lettre.corps, courrier.numero)
      telechargerBlob(blob, nomFichierLettre(lettre.objet ?? courrier.numero, 'pdf'))
      toast('PDF généré')
    } catch {
      setLettreError('Erreur lors de la génération du PDF.')
    } finally {
      setExportBusy(false)
    }
  }

  const handleTelechargerWord = async () => {
    if (!lettre || !courrier) return
    setExportBusy(true)
    setLettreError(null)
    try {
      const { genererLettreDocxBlob } = await import('@/lib/lettreDocx')
      const blob = await genererLettreDocxBlob(lettre.objet, lettre.corps, courrier.numero)
      telechargerBlob(blob, nomFichierLettre(lettre.objet ?? courrier.numero, 'docx'))
      toast('Fichier Word généré')
    } catch {
      setLettreError('Erreur lors de la génération du fichier Word.')
    } finally {
      setExportBusy(false)
    }
  }

  const handleEnregistrerPiece = async () => {
    if (!lettre || !courrier) return
    setExportBusy(true)
    setLettreError(null)
    try {
      const { genererLettrePdfBlob } = await import('@/lib/lettrePdf')
      const blob = await genererLettrePdfBlob(lettre.objet, lettre.corps, courrier.numero)
      const nom = nomFichierLettre(lettre.objet ?? courrier.numero, 'pdf')
      const file = new File([blob], nom, { type: 'application/pdf' })
      await piecesService.upload(courrier.id, file)
      refresh()
    } catch (err) {
      setLettreError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
    } finally {
      setExportBusy(false)
    }
  }

  const handleAccuse = async () => {
    if (!courrier) return
    const ok = await confirm({
      title: 'Accusé de réception',
      message: `Générer l'accusé de réception de ${courrier.numero} (PDF avec QR code) ?`,
      confirmLabel: 'Générer',
    })
    if (!ok) return

    setAccuseBusy(true)
    setActionError(null)
    try {
      const { genererAccusePdfBlob } = await import('@/lib/accusePdf')
      const blob = await genererAccusePdfBlob({
        numero: courrier.numero,
        reference_externe: courrier.reference_externe ?? null,
        objet: courrier.objet,
        expediteur: courrier.expediteur?.nom ?? null,
        destinataire: courrier.destinataire?.nom ?? null,
        type: courrier.type_courrier?.libelle ?? null,
        confidentialite: courrier.confidentialite,
        date_reception: formatDate(courrier.date_reception, true),
        verifyUrl: `${window.location.origin}/courrier/courriers/${courrier.id}`,
      })
      telechargerBlob(blob, `accuse_reception_${courrier.numero}.pdf`)
      toast('Accusé de réception généré')
    } catch {
      setActionError("Erreur lors de la génération de l'accusé de réception.")
    } finally {
      setAccuseBusy(false)
    }
  }

  const handlePrintLettre = () => {
    if (!lettre) return
    const w = window.open('', '_blank', 'width=820,height=920')
    if (!w) return
    w.document.write(
      '<html><head><title>Lettre</title><style>body{font-family:Inter,Arial,sans-serif;padding:40px;font-size:14px;line-height:1.5}</style></head><body><pre id="l" style="white-space:pre-wrap;font-family:inherit;margin:0"></pre></body></html>',
    )
    w.document.close()
    const pre = w.document.getElementById('l')
    if (pre) pre.textContent = texteLettre(lettre)
    w.focus()
    w.print()
  }

  const handleLink = async (parent: Courrier) => {
    if (!courrier) return
    const ok = await confirm({
      title: 'Lier le courrier',
      message: (
        <>
          Lier <span className="font-semibold text-ink">{courrier.numero}</span> au courrier parent{' '}
          <span className="font-semibold text-ink">{parent.numero}</span> ?
        </>
      ),
      confirmLabel: 'Lier',
    })
    if (!ok) return

    setActionError(null)
    try {
      await courriersService.lier(courrier.id, parent.id)
      setLinkOpen(false)
      setLinkQuery('')
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la liaison.')
    }
  }

  const handleDownload = async (piece: CourrierPiece) => {
    const ok = await confirm({
      title: 'Télécharger la pièce',
      message: `Télécharger « ${piece.nom_original} » ?`,
      confirmLabel: 'Télécharger',
    })
    if (!ok) return
    try {
      await piecesService.download(piece.id, piece.nom_original)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors du téléchargement.')
    }
  }

  const handleUnlink = async () => {
    if (!courrier) return
    setActionError(null)
    setConfirmBusy(true)
    try {
      await courriersService.delier(courrier.id)
      setUnlinkOpen(false)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la déliaison.')
      setUnlinkOpen(false)
    } finally {
      setConfirmBusy(false)
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

  const handleDeletePiece = async () => {
    if (!pieceToDelete) return
    setActionError(null)
    setConfirmBusy(true)
    try {
      await piecesService.remove(pieceToDelete.id)
      setPieceToDelete(null)
      refresh()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setPieceToDelete(null)
    } finally {
      setConfirmBusy(false)
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
            <Button variant="outline" icon={<MailPlus className="h-4 w-4" />} onClick={openLettre}>
              Lettre
            </Button>
            <Button
              variant="outline"
              icon={<FileText className="h-4 w-4" />}
              onClick={() => navigate(`/projets-lettres?courrier_id=${courrier.id}`)}
            >
              Projet de lettre
            </Button>
            <Button
              variant="outline"
              icon={<FileCheck className="h-4 w-4" />}
              onClick={handleAccuse}
              disabled={accuseBusy}
            >
              Accusé
            </Button>
            {actions.modifier && !isArchived && (
              <Link to={`/courriers/${courrier.id}/modifier`}>
                <Button variant="outline" icon={<Pencil className="h-4 w-4" />}>
                  Modifier
                </Button>
              </Link>
            )}
            {actions.modifier &&
              !isArchived &&
              transitionsAutorisees(courrier.statut?.code).includes('CLOTURE') && (
                <Button
                  variant="outline"
                  icon={<CheckCheck className="h-4 w-4" />}
                  onClick={handleCloturer}
                >
                  Clôturer
                </Button>
              )}
            {actions.modifier && !isArchived && (
              <Button
                variant="outline"
                icon={<Archive className="h-4 w-4" />}
                onClick={() => setArchiveOpen(true)}
              >
                Archiver
              </Button>
            )}
            {actions.annuler && courrier.statut?.code !== 'ARCHIVE' && courrier.statut?.code !== 'ANNULE' && (
              <Button
                variant="danger"
                icon={<XCircle className="h-4 w-4" />}
                onClick={handleAnnulerCourrier}
              >
                Annuler
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

      {isArchived && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-[0.85rem] text-warning">
          <Archive className="h-4 w-4 flex-shrink-0" />
          Ce courrier est archivé : il ne peut plus être modifié ni archivé à nouveau.
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
                      onClick={() => void handleDownload(piece)}
                      className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                      title="Télécharger"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {actions.modifier && (
                      <button
                        onClick={() => setPieceToDelete(piece)}
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
                {(courrier.affectations ?? []).map((item) => {
                  const cible =
                    [item.direction?.libelle, item.departement?.libelle, item.service?.libelle]
                      .filter(Boolean)
                      .join(' › ') || '—'
                  return (
                    <li key={item.id} className="rounded-lg border border-line p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.83rem] font-medium text-ink">{cible}</span>
                        <Badge tone="info">{item.statut}</Badge>
                      </div>
                      <span className="mt-1 block text-[0.75rem] text-slate-500">
                        {item.user ? `Agent : ${item.user.name}` : 'Aucun agent assigné'}
                      </span>
                      <span className="mt-0.5 block text-[0.75rem] text-slate-400">
                        Affecté le {formatDate(item.date_affectation, true)}
                        {item.date_limite ? ` • Limite : ${formatDate(item.date_limite, true)}` : ''}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        {item.date_accuse_reception ? (
                          <span className="text-[0.72rem] font-medium text-success">
                            ✓ Reçu le {formatDate(item.date_accuse_reception, true)}
                          </span>
                        ) : (
                          actions.affecter && (
                            <button
                              onClick={() => void handleAccuserReception(item)}
                              className="rounded border border-success/30 bg-success/10 px-2 py-1 text-[0.72rem] font-semibold text-success hover:bg-success/15"
                            >
                              Accuser réception
                            </button>
                          )
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <h6 className="section-title">Instructions ({(courrier.annotations ?? []).length})</h6>
            {(courrier.annotations ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucune instruction.</p>
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

          <Card className="p-5">
            <h6 className="section-title">
              Projets de lettres ({(courrier.projets ?? []).length + (courrier.projets_sortants ?? []).length})
            </h6>
            {(courrier.projets ?? []).length === 0 && (courrier.projets_sortants ?? []).length === 0 ? (
              <p className="text-[0.83rem] text-slate-400">Aucun projet de lettre lié.</p>
            ) : (
              <ul className="space-y-2">
                {[...(courrier.projets ?? []), ...(courrier.projets_sortants ?? [])].map((projet) => (
                  <li key={projet.id} className="rounded-lg border border-line p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        to={`/projets-lettres/${projet.id}`}
                        className="text-[0.83rem] font-semibold text-primary hover:underline"
                      >
                        {projet.reference_projet}
                      </Link>
                      <Badge tone={projetStatutTone(projet.statut)}>
                        {projetStatutLabel(projet.statut)}
                      </Badge>
                    </div>
                    <span className="mt-1 block text-[0.78rem] text-slate-500">{projet.objet}</span>
                    <span className="mt-0.5 block text-[0.72rem] text-slate-400">
                      {(projet.versions ?? []).length} version(s) •{' '}
                      {formatDate(projet.date_creation, true)}
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
              <Button
                variant="ghost"
                icon={<Unlink className="h-4 w-4" />}
                onClick={() => setUnlinkOpen(true)}
              >
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
                onClick={() => void handleLink(item)}
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

      <ConfirmDialog
        open={unlinkOpen}
        title="Délier le courrier"
        confirmLabel="Délier"
        loading={confirmBusy}
        message={
          <>
            Confirmez-vous la déliaison de <span className="font-semibold text-ink">{courrier.numero}</span>{' '}
            de son courrier parent ?
          </>
        }
        onConfirm={handleUnlink}
        onClose={() => setUnlinkOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(pieceToDelete)}
        title="Supprimer la pièce jointe"
        tone="danger"
        confirmLabel="Supprimer"
        loading={confirmBusy}
        message={
          <>
            Confirmez-vous la suppression de{' '}
            <span className="font-semibold text-ink">{pieceToDelete?.nom_original}</span> ? Le fichier
            sera définitivement supprimé.
          </>
        }
        onConfirm={handleDeletePiece}
        onClose={() => setPieceToDelete(null)}
      />

      {/* Générer un projet de lettre */}
      <Modal
        open={lettreOpen}
        title={`Générer une lettre — ${courrier.numero}`}
        size="lg"
        onClose={() => setLettreOpen(false)}
        footer={
          lettre ? (
            <>
              <Button
                variant="outline"
                icon={<Copy className="h-4 w-4" />}
                onClick={handleCopyLettre}
              >
                Copier
              </Button>
              <Button
                variant="outline"
                icon={<Download className="h-4 w-4" />}
                onClick={handleTelechargerPdf}
                disabled={exportBusy}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                icon={<FileText className="h-4 w-4" />}
                onClick={handleTelechargerWord}
                disabled={exportBusy}
              >
                Word
              </Button>
              <Button
                variant="outline"
                icon={<Upload className="h-4 w-4" />}
                onClick={handleEnregistrerPiece}
                disabled={exportBusy}
              >
                Enregistrer
              </Button>
              <Button icon={<Printer className="h-4 w-4" />} onClick={handlePrintLettre}>
                Imprimer
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setLettreOpen(false)}>
              Fermer
            </Button>
          )
        }
      >
        {lettreError && (
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {lettreError}
          </div>
        )}
        <div className="space-y-4">
          <Field label="Modèle de lettre" required>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={lettreModeleId}
                onChange={(event) => setLettreModeleId(event.target.value)}
              >
                <option value="">— Sélectionner un modèle —</option>
                {lettreModeles.map((modele) => (
                  <option key={modele.id} value={modele.id}>
                    {modele.nom}
                  </option>
                ))}
              </Select>
              <Button
                onClick={handleGenererLettre}
                disabled={!lettreModeleId || lettreBusy}
                className="sm:flex-shrink-0"
              >
                {lettreBusy ? 'Génération…' : 'Générer'}
              </Button>
            </div>
            {lettreModeles.length === 0 && (
              <span className="mt-1 block text-[0.75rem] text-slate-400">
                Aucun modèle actif. Créez-en dans « Référentiels → Modèles de lettres ».
              </span>
            )}
          </Field>

          {lettre && (
            <div>
              <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Aperçu</span>
              <pre className="max-h-[45vh] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-surface p-4 text-[0.82rem] text-slate-700">
                {texteLettre(lettre)}
              </pre>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
