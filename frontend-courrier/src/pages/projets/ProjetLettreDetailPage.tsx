import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  CheckCheck,
  Clock,
  Download,
  Eye,
  FileText,
  PenLine,
  Send,
  Upload,
  XCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TimelineSkeleton } from '@/components/ui/Skeletons'
import { projetsLettresService } from '@/services/projetsLettres.service'
import { formatDate } from '@/lib/utils'
import { projetStatutLabel, projetStatutTone } from '@/lib/projetStatuts'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { ProjetLettre } from '@/types'

type Tab = 'infos' | 'versions' | 'validations' | 'historique'

const TABS: { key: Tab; label: string }[] = [
  { key: 'infos', label: 'Informations' },
  { key: 'versions', label: 'Versions' },
  { key: 'validations', label: 'Validations' },
  { key: 'historique', label: 'Historique' },
]

const DECISION_TONES: Record<string, BadgeTone> = {
  APPROUVE: 'success',
  CORRECTION: 'warning',
  REJETE: 'danger',
}

export function ProjetLettreDetailPage() {
  const { id } = useParams<{ id: string }>()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()

  const [projet, setProjet] = useState<ProjetLettre | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [tab, setTab] = useState<Tab>('infos')
  const [reloadKey, setReloadKey] = useState(0)

  const [decisionOpen, setDecisionOpen] = useState(false)
  const [decision, setDecision] = useState('APPROUVE')
  const [observation, setObservation] = useState('')

  const [expedierOpen, setExpedierOpen] = useState(false)
  const [modeExpedition, setModeExpedition] = useState('POSTE')
  const [expedierComment, setExpedierComment] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    projetsLettresService
      .show(id)
      .then((res) => {
        if (active) {
          setProjet(res.data)
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
  }, [id, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.')
    } finally {
      setBusy(false)
    }
  }

  const handleGenererWord = () =>
    run(async () => {
      await projetsLettresService.genererWord(id!)
    })

  const handleImporter = async (file: File) => {
    const ok = await confirm({
      title: 'Importer la version Word',
      message: `Importer « ${file.name} » comme nouvelle version du projet ?`,
      confirmLabel: 'Importer',
    })
    if (fileRef.current) fileRef.current.value = ''
    if (!ok) return
    await run(async () => {
      await projetsLettresService.importerVersion(id!, file)
    })
  }

  const handleSoumettre = async () => {
    const ok = await confirm({
      title: 'Soumettre pour validation',
      message: 'Transmettre ce projet au responsable pour validation ?',
      confirmLabel: 'Soumettre',
    })
    if (!ok) return
    await run(async () => {
      await projetsLettresService.soumettre(id!)
    })
  }

  const handleDecision = async () => {
    setDecisionOpen(false)
    await run(async () => {
      await projetsLettresService.decision(id!, decision, observation || undefined)
    })
  }

  const handleSigner = async () => {
    const ok = await confirm({
      title: 'Signer le projet',
      message: 'Confirmer la signature du projet ? (action réservée aux personnes habilitées)',
      confirmLabel: 'Signer',
    })
    if (!ok) return
    await run(async () => {
      await projetsLettresService.signer(id!)
    })
  }

  const handleCourrierSortant = async () => {
    const ok = await confirm({
      title: 'Créer le courrier sortant',
      message: 'Créer le courrier sortant officiel à partir de ce projet signé ?',
      confirmLabel: 'Créer',
    })
    if (!ok) return
    await run(async () => {
      await projetsLettresService.creerCourrierSortant(id!)
    })
  }

  const handleExpedier = async () => {
    setExpedierOpen(false)
    await run(async () => {
      await projetsLettresService.expedier(id!, modeExpedition, expedierComment || undefined)
    })
  }

  const handleArchiver = async () => {
    const ok = await confirm({
      title: 'Archiver le projet',
      message: 'Archiver ce dossier ?',
      confirmLabel: 'Archiver',
    })
    if (!ok) return
    await run(async () => {
      await projetsLettresService.archiver(id!)
    })
  }

  const handleAnnuler = async () => {
    const ok = await confirm({
      title: 'Annuler le projet',
      message: 'Annuler ce projet de lettre ?',
      confirmLabel: 'Annuler le projet',
      tone: 'danger',
    })
    if (!ok) return
    await run(async () => {
      await projetsLettresService.annuler(id!)
    })
  }

  if (loading) {
    return (
      <Card className="p-6">
        <TimelineSkeleton rows={5} />
      </Card>
    )
  }

  if (error && !projet) {
    return (
      <Card className="p-6">
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="Projet introuvable"
          description={error}
          action={
            <Link to="/projets-lettres">
              <Button variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
                Retour
              </Button>
            </Link>
          }
        />
      </Card>
    )
  }

  if (!projet) return null

  const statut = projet.statut
  const canUpdate = hasPermission('projets.update')
  const canValider = hasPermission('projets.valider')
  const canSigner = hasPermission('projets.signer')
  const terminal = statut === 'ARCHIVE' || statut === 'ANNULE'

  return (
    <div>
      <PageHeader
        title={projet.reference_projet}
        subtitle={projet.objet}
        actions={
          <>
            <Link to="/projets-lettres">
              <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
                Retour
              </Button>
            </Link>
            {canUpdate && !terminal && (
              <Button variant="outline" icon={<FileText className="h-4 w-4" />} onClick={handleGenererWord} disabled={busy}>
                Générer Word
              </Button>
            )}
            {canUpdate && !terminal && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".docx,.doc"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleImporter(f)
                  }}
                />
                <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={() => fileRef.current?.click()} disabled={busy}>
                  Importer version
                </Button>
              </>
            )}
            {canUpdate && ['BROUILLON', 'EN_REDACTION', 'A_CORRIGER'].includes(statut) && (
              <Button icon={<Send className="h-4 w-4" />} onClick={handleSoumettre} disabled={busy}>
                Soumettre
              </Button>
            )}
            {canValider && statut === 'SOUMIS_A_VALIDATION' && (
              <Button icon={<PenLine className="h-4 w-4" />} onClick={() => setDecisionOpen(true)} disabled={busy}>
                Décider
              </Button>
            )}
            {canSigner && statut === 'A_SIGNER' && (
              <Button icon={<CheckCheck className="h-4 w-4" />} onClick={handleSigner} disabled={busy}>
                Signer
              </Button>
            )}
            {canUpdate && statut === 'SIGNE' && (
              <Button icon={<Send className="h-4 w-4" />} onClick={handleCourrierSortant} disabled={busy}>
                Créer courrier sortant
              </Button>
            )}
            {canUpdate && statut === 'A_EXPEDIER' && (
              <Button icon={<Send className="h-4 w-4" />} onClick={() => setExpedierOpen(true)} disabled={busy}>
                Expédier
              </Button>
            )}
            {canUpdate && statut === 'EXPEDIE' && (
              <Button variant="outline" icon={<Archive className="h-4 w-4" />} onClick={handleArchiver} disabled={busy}>
                Archiver
              </Button>
            )}
            {canUpdate && !terminal && statut !== 'EXPEDIE' && (
              <Button variant="danger" icon={<XCircle className="h-4 w-4" />} onClick={handleAnnuler} disabled={busy}>
                Annuler
              </Button>
            )}
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={projetStatutTone(statut)}>{projetStatutLabel(statut)}</Badge>
          {projet.courrier_entrant && (
            <Link
              to={`/courriers/${projet.courrier_entrant.id}`}
              className="text-[0.8rem] font-medium text-primary hover:underline"
            >
              Courrier lié : {projet.courrier_entrant.numero}
            </Link>
          )}
          {projet.courrier_sortant && (
            <Link
              to={`/courriers/${projet.courrier_sortant.id}`}
              className="text-[0.8rem] font-medium text-success hover:underline"
            >
              Courrier sortant : {projet.courrier_sortant.numero}
            </Link>
          )}
        </div>
      </Card>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[0.85rem] font-medium transition-colors ${
              tab === item.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'infos' && (
        <Card className="mt-5 p-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Info label="Référence projet" value={projet.reference_projet} />
            <Info label="Objet" value={projet.objet} />
            <Info label="Destinataire" value={projet.destinataire} />
            <Info label="Service rédacteur" value={projet.service_redacteur?.libelle} />
            <Info label="Créé par" value={projet.createur?.name} />
            <Info label="Signataire prévu" value={projet.signataire?.name} />
            <Info label="Date de création" value={formatDate(projet.date_creation, true)} />
            <Info label="Date de soumission" value={formatDate(projet.date_soumission, true)} />
            <Info label="Date de validation" value={formatDate(projet.date_validation, true)} />
            <Info label="Date de signature" value={formatDate(projet.date_signature, true)} />
            <Info label="Date d'expédition" value={formatDate(projet.date_expedition, true)} />
            <Info label="Mode d'expédition" value={projet.mode_expedition} />
          </div>
        </Card>
      )}

      {tab === 'versions' && (
        <Card className="mt-5 p-5">
          <h6 className="section-title">Versions ({(projet.versions ?? []).length})</h6>
          {(projet.versions ?? []).length === 0 ? (
            <p className="text-[0.83rem] text-slate-400">
              Aucune version. Cliquez sur « Générer Word » puis réimportez le fichier modifié.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {(projet.versions ?? []).map((version) => (
                <li key={version.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <span className="block text-[0.85rem] font-medium text-ink">
                      v{version.numero_version} — {version.nom_fichier_original}
                      {version.est_version_finale && (
                        <span className="ml-2 rounded bg-success/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-success">
                          FINALE
                        </span>
                      )}
                    </span>
                    <span className="text-[0.75rem] text-slate-400">
                      {version.utilisateur?.name ?? '—'} • {formatDate(version.date_creation, true)}
                      {version.commentaire ? ` • ${version.commentaire}` : ''}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      void projetsLettresService.downloadVersion(projet.id, version.id, version.nom_fichier_original)
                    }
                    className="rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                    title="Télécharger"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'validations' && (
        <Card className="mt-5 p-5">
          <h6 className="section-title">Validations ({(projet.validations ?? []).length})</h6>
          {(projet.validations ?? []).length === 0 ? (
            <p className="text-[0.83rem] text-slate-400">Aucune décision de validation.</p>
          ) : (
            <ul className="space-y-3">
              {(projet.validations ?? []).map((v) => (
                <li key={v.id} className="rounded-lg border border-line p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.83rem] font-medium text-ink">
                      {v.valideur?.name ?? '—'} — niveau {v.niveau_validation}
                    </span>
                    <Badge tone={DECISION_TONES[v.decision] ?? 'secondary'}>{v.decision}</Badge>
                  </div>
                  {v.observation && <p className="mt-1 text-[0.8rem] text-slate-600">{v.observation}</p>}
                  <span className="mt-1 block text-[0.75rem] text-slate-400">
                    {formatDate(v.date_decision ?? v.created_at, true)}
                    {v.version ? ` • version v${v.version.numero_version}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'historique' && (
        <Card className="mt-5 p-5">
          <h6 className="section-title">Historique</h6>
          {(projet.historique ?? []).length === 0 ? (
            <p className="text-[0.83rem] text-slate-400">Aucune action.</p>
          ) : (
            <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-line">
              {(projet.historique ?? []).map((h) => (
                <li key={h.id} className="relative flex gap-4">
                  <span className="relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white text-slate-400">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="flex-1 rounded-xl border border-line bg-white px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <span className="text-[0.85rem] font-semibold text-ink">{h.action}</span>
                        {h.nouveau_statut && (
                          <Badge tone={projetStatutTone(h.nouveau_statut)}>
                            {projetStatutLabel(h.nouveau_statut)}
                          </Badge>
                        )}
                      </span>
                      <span className="text-[0.75rem] text-slate-400">
                        {formatDate(h.date_action ?? h.created_at, true)}
                      </span>
                    </div>
                    {h.commentaire && <p className="mt-1 text-[0.8rem] text-slate-600">{h.commentaire}</p>}
                    <span className="mt-1 block text-[0.75rem] text-slate-400">
                      {h.utilisateur?.name ?? 'Système'}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}

      {/* Décision */}
      <Modal
        open={decisionOpen}
        title="Décision de validation"
        onClose={() => setDecisionOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDecisionOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleDecision} disabled={busy}>
              Enregistrer la décision
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Décision" required>
            <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="APPROUVE">Approuver (transmettre à la signature)</option>
              <option value="CORRECTION">Demander une correction</option>
              <option value="REJETE">Rejeter</option>
            </Select>
          </Field>
          <Field label="Observation">
            <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} />
          </Field>
        </div>
      </Modal>

      {/* Expédition */}
      <Modal
        open={expedierOpen}
        title="Expédier le courrier"
        onClose={() => setExpedierOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setExpedierOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleExpedier} disabled={busy} icon={<Send className="h-4 w-4" />}>
              Expédier
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Mode d'expédition" required>
            <Select value={modeExpedition} onChange={(e) => setModeExpedition(e.target.value)}>
              <option value="POSTE">Poste</option>
              <option value="EMAIL">E-mail</option>
              <option value="MAIN_PROPRE">Remise en main propre</option>
              <option value="AUTRE">Autre</option>
            </Select>
          </Field>
          <Field label="Commentaire / référence d'envoi">
            <Textarea value={expedierComment} onChange={(e) => setExpedierComment(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <div className="mt-4 flex items-center gap-2 text-[0.75rem] text-slate-400">
        <Eye className="h-3.5 w-3.5" /> Circuit : création → Word → import → validation → signature → courrier
        sortant → expédition → archivage.
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <span className="block text-[0.72rem] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="mt-0.5 block text-[0.88rem] text-ink">{value || '—'}</span>
    </div>
  )
}
