import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, Landmark, Network, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { structureService } from '@/services/admin.service'
import { ApiError } from '@/lib/http'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { UniteStructure } from '@/types'

type Tab = 'directions' | 'departements' | 'services'
type Entity = 'direction' | 'departement' | 'service'

const TAB_VALUES: Tab[] = ['directions', 'departements', 'services']

const LABELS: Record<Entity, string> = {
  direction: 'direction',
  departement: 'département',
  service: 'service',
}

export function StructurePage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canManage = hasPermission('structure.manage')
  const canView = hasPermission('structure.view')

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: Tab = TAB_VALUES.includes(tabParam as Tab) ? (tabParam as Tab) : 'directions'
  const setTab = (next: Tab) => setSearchParams({ tab: next })

  const [directions, setDirections] = useState<UniteStructure[]>([])
  const [departements, setDepartements] = useState<UniteStructure[]>([])
  const [services, setServices] = useState<UniteStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [formOpen, setFormOpen] = useState(false)
  const [entity, setEntity] = useState<Entity>('direction')
  const [editing, setEditing] = useState<UniteStructure | null>(null)
  const [form, setForm] = useState({
    code: '',
    libelle: '',
    description: '',
    direction_id: '',
    departement_id: '',
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<{ entity: Entity; item: UniteStructure } | null>(
    null,
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      structureService.directions({ per_page: 100 }),
      structureService.departements({ per_page: 100 }),
      structureService.services({ per_page: 100 }),
    ])
      .then(([d, dept, s]) => {
        if (!active) return
        setDirections(d.data.data)
        setDepartements(dept.data.data)
        setServices(s.data.data)
        setError(null)
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

  const refresh = () => setReloadKey((value) => value + 1)

  const openCreate = (target: Entity) => {
    setEntity(target)
    setEditing(null)
    setForm({ code: '', libelle: '', description: '', direction_id: '', departement_id: '' })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (target: Entity, item: UniteStructure) => {
    setEntity(target)
    setEditing(item)
    setForm({
      code: item.code ?? '',
      libelle: item.libelle,
      description: '',
      direction_id: String(item.direction_id ?? ''),
      departement_id: String(item.departement_id ?? ''),
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const submit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour' : 'Ajouter',
      message: 'Confirmez-vous l’enregistrement de ces informations ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Ajouter',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const base = { code: form.code, libelle: form.libelle, description: form.description || null }
      const payload =
        entity === 'direction'
          ? base
          : entity === 'departement'
            ? { ...base, direction_id: Number(form.direction_id) }
            : { ...base, departement_id: Number(form.departement_id) }

      if (entity === 'direction') {
        if (editing) await structureService.updateDirection(editing.id, payload)
        else await structureService.createDirection(payload)
      } else if (entity === 'departement') {
        if (editing) await structureService.updateDepartement(editing.id, payload)
        else await structureService.createDepartement(payload)
      } else {
        if (editing) await structureService.updateService(editing.id, payload)
        else await structureService.createService(payload)
      }
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
      const { entity: target, item } = deleteTarget
      if (target === 'direction') await structureService.removeDirection(item.id)
      else if (target === 'departement') await structureService.removeDepartement(item.id)
      else await structureService.removeService(item.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeleteTarget(null)
    }
  }

  const rows: Record<Tab, UniteStructure[]> = {
    directions,
    departements,
    services,
  }
  const entityOfTab: Record<Tab, Entity> = {
    directions: 'direction',
    departements: 'departement',
    services: 'service',
  }

  return (
    <div>
      <PageHeader
        title="Structure organisationnelle"
        subtitle="Directions, départements et services de l'organisation."
        actions={
          canManage ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={() => openCreate(entityOfTab[tab])}>
              Ajouter
            </Button>
          ) : undefined
        }
      />

      {!canView && (
        <div className="mb-4 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-[0.85rem] text-warning">
          Vous n'avez pas la permission de consulter la structure organisationnelle.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-line">
        {(
          [
            { key: 'directions', label: 'Directions', icon: Landmark },
            { key: 'departements', label: 'Départements', icon: Building2 },
            { key: 'services', label: 'Services', icon: Network },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[0.85rem] font-medium transition-colors',
              tab === item.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-ink',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                {tab === 'departements' && <th>Direction</th>}
                {tab === 'services' && <th>Département</th>}
                <th>Code</th>
                <th>Libellé</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={6} cols={tab === 'directions' ? 3 : 4} />}
              {!loading && rows[tab].length === 0 && (
                <tr>
                  <td colSpan={tab === 'directions' ? 3 : 4}>
                    <EmptyState
                      icon={<Network className="h-6 w-6" />}
                      title={`Aucun ${LABELS[entityOfTab[tab]]}`}
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                rows[tab].map((item) => (
                  <tr key={item.id}>
                    {tab === 'departements' && (
                      <td className="text-slate-600">{item.direction?.libelle ?? '—'}</td>
                    )}
                    {tab === 'services' && (
                      <td className="text-slate-600">{item.departement?.libelle ?? '—'}</td>
                    )}
                    <td className="font-mono text-[0.78rem] text-slate-500">{item.code ?? '—'}</td>
                    <td className="font-semibold text-ink">{item.libelle}</td>
                    <td className="text-right">
                      {canManage && (
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => openEdit(entityOfTab[tab], item)}
                            className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ entity: entityOfTab[tab], item })}
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
      </Card>

      <Modal
        open={formOpen}
        title={`${editing ? 'Modifier' : 'Ajouter'} un ${LABELS[entity]}`}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={saving}>
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
          {entity === 'departement' && (
            <Field label="Direction" required error={fieldErrors.direction_id?.[0]}>
              <Select
                value={form.direction_id}
                onChange={(e) => setForm({ ...form, direction_id: e.target.value })}
              >
                <option value="">— Sélectionner —</option>
                {directions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          {entity === 'service' && (
            <Field label="Département" required error={fieldErrors.departement_id?.[0]}>
              <Select
                value={form.departement_id}
                onChange={(e) => setForm({ ...form, departement_id: e.target.value })}
              >
                <option value="">— Sélectionner —</option>
                {departements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Code" required error={fieldErrors.code?.[0]}>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Field>
            <Field label="Libellé" required error={fieldErrors.libelle?.[0]}>
              <Input
                value={form.libelle}
                onChange={(e) => setForm({ ...form, libelle: e.target.value })}
              />
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
        title="Supprimer"
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
          Supprimer <span className="font-semibold text-ink">{deleteTarget?.item.libelle}</span> ? Les
          éléments enfants pourraient être affectés.
        </p>
      </Modal>
    </div>
  )
}
