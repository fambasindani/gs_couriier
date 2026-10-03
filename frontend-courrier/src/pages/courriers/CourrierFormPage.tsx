import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { courriersService, type CourrierPayload } from '@/services/courriers.service'
import { ApiError } from '@/lib/http'
import { useReferentiels } from '@/hooks/useReferentiels'
import { useConfirm } from '@/stores/confirm.store'
import { transitionsAutorisees } from '@/lib/statuts'
import type { CourrierDetail } from '@/types'

interface FormState {
  type_courrier_id: string
  categorie_id: string
  priorite_id: string
  statut_id: string
  expediteur_id: string
  destinataire_id: string
  reference_externe: string
  objet: string
  contenu: string
  date_courrier: string
  date_reception: string
  date_limite: string
  date_cloture: string
  confidentialite: string
  nombre_pages: string
  observation: string
}

const EMPTY: FormState = {
  type_courrier_id: '',
  categorie_id: '',
  priorite_id: '',
  statut_id: '',
  expediteur_id: '',
  destinataire_id: '',
  reference_externe: '',
  objet: '',
  contenu: '',
  date_courrier: '',
  date_reception: '',
  date_limite: '',
  date_cloture: '',
  confidentialite: 'INTERNE',
  nombre_pages: '',
  observation: '',
}

/** Convertit une date ISO en valeur acceptée par <input type="datetime-local">. */
function toLocalInput(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function toDateInput(value?: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

export function CourrierFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const referentiels = useReferentiels()
  const confirm = useConfirm()

  const [form, setForm] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [archived, setArchived] = useState(false)
  const [currentStatutCode, setCurrentStatutCode] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    courriersService
      .show(id)
      .then((res) => {
        if (!active) return
        const courrier: CourrierDetail = res.data
        setForm({
          type_courrier_id: String(courrier.type_courrier?.id ?? ''),
          categorie_id: String(courrier.categorie?.id ?? ''),
          priorite_id: String(courrier.priorite?.id ?? ''),
          statut_id: String(courrier.statut?.id ?? ''),
          expediteur_id: String(courrier.expediteur?.id ?? ''),
          destinataire_id: String(courrier.destinataire?.id ?? ''),
          reference_externe: courrier.reference_externe ?? '',
          objet: courrier.objet ?? '',
          contenu: courrier.contenu ?? '',
          date_courrier: toDateInput(courrier.date_courrier),
          date_reception: toLocalInput(courrier.date_reception),
          date_limite: toLocalInput(courrier.date_limite),
          date_cloture: toLocalInput(courrier.date_cloture),
          confidentialite: courrier.confidentialite ?? 'INTERNE',
          nombre_pages: courrier.nombre_pages ? String(courrier.nombre_pages) : '',
          observation: courrier.observation ?? '',
        })
        setArchived(courrier.statut?.code === 'ARCHIVE')
        setCurrentStatutCode(courrier.statut?.code ?? null)
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
  }, [id])

  const title = isEdit ? 'Modifier le courrier' : 'Enregistrer un courrier'

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const payload = useMemo<CourrierPayload>(
    () => ({
      type_courrier_id: Number(form.type_courrier_id),
      categorie_id: form.categorie_id ? Number(form.categorie_id) : null,
      priorite_id: Number(form.priorite_id),
      statut_id: Number(form.statut_id),
      expediteur_id: form.expediteur_id ? Number(form.expediteur_id) : null,
      destinataire_id: form.destinataire_id ? Number(form.destinataire_id) : null,
      reference_externe: form.reference_externe || null,
      objet: form.objet,
      contenu: form.contenu || null,
      date_courrier: form.date_courrier || null,
      date_reception: form.date_reception || null,
      date_limite: form.date_limite || null,
      date_cloture: form.date_cloture || null,
      confidentialite: form.confidentialite,
      nombre_pages: form.nombre_pages ? Number(form.nombre_pages) : null,
      observation: form.observation || null,
    }),
    [form],
  )

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const ok = await confirm({
      title: isEdit ? 'Mettre à jour le courrier' : 'Enregistrer le courrier',
      message: 'Confirmez-vous l’enregistrement de ces informations ?',
      confirmLabel: isEdit ? 'Mettre à jour' : 'Enregistrer',
    })
    if (!ok) return
    setSaving(true)
    setError(null)
    setFieldErrors({})
    try {
      if (isEdit && id) {
        await courriersService.update(id, payload)
        navigate(`/courriers/${id}`)
      } else {
        const res = await courriersService.create(payload)
        navigate(`/courriers/${res.data.id}`)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.errors && typeof err.errors === 'object') {
          setFieldErrors(err.errors as Record<string, string[]>)
        }
      } else {
        setError('Erreur lors de l’enregistrement.')
      }
    } finally {
      setSaving(false)
    }
  }

  const fieldError = (key: keyof FormState) => fieldErrors[key]?.[0]

  // En création : un courrier démarre systématiquement en « Enregistré » (workflow standard).
  // En édition : ne proposer que le statut actuel + les transitions autorisées.
  const statutsDisponibles = referentiels.statuts.filter((item) => {
    if (!isEdit) return item.code === 'ENREGISTRE'
    if (!currentStatutCode) return true
    return (
      item.code === currentStatutCode ||
      transitionsAutorisees(currentStatutCode).includes(item.code ?? '')
    )
  })

  useEffect(() => {
    if (isEdit) return
    const enregistre = referentiels.statuts.find((s) => s.code === 'ENREGISTRE')
    if (enregistre) setForm((prev) => ({ ...prev, statut_id: String(enregistre.id) }))
  }, [isEdit, referentiels.statuts])

  return (
    <div>
      <PageHeader
        title={title}
        subtitle="Renseignez les informations du courrier puis enregistrez."
        actions={
          <Link to={isEdit && id ? `/courriers/${id}` : '/courriers'}>
            <Button variant="ghost" icon={<ArrowLeft className="h-4 w-4" />}>
              Annuler
            </Button>
          </Link>
        }
      />

      {error && Object.keys(fieldErrors).length === 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {archived && (
        <div className="mb-4 rounded-xl border border-warning/20 bg-warning/5 px-4 py-3 text-[0.85rem] text-warning">
          Ce courrier est archivé : les modifications sont désactivées.
        </div>
      )}

      {/* noValidate : on laisse l'API déclencher les erreurs pour les afficher sous chaque champ */}
      <form onSubmit={handleSubmit} noValidate>
        <Card className="p-5">
          {loading ? (
            <p className="py-10 text-center text-[0.85rem] text-slate-400">Chargement…</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Type de courrier" required error={fieldError('type_courrier_id')}>
                <Select
                  value={form.type_courrier_id}
                  onChange={(event) => set('type_courrier_id', event.target.value)}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {referentiels.types.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.libelle}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Catégorie" error={fieldError('categorie_id')}>
                <Select
                  value={form.categorie_id}
                  onChange={(event) => set('categorie_id', event.target.value)}
                >
                  <option value="">— Aucune —</option>
                  {referentiels.categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.libelle}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Priorité" required error={fieldError('priorite_id')}>
                <Select
                  value={form.priorite_id}
                  onChange={(event) => set('priorite_id', event.target.value)}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {referentiels.priorites.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.libelle}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Statut" required error={fieldError('statut_id')}>
                <Select
                  value={form.statut_id}
                  onChange={(event) => set('statut_id', event.target.value)}
                  required
                >
                  <option value="">— Sélectionner —</option>
                  {statutsDisponibles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.libelle}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Expéditeur" error={fieldError('expediteur_id')}>
                <Select
                  value={form.expediteur_id}
                  onChange={(event) => set('expediteur_id', event.target.value)}
                >
                  <option value="">— Aucun —</option>
                  {referentiels.expediteurs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Destinataire" error={fieldError('destinataire_id')}>
                <Select
                  value={form.destinataire_id}
                  onChange={(event) => set('destinataire_id', event.target.value)}
                >
                  <option value="">— Aucun —</option>
                  {referentiels.destinataires.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Référence externe" error={fieldError('reference_externe')}>
                <Input
                  value={form.reference_externe}
                  onChange={(event) => set('reference_externe', event.target.value)}
                  placeholder="MIN/BUD/2026/045"
                />
              </Field>

              <Field label="Confidentialité">
                <Select
                  value={form.confidentialite}
                  onChange={(event) => set('confidentialite', event.target.value)}
                >
                  <option value="PUBLIC">Public</option>
                  <option value="INTERNE">Interne</option>
                  <option value="CONFIDENTIEL">Confidentiel</option>
                  <option value="TRES_CONFIDENTIEL">Très confidentiel</option>
                </Select>
              </Field>

              <Field label="Nombre de pages" error={fieldError('nombre_pages')}>
                <Input
                  type="number"
                  min={0}
                  value={form.nombre_pages}
                  onChange={(event) => set('nombre_pages', event.target.value)}
                />
              </Field>

              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Objet" required error={fieldError('objet')}>
                  <Input
                    value={form.objet}
                    onChange={(event) => set('objet', event.target.value)}
                    placeholder="Objet du courrier"
                    required
                  />
                </Field>
              </div>

              <Field label="Date du courrier" error={fieldError('date_courrier')}>
                <Input
                  type="date"
                  value={form.date_courrier}
                  onChange={(event) => set('date_courrier', event.target.value)}
                />
              </Field>
              <Field label="Date de réception" error={fieldError('date_reception')}>
                <Input
                  type="datetime-local"
                  value={form.date_reception}
                  onChange={(event) => set('date_reception', event.target.value)}
                />
              </Field>
              <Field label="Date limite" error={fieldError('date_limite')}>
                <Input
                  type="datetime-local"
                  value={form.date_limite}
                  onChange={(event) => set('date_limite', event.target.value)}
                />
              </Field>
              <Field label="Date de clôture" error={fieldError('date_cloture')}>
                <Input
                  type="datetime-local"
                  value={form.date_cloture}
                  onChange={(event) => set('date_cloture', event.target.value)}
                />
              </Field>

              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Contenu">
                  <Textarea
                    value={form.contenu}
                    onChange={(event) => set('contenu', event.target.value)}
                  />
                </Field>
              </div>

              <div className="md:col-span-2 xl:col-span-3">
                <Field label="Observation">
                  <Textarea
                    value={form.observation}
                    onChange={(event) => set('observation', event.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}
        </Card>

        <div className="mt-4 flex justify-end gap-2">
          <Link to={isEdit && id ? `/courriers/${id}` : '/courriers'}>
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving || archived}
            icon={<Save className="h-4 w-4" />}
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
