import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, Settings2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { parametresService } from '@/services/admin.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Paginated, ParametreGeneral } from '@/types'

const PER_PAGE = 20
const TYPES = ['string', 'int', 'bool', 'json']

function displayValeur(param: ParametreGeneral): string {
  if (param.type === 'bool') return param.valeur === '1' || param.valeur === true || param.valeur === 1 ? 'Oui' : 'Non'
  return param.valeur === null || param.valeur === undefined ? '—' : String(param.valeur)
}

interface FormState {
  cle: string
  valeur: string
  type: string
  groupe: string
  description: string
}

const EMPTY_FORM: FormState = { cle: '', valeur: '', type: 'string', groupe: 'general', description: '' }

export function ParametresPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canManage = hasPermission('parametres.update')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [groupeFilter, setGroupeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<ParametreGeneral> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ParametreGeneral | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<ParametreGeneral | null>(null)

  useEffect(() => {
    setPage(1)
  }, [debounced, groupeFilter])

  useEffect(() => {
    let active = true
    setLoading(true)
    parametresService
      .list({ search: debounced || undefined, groupe: groupeFilter || undefined, page, per_page: PER_PAGE })
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
  }, [debounced, groupeFilter, page, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (param: ParametreGeneral) => {
    setEditing(param)
    setForm({
      cle: param.cle,
      valeur: param.valeur === null || param.valeur === undefined ? '' : String(param.valeur),
      type: param.type,
      groupe: param.groupe,
      description: param.description ?? '',
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour le paramètre' : 'Créer le paramètre',
      message: 'Confirmez-vous l’enregistrement de ce paramètre ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Créer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      let valeur: unknown = form.valeur
      if (form.type === 'int') valeur = form.valeur === '' ? null : Number(form.valeur)
      else if (form.type === 'bool') valeur = form.valeur === '1' || form.valeur === 'true'
      else valeur = form.valeur || null

      const payload = {
        cle: form.cle,
        valeur,
        type: form.type,
        groupe: form.groupe,
        description: form.description || null,
      }
      if (editing) await parametresService.update(editing.id, payload)
      else await parametresService.create(payload)
      setFormOpen(false)
      refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setFormError(err.message)
        if (err.errors && typeof err.errors === 'object') setFieldErrors(err.errors as Record<string, string[]>)
      } else setFormError('Erreur lors de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await parametresService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeleteTarget(null)
    }
  }

  const isBool = form.type === 'bool'

  return (
    <div>
      <PageHeader
        title="Paramètres généraux"
        subtitle="Configuration applicative (identité, courrier, OCR, archives...)."
        actions={
          canManage ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouveau paramètre
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher (clé, description)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Input
            value={groupeFilter}
            onChange={(e) => setGroupeFilter(e.target.value)}
            placeholder="Filtrer par groupe..."
          />
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Clé</th>
                <th>Valeur</th>
                <th>Type</th>
                <th>Groupe</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={5} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Settings2 className="h-6 w-6" />}
                      title="Aucun paramètre"
                      description="Ajoutez un premier paramètre général."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((param) => (
                  <tr key={param.id}>
                    <td>
                      <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.75rem] text-slate-700">
                        {param.cle}
                      </code>
                    </td>
                    <td className="max-w-[280px] truncate font-medium text-ink">
                      {displayValeur(param)}
                    </td>
                    <td>
                      <Badge tone="info">{param.type}</Badge>
                    </td>
                    <td className="text-slate-500">{param.groupe}</td>
                    <td className="text-right">
                      {canManage && (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => openEdit(param)}
                            className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(param)}
                            className="rounded-md border border-line bg-white p-1.5 text-danger hover:bg-danger/5"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {data && (
          <Pagination
            page={data.current_page}
            lastPage={data.last_page}
            total={data.total}
            from={data.from}
            to={data.to}
            onChange={setPage}
          />
        )}
      </Card>

      <Modal
        open={formOpen}
        title={editing ? 'Modifier le paramètre' : 'Nouveau paramètre'}
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
            <Field label="Clé" required error={fieldErrors.cle?.[0]}>
              <Input value={form.cle} onChange={(e) => setForm({ ...form, cle: e.target.value })} />
            </Field>
            <Field label="Groupe" required error={fieldErrors.groupe?.[0]}>
              <Input value={form.groupe} onChange={(e) => setForm({ ...form, groupe: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Type" required error={fieldErrors.type?.[0]}>
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Valeur" required error={fieldErrors.valeur?.[0]}>
              {isBool ? (
                <Select value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })}>
                  <option value="1">Oui</option>
                  <option value="0">Non</option>
                </Select>
              ) : (
                <Input
                  type={form.type === 'int' ? 'number' : 'text'}
                  value={form.valeur}
                  onChange={(e) => setForm({ ...form, valeur: e.target.value })}
                />
              )}
            </Field>
          </div>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Supprimer le paramètre"
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
          Supprimer le paramètre{' '}
          <span className="font-semibold text-ink">{deleteTarget?.cle}</span> ?
        </p>
      </Modal>
    </div>
  )
}
