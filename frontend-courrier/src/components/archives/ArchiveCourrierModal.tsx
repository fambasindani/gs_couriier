import { useEffect, useState } from 'react'
import { Archive as ArchiveIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { courriersService } from '@/services/courriers.service'
import { archiveCategoriesService, archiveEmplacementsService } from '@/services/archives.service'
import type {
  ArchiveCategory,
  ArchiveEmplacement,
  Courrier,
  CourrierAffectation,
} from '@/types'

interface ArchiveCourrierModalProps {
  open: boolean
  courrier: Courrier | null
  onClose: () => void
  onSuccess?: () => void
}

interface ArchiveFormState {
  titre_dossier: string
  producteur_service: string
  date_periode: string
  duree_conservation_ans: string
  archive_category_id: string
  archive_emplacement_id: string
  observation: string
}

const EMPTY_FORM: ArchiveFormState = {
  titre_dossier: '',
  producteur_service: '',
  date_periode: '',
  duree_conservation_ans: '5',
  archive_category_id: '',
  archive_emplacement_id: '',
  observation: '',
}

function formatDatePart(value?: string | null): string {
  if (!value) return ''
  return value.slice(0, 10)
}

/** Producteur du dossier : service/direction destinataire, sinon l'auteur de l'enregistrement. */
function producteurParDefaut(courrier: Courrier): string {
  return (
    courrier.destinataire?.nom ??
    courrier.expediteur?.nom ??
    courrier.createur?.name ??
    (courrier as Courrier & { affectations?: CourrierAffectation[] })
      .affectations?.[0]?.direction?.libelle ??
    (courrier as Courrier & { affectations?: CourrierAffectation[] })
      .affectations?.[0]?.service?.libelle ??
    ''
  )
}

/** Modal « Nouvelle archive » : pré-remplit les champs depuis le courrier et
 *  exige la sélection d'une catégorie et d'un emplacement avant d'archiver. */
export function ArchiveCourrierModal({
  open,
  courrier,
  onClose,
  onSuccess,
}: ArchiveCourrierModalProps) {
  const [categories, setCategories] = useState<ArchiveCategory[]>([])
  const [emplacements, setEmplacements] = useState<ArchiveEmplacement[]>([])
  const [form, setForm] = useState<ArchiveFormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([archiveCategoriesService.all(), archiveEmplacementsService.all()])
      .then(([cats, emps]) => {
        setCategories(cats)
        setEmplacements(emps)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!open || !courrier) return
    setForm({
      titre_dossier: `${courrier.numero} — ${courrier.objet}`,
      producteur_service: producteurParDefaut(courrier),
      date_periode: formatDatePart(courrier.date_courrier ?? courrier.date_reception),
      duree_conservation_ans: '5',
      archive_category_id: '',
      archive_emplacement_id: '',
      observation: courrier.observation ?? '',
    })
    setError(null)
    setSaving(false)
  }, [open, courrier])

  const set = (key: keyof ArchiveFormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async () => {
    if (!courrier) return
    if (!form.archive_category_id || !form.archive_emplacement_id) {
      setError("Veuillez sélectionner une catégorie et un emplacement avant d'archiver.")
      return
    }
    setError(null)
    setSaving(true)
    try {
      await courriersService.archiver(courrier.id, {
        archive_category_id: Number(form.archive_category_id),
        archive_emplacement_id: Number(form.archive_emplacement_id),
        titre_dossier: form.titre_dossier.trim(),
        producteur_service: form.producteur_service.trim() || null,
        date_periode: form.date_periode || null,
        duree_conservation_ans: form.duree_conservation_ans
          ? Number(form.duree_conservation_ans)
          : null,
        observation: form.observation.trim() || null,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'archivage.")
    } finally {
      setSaving(false)
    }
  }

  const canSubmit =
    Boolean(form.archive_category_id && form.archive_emplacement_id) && !saving

  return (
    <Modal
      open={open}
      title={`Nouvelle archive${courrier ? ` — ${courrier.numero}` : ''}`}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
            {saving ? 'Archivage…' : 'Archiver'}
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
          <ArchiveIcon className="h-4 w-4" /> {error}
        </div>
      )}
      <div className="space-y-4">
        <Field label="Titre du dossier" required>
          <Input
            value={form.titre_dossier}
            onChange={(event) => set('titre_dossier', event.target.value)}
            placeholder="Intitulé du dossier à archiver"
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Producteur du dossier">
            <Input
              value={form.producteur_service}
              onChange={(event) => set('producteur_service', event.target.value)}
              placeholder="Service / organisme producteur"
            />
          </Field>
          <Field label="Période">
            <Input
              type="date"
              value={form.date_periode}
              onChange={(event) => set('date_periode', event.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Field label="Catégorie d'archive" required>
            <Select
              value={form.archive_category_id}
              onChange={(event) => set('archive_category_id', event.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.libelle}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Emplacement" required>
            <Select
              value={form.archive_emplacement_id}
              onChange={(event) => set('archive_emplacement_id', event.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {emplacements.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.intitule}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Conservation (années)">
            <Input
              type="number"
              min={1}
              max={100}
              value={form.duree_conservation_ans}
              onChange={(event) => set('duree_conservation_ans', event.target.value)}
            />
          </Field>
        </div>

        <Field label="Observation">
          <Textarea
            value={form.observation}
            onChange={(event) => set('observation', event.target.value)}
          />
        </Field>
      </div>
    </Modal>
  )
}