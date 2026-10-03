import { useEffect, useState } from 'react'
import { KeyRound, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { CheckboxList } from '@/components/ui/CheckboxList'
import { rolesService, permissionsService } from '@/services/admin.service'
import { ApiError } from '@/lib/http'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth.store'
import { useConfirm } from '@/stores/confirm.store'
import type { Permission, Role } from '@/types'

type Tab = 'roles' | 'permissions'

export function RolesPermissionsPage() {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const confirm = useConfirm()
  const [tab, setTab] = useState<Tab>('roles')

  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Formulaire rôle
  const [roleFormOpen, setRoleFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ nom: '', description: '', permissions: [] as number[] })
  const [roleErrors, setRoleErrors] = useState<Record<string, string[]>>({})
  const [roleError, setRoleError] = useState<string | null>(null)

  // Formulaire permission
  const [permFormOpen, setPermFormOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [permForm, setPermForm] = useState({ nom: '', slug: '', description: '' })
  const [permErrors, setPermErrors] = useState<Record<string, string[]>>({})
  const [permError, setPermError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [deletePerm, setDeletePerm] = useState<Permission | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([rolesService.all(), permissionsService.all()])
      .then(([r, p]) => {
        if (!active) return
        setRoles(r)
        setPermissions(p)
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

  const openRoleCreate = () => {
    setEditingRole(null)
    setRoleForm({ nom: '', description: '', permissions: [] })
    setRoleError(null)
    setRoleErrors({})
    setRoleFormOpen(true)
  }

  const openRoleEdit = (role: Role) => {
    setEditingRole(role)
    setRoleForm({
      nom: role.nom,
      description: role.description ?? '',
      permissions: (role.permissions ?? []).map((item) => item.id),
    })
    setRoleError(null)
    setRoleErrors({})
    setRoleFormOpen(true)
  }

  const submitRole = async () => {
    const ok = await confirm({
      title: editingRole ? 'Mettre à jour le rôle' : 'Créer le rôle',
      message: 'Confirmez-vous l’enregistrement de ce rôle ?',
      confirmLabel: editingRole ? 'Mettre à jour' : 'Créer',
    })
    if (!ok) return

    setRoleError(null)
    setRoleErrors({})
    setSaving(true)
    try {
      const payload = {
        nom: roleForm.nom,
        description: roleForm.description || null,
        permissions: roleForm.permissions,
      }
      if (editingRole) await rolesService.update(editingRole.id, payload)
      else await rolesService.create(payload)
      setRoleFormOpen(false)
      refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setRoleError(err.message)
        if (err.errors && typeof err.errors === 'object') setRoleErrors(err.errors as Record<string, string[]>)
      } else setRoleError('Erreur lors de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const openPermCreate = () => {
    setEditingPerm(null)
    setPermForm({ nom: '', slug: '', description: '' })
    setPermError(null)
    setPermErrors({})
    setPermFormOpen(true)
  }

  const openPermEdit = (perm: Permission) => {
    setEditingPerm(perm)
    setPermForm({ nom: perm.nom, slug: perm.slug, description: perm.description ?? '' })
    setPermError(null)
    setPermErrors({})
    setPermFormOpen(true)
  }

  const submitPerm = async () => {
    const ok = await confirm({
      title: editingPerm ? 'Mettre à jour la permission' : 'Créer la permission',
      message: 'Confirmez-vous l’enregistrement de cette permission ?',
      confirmLabel: editingPerm ? 'Mettre à jour' : 'Créer',
    })
    if (!ok) return

    setPermError(null)
    setPermErrors({})
    setSaving(true)
    try {
      const payload = {
        nom: permForm.nom,
        slug: permForm.slug,
        description: permForm.description || null,
      }
      if (editingPerm) await permissionsService.update(editingPerm.id, payload)
      else await permissionsService.create(payload)
      setPermFormOpen(false)
      refresh()
    } catch (err) {
      if (err instanceof ApiError) {
        setPermError(err.message)
        if (err.errors && typeof err.errors === 'object') setPermErrors(err.errors as Record<string, string[]>)
      } else setPermError('Erreur lors de l’enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!deleteRole) return
    try {
      await rolesService.remove(deleteRole.id)
      setDeleteRole(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeleteRole(null)
    }
  }

  const handleDeletePerm = async () => {
    if (!deletePerm) return
    try {
      await permissionsService.remove(deletePerm.id)
      setDeletePerm(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression.')
      setDeletePerm(null)
    }
  }

  const toggleRolePermission = (value: number | string) => {
    const id = Number(value)
    setRoleForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter((item) => item !== id)
        : [...prev.permissions, id],
    }))
  }

  return (
    <div>
      <PageHeader
        title="Rôles & Permissions"
        subtitle="Définissez les rôles et les droits d'accès du système."
        actions={
          tab === 'roles' && hasPermission('roles.create') ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openRoleCreate}>
              Nouveau rôle
            </Button>
          ) : tab === 'permissions' && hasPermission('permissions.create') ? (
            <Button icon={<Plus className="h-4 w-4" />} onClick={openPermCreate}>
              Nouvelle permission
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <div className="flex gap-1 border-b border-line">
        {(
          [
            { key: 'roles', label: 'Rôles', icon: ShieldCheck },
            { key: 'permissions', label: 'Permissions', icon: KeyRound },
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

      {tab === 'roles' && (
        <Card className="mt-5 p-4">
          <div className="overflow-x-auto">
            <table className="table-custom w-full">
              <thead>
                <tr>
                  <th>Rôle</th>
                  <th>Description</th>
                  <th>Permissions</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableBodySkeleton rows={5} cols={4} />}
                {!loading && roles.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={<ShieldCheck className="h-6 w-6" />} title="Aucun rôle" />
                    </td>
                  </tr>
                )}
                {!loading &&
                  roles.map((role) => (
                    <tr key={role.id}>
                      <td className="font-semibold text-ink">{role.nom}</td>
                      <td className="max-w-[380px] text-slate-500">{role.description ?? '—'}</td>
                      <td>
                        <Badge tone="primary">{role.permissions?.length ?? 0}</Badge>
                      </td>
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          {hasPermission('roles.update') && (
                            <button
                              onClick={() => openRoleEdit(role)}
                              className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission('roles.delete') && (
                            <button
                              onClick={() => setDeleteRole(role)}
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
        </Card>
      )}

      {tab === 'permissions' && (
        <Card className="mt-5 p-4">
          <div className="overflow-x-auto">
            <table className="table-custom w-full">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <TableBodySkeleton rows={8} cols={4} />}
                {!loading && permissions.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState icon={<KeyRound className="h-6 w-6" />} title="Aucune permission" />
                    </td>
                  </tr>
                )}
                {!loading &&
                  permissions.map((perm) => (
                    <tr key={perm.id}>
                      <td className="font-semibold text-ink">{perm.nom}</td>
                      <td>
                        <code className="rounded bg-surface px-2 py-0.5 font-mono text-[0.75rem] text-slate-600">
                          {perm.slug}
                        </code>
                      </td>
                      <td className="max-w-[380px] text-slate-500">{perm.description ?? '—'}</td>
                      <td className="text-right">
                        <div className="inline-flex gap-1.5">
                          {hasPermission('permissions.update') && (
                            <button
                              onClick={() => openPermEdit(perm)}
                              className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-50"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {hasPermission('permissions.delete') && (
                            <button
                              onClick={() => setDeletePerm(perm)}
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
        </Card>
      )}

      {/* Modal rôle */}
      <Modal
        open={roleFormOpen}
        title={editingRole ? 'Modifier le rôle' : 'Nouveau rôle'}
        onClose={() => setRoleFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setRoleFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitRole} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        {roleError && (
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {roleError}
          </div>
        )}
        <div className="space-y-4">
          <Field label="Nom" required error={roleErrors.nom?.[0]}>
            <Input value={roleForm.nom} onChange={(e) => setRoleForm({ ...roleForm, nom: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />
          </Field>
          <Field label="Permissions">
            <CheckboxList
              options={permissions.map((perm) => ({ value: perm.id, label: perm.nom, hint: perm.slug }))}
              selected={roleForm.permissions}
              onToggle={toggleRolePermission}
              onSelectAll={() =>
                setRoleForm((prev) => ({ ...prev, permissions: permissions.map((perm) => perm.id) }))
              }
              onClearAll={() => setRoleForm((prev) => ({ ...prev, permissions: [] }))}
              emptyLabel="Aucune permission disponible."
            />
          </Field>
        </div>
      </Modal>

      {/* Modal permission */}
      <Modal
        open={permFormOpen}
        title={editingPerm ? 'Modifier la permission' : 'Nouvelle permission'}
        onClose={() => setPermFormOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setPermFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitPerm} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        {permError && (
          <div className="mb-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            {permError}
          </div>
        )}
        <div className="space-y-4">
          <Field label="Nom" required error={permErrors.nom?.[0]}>
            <Input value={permForm.nom} onChange={(e) => setPermForm({ ...permForm, nom: e.target.value })} />
          </Field>
          <Field label="Slug" required error={permErrors.slug?.[0]} hint="Ex : courriers.view">
            <Input value={permForm.slug} onChange={(e) => setPermForm({ ...permForm, slug: e.target.value })} />
          </Field>
          <Field label="Description">
            <Textarea
              value={permForm.description}
              onChange={(e) => setPermForm({ ...permForm, description: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      {/* Suppression rôle */}
      <ConfirmDialog
        open={Boolean(deleteRole)}
        title="Supprimer le rôle"
        tone="danger"
        confirmLabel="Supprimer"
        message={
          <p>
            Supprimer le rôle <span className="font-semibold text-ink">{deleteRole?.nom}</span> ? Il
            doit n'être attribué à aucun utilisateur.
          </p>
        }
        onConfirm={handleDeleteRole}
        onClose={() => setDeleteRole(null)}
      />

      {/* Suppression permission */}
      <ConfirmDialog
        open={Boolean(deletePerm)}
        title="Supprimer la permission"
        tone="danger"
        confirmLabel="Supprimer"
        message={
          <p>
            Supprimer la permission <span className="font-semibold text-ink">{deletePerm?.slug}</span>
            ?
          </p>
        }
        onConfirm={handleDeletePerm}
        onClose={() => setDeletePerm(null)}
      />
    </div>
  )
}
