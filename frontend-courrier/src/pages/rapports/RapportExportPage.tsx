import { useState } from 'react'
import { AlertTriangle, Download, FileSpreadsheet } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Field'
import { PeriodFilter, firstDayOfMonth, today } from '@/components/rapports/PeriodFilter'
import { rapportsService } from '@/services/rapports.service'

export function RapportExportPage() {
  const [debut, setDebut] = useState(firstDayOfMonth())
  const [fin, setFin] = useState(today())
  const [type, setType] = useState('courriers')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    setSuccess(false)
    try {
      await rapportsService.exportCsv({ type, date_debut: debut, date_fin: fin })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'export.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Export de données"
        subtitle="Générer un fichier CSV des courriers sur une période."
      />

      <Card className="max-w-3xl p-5">
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-surface p-4">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
          </span>
          <div className="text-[0.85rem] text-slate-600">
            L'export contient : <span className="font-medium text-ink">Numéro, Objet, Type, Priorité, Statut, Date réception, Date limite</span>.
            Le fichier est encodé en UTF-8 (compatible Excel).
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-[0.82rem] text-danger">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-success/20 bg-success/5 px-3 py-2 text-[0.82rem] text-success">
            Export généré — vérifiez vos téléchargements.
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          <Field label="Type d'export">
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="courriers">Courriers</option>
            </Select>
          </Field>

          <div>
            <span className="mb-1.5 block text-[0.8rem] font-semibold text-ink">Période</span>
            <PeriodFilter
              debut={debut}
              fin={fin}
              onChange={(d, f) => {
                setDebut(d)
                setFin(f)
              }}
              onApply={() => undefined}
              hideApply
            />
          </div>

          <div className="flex justify-end">
            <Button
              icon={<Download className="h-4 w-4" />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Génération…' : 'Exporter en CSV'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mt-5 max-w-3xl p-5">
        <h6 className="section-title">Bon à savoir</h6>
        <ul className="list-inside list-disc space-y-1.5 text-[0.83rem] text-slate-600">
          <li>Seuls les courriers dont la <span className="font-medium">date de réception</span> est comprise dans la période sont exportés.</li>
          <li>L'export est authentifié : votre token de session est utilisé.</li>
          <li>D'autres types d'export pourront être ajoutés (archives, workflow, etc.).</li>
        </ul>
      </Card>
    </div>
  )
}
