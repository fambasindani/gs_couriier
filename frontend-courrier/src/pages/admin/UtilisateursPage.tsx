import { useEffect, useState } from 'react'
import { Pencil, Plus, RotateCcw, Search, Trash2, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { utilisateursService, rolesService } from '@/services/admin.service'
import { organisationService } from '@/services/organisation.service'
import { ApiError } from '@/lib/http'
import { useDebounce } from '@/lib/useDebounce'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Paginated, Role, UniteStructure, User } from '@/types'

const PER_PAGE = 15

interface FormState {
  name: string
  email: string
  password: string
  actif: string
  direction_id: string
  departement_id: string
  service_id: string
  roles: number[]
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  password: '',
  actif: '1',
  direction_id: '',
  departement_id: '',
  service_id: '',
  roles: [],
}

export function UtilisateursPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const canCreate = hasPermission('users.create')
  const canUpdate = hasPermission('users.update')
  const canDelete = hasPermission('users.delete')

  const [search, setSearch] = useState('')
  const debounced = useDebounce(search)
  const [actifFilter, setActifFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [roles, setRoles] = useState<Role[]>([])
  const [org, setOrg] = useState<{
    directions: UniteStructure[]
    departements: UniteStructure[]
    services: UniteStructure[]
  }>({ directions: [], departements: [], services: [] })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  useEffect(() => {
    rolesService.all().then(setRoles).catch(() => undefined)
    Promise.all([
      organisationService.directions(),
      organisationService.departements(),
      organisationService.services(),
    ])
      .then(([directions, departements, services]) => setOrg({ directions, departements, services }))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [debounced, actifFilter, roleFilter])

  useEffect(() => {
    let active = true
    setLoading(true)
    utilisateursService
      .list({
        search: debounced || undefined,
        actif: actifFilter || undefined,
        role_id: roleFilter || undefined,
        page,
        per_page: PER_PAGE,
      })
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
  }, [debounced, actifFilter, roleFilter, page, reloadKey])

  const refresh = () => setReloadKey((value) => value + 1)

  const filteredDepartements = org.departements.filter(
    (item) => !form.direction_id || String(item.direction_id) === form.direction_id,
  )
  const filteredServices = org.services.filter(
    (item) => !form.departement_id || String(item.departement_id) === form.departement_id,
  )

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      actif: user.actif ? '1' : '0',
      direction_id: String(user.direction_id ?? user.direction?.id ?? ''),
      departement_id: String(user.departement_id ?? user.departement?.id ?? ''),
      service_id: String(user.service_id ?? user.service?.id ?? ''),
      roles: (user.roles ?? []).map((role) => role.id),
    })
    setFormError(null)
    setFieldErrors({})
    setFormOpen(true)
  }

  const toggleRole = (value: number | string) => {
    const id = Number(value)
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(id)
        ? prev.roles.filter((item) => item !== id)
        : [...prev.roles, id],
    }))
  }

  const handleSubmit = async () => {
    const ok = await confirm({
      title: editing ? 'Mettre à jour l’utilisateur' : 'Créer l’utilisateur',
      message: 'Confirmez-vous l’enregistrement de ces informations ?',
      confirmLabel: editing ? 'Mettre à jour' : 'Créer',
    })
    if (!ok) return

    setFormError(null)
    setFieldErrors({})
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        actif: form.actif === '1',
        direction_id: form.direction_id ? Number(form.direction_id) : null,
        departement_id: form.departement_id ? Number(form.departement_id) : null,
        service_id: form.service_id ? Number(form.service_id) : null,
        roles: form.roles,
      }
      if (form.password) payload.password = form.password

      if (editing) {
        await utilisateursService.update(editing.id, payload)
      } else {
        await utilisateursService.create(payload)
      }
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
      await utilisateursService.remove(deleteTarget.id)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Utilisateurs"
        subtitle="Comptes, rôles et activation."
        actions={
          canCreate ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
              Nouvel utilisateur
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-2">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-white px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher (nom, email)..."
                className="w-full border-none bg-transparent py-2 text-[0.85rem] outline-none"
              />
            </div>
          </div>
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Tous les rôles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nom}
              </option>
            ))}
          </Select>
          <Select value={actifFilter} onChange={(event) => setActifFilter(event.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="1">Actifs</option>
            <option value="0">Inactifs</option>
          </Select>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            icon={<RotateCcw className="h-4 w-4" />}
            onClick={() => {
              setSearch('')
              setRoleFilter('')
              setActifFilter('')
            }}
          >
            Réinitialiser
          </Button>
        </div>
      </Card>

      <Card className="mt-5 p-4">
        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Unité</th>
                  <th>Rôles</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={6} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={<Users className="h-6 w-6" />}
                      title="Aucun utilisateur"
                      description="Ajoutez un premier compte utilisateur."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((user) => (
                  <tr key={user.id}>
                    <td className="font-semibold text-ink">{user.name}</td>
                    <td className="text-slate-600">{user.email}</td>
                    <td className="text-slate-500">
                      {[user.direction?.libelle, user.departement?.libelle, user.service?.libelle]
                        .filter(Boolean)
                        .join(' › ') || '—'}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(user.roles ?? []).length === 0 ? (
                          <span className="text-slate-400">—</span>
                        ) : (
                          user.roles.map((role) => (
                            <Badge key={role.id} tone="primary">
                              {role.nom}
                            </Badge>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      {user.actif ? (
                        <Badge tone="success">Actif</Badge>
                      ) : (
                        <Badge tone="secondary">Inactif</Badge>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex gap-1.5">
                        {canUpdate && (
                          <button
                            onClick={() => openEdit(user)}
                            className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(user)}
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
        title={editing ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
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
            <Field label="Nom complet" required error={fieldErrors.name?.[0]}>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email" required error={fieldErrors.email?.[0]}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field
              label={editing ? 'Nouveau mot de passe (laisser vide pour conserver)' : 'Mot de passe'}
              required={!editing}
              error={fieldErrors.password?.[0]}
            >
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Statut">
              <Select value={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.value })}>
                <option value="1">Actif</option>
                <option value="0">Inactif</option>
              </Select>
            </Field>
            <Field label="Direction" error={fieldErrors.direction_id?.[0]}>
              <Select
                value={form.direction_id}
                onChange={(e) =>
                  setForm({ ...form, direction_id: e.target.value, departement_id: '', service_id: '' })
                }
              >
                <option value="">— Aucune —</option>
                {org.directions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Département" error={fieldErrors.departement_id?.[0]}>
              <Select
                value={form.departement_id}
                onChange={(e) =>
                  setForm({ ...form, departement_id: e.target.value, service_id: '' })
                }
              >
                <option value="">— Aucun —</option>
                {filteredDepartements.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Service" error={fieldErrors.service_id?.[0]}>
              <Select
                value={form.service_id}
                onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              >
                <option value="">— Aucun —</option>
                {filteredServices.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Rôles" error={fieldErrors.roles?.[0]}>
            <CheckboxList
              options={roles.map((role) => ({ value: role.id, label: role.nom, hint: role.description ?? undefined }))}
              selected={form.roles}
              onToggle={toggleRole}
              onSelectAll={() => setForm((prev) => ({ ...prev, roles: roles.map((role) => role.id) }))}
              onClearAll={() => setForm((prev) => ({ ...prev, roles: [] }))}
              emptyLabel="Aucun rôle disponible."
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Supprimer l'utilisateur"
        tone="danger"
        confirmLabel="Supprimer"
        message={
          <p>
            Confirmez-vous la suppression de{' '}
            <span className="font-semibold text-ink">{deleteTarget?.name}</span> ?
          </p>
        }
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
