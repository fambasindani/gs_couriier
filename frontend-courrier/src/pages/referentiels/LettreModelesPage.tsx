import { useEffect, useState } from 'react'
import { FileText, Pencil, Plus, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { lettreModelesService } from '@/services/lettres.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { LettreModele, Paginated } from '@/types'

const PER_PAGE = 15

const VARIABLES = [
  'numero',
  'objet',
  'reference_externe',
  'date_courrier',
  'date_reception',
  'date_limite',
  'type',
  'categorie',
  'priorite',
  'statut',
  'confidentialite',
  'expediteur',
  'destinataire',
  'date_du_jour',
]

interface FormState {
  nom: string
  objet: string
  corps: string
  type_courrier_id: string
  actif: string
}

const EMPTY_FORM: FormState = {
  nom: '',
  objet: '',
  corps: '',
  type_courrier_id: '',
  actif: '1',
}

export function LettreModelesPage() {
  const referentiels = useReferentiels()
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canCreate = hasPermission('courriers.create')
  const canUpdate = hasPermission('courriers.update')
  const canDelete = hasPermission('courriers.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<LettreModele> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LettreModele | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<LettreModele | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debounced])

  useEffect(() => {
    let active = true
    setLoading(true)
    lettreModelesService
      .list({ search: debounced || undefined, page, per_page: PER_PAGE })
      .then((res) => {
        if (active) {
          setData(res.data)
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
  }, [debounced, page, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (modele: LettreModele) => {
    setEditing(modele)
    setForm({
      nom: modele.nom,
      objet: modele.objet ?? '',
      corps: modele.corps,
      type_courrier_id: String(modele.type_courrier?.id ?? modele.type_courrier_id ?? ''),
      actif: modele.actif ? '1' : '0',
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour le modèle' : 'Créer le modèle',
      message: 'Confirmez-vous l’enregistrement de ce modèle de lettre ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Créer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const payload = {
        nom: form.nom,
        objet: form.objet || null,
        corps: form.corps,
        type_courrier_id: form.type_courrier_id ? Number(form.type_courrier_id) : null,
        actif: form.actif === '1',
      }
      if (editing) await lettreModelesService.update(editing.id, payload)
      else await lettreModelesService.create(payload)
      setFormOpen(false)
      refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        if (err.errors && typeof err.errors === 'object') {
          setFieldErrors(err.errors as Record<string, string[]>)
        }
      } else {
        setFormError('Erreur lors de l’enregistrement.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await lettreModelesService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Modèles de lettres"
        subtitle="Projets de lettres réutilisables avec variables {{…}} fusionnées depuis le courrier."
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouveau modèle
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <Card className="p-4">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 md:max-w-md">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un modèle..."
            className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-slate-400 hover:text-ink">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Objet</th>
                <th>Type</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={6} cols={5} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<FileText className="h-6 w-6" />}
                      title="Aucun modèle"
                      description="Créez un modèle de lettre avec des variables {{numero}}, {{objet}}…"
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((modele) => (
                  <tr key={modele.id}>
                    <td className="font-semibold text-ink">{modele.nom}</td>
                    <td className="max-w-[320px] text-slate-600">{modele.objet ?? '—'}</td>
                    <td className="text-slate-500">{modele.type_courrier?.libelle ?? 'Tous'}</td>
                    <td>
                      {modele.actif ? (
                        <Badge tone="success">Actif</Badge>
                      ) : (
                        <Badge tone="secondary">Inactif</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(modele)}
                            className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(modele)}
                            className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && data.last_page > 1 && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={data.current_page <= 1}
              className="mx-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[0.8rem] disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="mx-3 py-1.5 text-[0.8rem] text-slate-500">
              {data.current_page} / {data.last_page}
            </span>
            <button
              onClick={() => setPage((value) => Math.min(data.last_page, value + 1))}
              disabled={data.current_page >= data.last_page}
              className="mx-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[0.8rem] disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Modifier le modèle' : 'Nouveau modèle de lettre'}
        size="lg"
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        {formError && (
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {formError}
          </div>
        )}
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Nom du modèle" required error={fieldErrors.nom?.[0]}>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </Field>
            <Field label="Type de courrier">
              <Select
                value={form.type_courrier_id}
                onChange={(e) => setForm({ ...form, type_courrier_id: e.target.value })}
              >
                <option value="">— Tous —</option>
                {referentiels.types.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Objet (peut contenir des variables)" error={fieldErrors.objet?.[0]}>
            <Input value={form.objet} onChange={(e) => setForm({ ...form, objet: e.target.value })} />
          </Field>
          <Field
            label="Corps de la lettre"
            required
            error={fieldErrors.corps?.[0]}
            hint={`Variables disponibles : ${VARIABLES.map((v) => `{{${v}}}`).join(', ')}`}
          >
            <Textarea
              value={form.corps}
              onChange={(e) => setForm({ ...form, corps: e.target.value })}
              className="min-h-[260px] font-mono text-[0.82rem]"
            />
          </Field>
          <Field label="Statut">
            <Select value={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.value })}>
              <option value="1">Actif</option>
              <option value="0">Inactif</option>
            </Select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer le modèle"
        size="sm"
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      >
        <p className="text-[0.85rem] text-slate-600">
          Supprimer le modèle <span className="font-semibold text-ink">{deleteTarget?.nom}</span> ?
        </p>
      </Modal>
    </div>
  )
}
