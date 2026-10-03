import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, RotateCcw, Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ConfidentialiteBadge, StatutBadge } from '@/components/ui/Badge'
import { Field, Input, Select } from '@/components/ui/Field'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { TableBodySkeleton } from '@/components/ui/Skeletons'
import { courriersService, type RechercheParams } from '@/services/courriers.service'
import { useReferentiels } from '@/hooks/useReferentiels'
import { formatDate, typeCourrierLibelle } from '@/lib/utils'
import type { Courrier, Paginated } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const PER_PAGE = 15

const CONFIDENTIALITES = ['PUBLIC', 'INTERNE', 'CONFIDENTIEL', 'TRES_CONFIDENTIEL']

const SORT_OPTIONS = [
  { value: 'created_at', label: "Date d'enregistrement" },
  { value: 'date_reception', label: 'Date de réception' },
  { value: 'date_limite', label: "Date limite" },
  { value: 'numero', label: 'Numéro' },
  { value: 'objet', label: 'Objet' },
  { value: 'priorite_id', label: 'Priorité' },
  { value: 'statut_id', label: 'Statut' },
]

export function RechercheAvanceePage() {
  const referentiels = useReferentiels()
  const [searchParams] = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const [typeId, setTypeId] = useState('')
  const [categorieId, setCategorieId] = useState('')
  const [prioriteId, setPrioriteId] = useState('')
  const [statutId, setStatutId] = useState('')
  const [expediteurId, setExpediteurId] = useState('')
  const [destinataireId, setDestinataireId] = useState('')
  const [confidentialites, setConfidentialites] = useState<string[]>([])
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [dateLimiteDebut, setDateLimiteDebut] = useState('')
  const [dateLimiteFin, setDateLimiteFin] = useState('')
  const [minPieces, setMinPieces] = useState('')
  const [maxPieces, setMaxPieces] = useState('')
  const [enRetard, setEnRetard] = useState(false)
  const [avecPieces, setAvecPieces] = useState(false)
  const [avecReponses, setAvecReponses] = useState(false)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const [applied, setApplied] = useState<RechercheParams>({})
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Paginated<Courrier> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useMemo<RechercheParams>(
    () => ({ ...applied, page, per_page: PER_PAGE }),
    [applied, page],
  )

  useEffect(() => {
    let active = true
    setLoading(true)

    if (USE_MOCK) {
      setData({ current_page: 1, data: [], last_page: 1, per_page: PER_PAGE, total: 0, from: 0, to: 0 })
      setLoading(false)
      return
    }

    courriersService
      .rechercheAvancee(params)
      .then((res) => {
        if (active) {
          setData(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Erreur de recherche.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [params])

  const toggleConfidentialite = (value: string) => {
    setConfidentialites((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    )
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    setApplied({
      q: q || undefined,
      type_courrier_id: typeId || undefined,
      categorie_id: categorieId || undefined,
      priorite_id: prioriteId || undefined,
      statut_id: statutId || undefined,
      expediteur_id: expediteurId || undefined,
      destinataire_id: destinataireId || undefined,
      confidentialite: confidentialites.length ? confidentialites.join(',') : undefined,
      date_debut: dateDebut || undefined,
      date_fin: dateFin || undefined,
      date_limite_debut: dateLimiteDebut || undefined,
      date_limite_fin: dateLimiteFin || undefined,
      min_pieces: minPieces || undefined,
      max_pieces: maxPieces || undefined,
      en_retard: enRetard || undefined,
      avec_pieces: avecPieces || undefined,
      avec_reponses: avecReponses || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    })
  }

  const reset = () => {
    setQ('')
    setTypeId('')
    setCategorieId('')
    setPrioriteId('')
    setStatutId('')
    setExpediteurId('')
    setDestinataireId('')
    setConfidentialites([])
    setDateDebut('')
    setDateFin('')
    setDateLimiteDebut('')
    setDateLimiteFin('')
    setMinPieces('')
    setMaxPieces('')
    setEnRetard(false)
    setAvecPieces(false)
    setAvecReponses(false)
    setSortBy('created_at')
    setSortDir('desc')
    setPage(1)
    setApplied({})
  }

  return (
    <div>
      <PageHeader
        title="Recherche avancée"
        subtitle="Combinez plusieurs critères pour retrouver précisément un courrier."
      />

      {error && (
        <div className="mb-4 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.85rem] text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="md:col-span-2 xl:col-span-4">
              <Field label="Mot-clé (numéro, référence, objet, contenu, observation)">
                <Input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder="Rechercher..."
                />
              </Field>
            </div>

            <Field label="Type">
              <Select value={typeId} onChange={(event) => setTypeId(event.target.value)}>
                <option value="">Tous</option>
                {referentiels.types.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Catégorie">
              <Select value={categorieId} onChange={(event) => setCategorieId(event.target.value)}>
                <option value="">Toutes</option>
                {referentiels.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priorité">
              <Select value={prioriteId} onChange={(event) => setPrioriteId(event.target.value)}>
                <option value="">Toutes</option>
                {referentiels.priorites.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Statut">
              <Select value={statutId} onChange={(event) => setStatutId(event.target.value)}>
                <option value="">Tous</option>
                {referentiels.statuts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.libelle}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Expéditeur">
              <Select value={expediteurId} onChange={(event) => setExpediteurId(event.target.value)}>
                <option value="">Tous</option>
                {referentiels.expediteurs.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Destinataire">
              <Select
                value={destinataireId}
                onChange={(event) => setDestinataireId(event.target.value)}
              >
                <option value="">Tous</option>
                {referentiels.destinataires.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Réception du">
              <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </Field>
            <Field label="Réception au">
              <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            </Field>

            <Field label="Échéance du">
              <Input
                type="date"
                value={dateLimiteDebut}
                onChange={(e) => setDateLimiteDebut(e.target.value)}
              />
            </Field>
            <Field label="Échéance au">
              <Input
                type="date"
                value={dateLimiteFin}
                onChange={(e) => setDateLimiteFin(e.target.value)}
              />
            </Field>
            <Field label="Pièces min.">
              <Input
                type="number"
                min={0}
                value={minPieces}
                onChange={(e) => setMinPieces(e.target.value)}
              />
            </Field>
            <Field label="Pièces max.">
              <Input
                type="number"
                min={0}
                value={maxPieces}
                onChange={(e) => setMaxPieces(e.target.value)}
              />
            </Field>

            <Field label="Tri">
              <Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ordre">
              <Select
                value={sortDir}
                onChange={(event) => setSortDir(event.target.value as 'asc' | 'desc')}
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </Select>
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="text-[0.78rem] font-semibold text-slate-500">Confidentialité :</span>
            {CONFIDENTIALITES.map((value) => (
              <label key={value} className="flex items-center gap-2 text-[0.82rem] text-slate-600">
                <input
                  type="checkbox"
                  checked={confidentialites.includes(value)}
                  onChange={() => toggleConfidentialite(value)}
                  className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
                />
                {value}
              </label>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="flex items-center gap-2 text-[0.82rem] text-slate-600">
              <input
                type="checkbox"
                checked={enRetard}
                onChange={(event) => setEnRetard(event.target.checked)}
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
              />
              En retard uniquement
            </label>
            <label className="flex items-center gap-2 text-[0.82rem] text-slate-600">
              <input
                type="checkbox"
                checked={avecPieces}
                onChange={(event) => setAvecPieces(event.target.checked)}
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
              />
              Avec pièces jointes
            </label>
            <label className="flex items-center gap-2 text-[0.82rem] text-slate-600">
              <input
                type="checkbox"
                checked={avecReponses}
                onChange={(event) => setAvecReponses(event.target.checked)}
                className="h-4 w-4 rounded border-line text-primary focus:ring-primary/20"
              />
              Avec réponses
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" type="button" icon={<RotateCcw className="h-4 w-4" />} onClick={reset}>
              Réinitialiser
            </Button>
            <Button type="submit" icon={<Search className="h-4 w-4" />}>
              Rechercher
            </Button>
          </div>
        </Card>
      </form>

      <Card className="mt-5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h6 className="section-title mb-0">Résultats</h6>
          <span className="text-[0.8rem] text-slate-400">{data?.total ?? 0} résultat(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-custom w-full">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Type</th>
                <th>Objet</th>
                <th>Expéditeur</th>
                <th>Réception</th>
                <th>Confidentialité</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <TableBodySkeleton rows={8} cols={8} />}
              {!loading && (data?.data.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={<Search className="h-6 w-6" />}
                      title="Aucun résultat"
                      description="Modifiez vos critères puis relancez la recherche."
                    />
                  </td>
                </tr>
              )}
              {!loading &&
                data?.data.map((courrier) => (
                  <tr key={courrier.id}>
                    <td className="font-semibold text-primary">
                      <Link to={`/courriers/${courrier.id}`} className="hover:underline">
                        {courrier.numero}
                      </Link>
                    </td>
                    <td className="text-slate-500">                {typeCourrierLibelle(courrier)}</td>
                    <td className="max-w-[260px]">{courrier.objet}</td>
                    <td>{courrier.expediteur?.nom ?? '—'}</td>
                    <td>{formatDate(courrier.date_reception)}</td>
                    <td>
                      <ConfidentialiteBadge value={courrier.confidentialite} />
                    </td>
                    <td>
                      <StatutBadge code={courrier.statut?.code} libelle={courrier.statut?.libelle} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/courriers/${courrier.id}`}
                        className="inline-flex rounded-md border border-line bg-white p-1.5 text-primary hover:bg-primary/5"
                        title="Consulter"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
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
    </div>
  )
}
