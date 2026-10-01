<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Archive;
use App\Models\Courrier;
use App\Models\StatutCourrier;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ArchiveController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Archive::with(['courrier', 'category', 'emplacement', 'archivePar']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('cote_archive', 'like', "%{$search}%")
                      ->orWhere('titre_dossier', 'like', "%{$search}%")
                      ->orWhere('producteur_service', 'like', "%{$search}%");
                });
            }

            if ($request->filled('archive_category_id')) {
                $query->where('archive_category_id', $request->archive_category_id);
            }

            if ($request->filled('archive_emplacement_id')) {
                $query->where('archive_emplacement_id', $request->archive_emplacement_id);
            }

            if ($request->filled('statut_archive')) {
                $query->where('statut_archive', $request->statut_archive);
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 15)),
                'Liste des archives'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'courrier_id' => 'nullable|exists:courriers,id',
                'archive_category_id' => 'nullable|exists:archive_categories,id',
                'archive_emplacement_id' => 'nullable|exists:archive_emplacements,id',
                'titre_dossier' => 'required|string|max:255',
                'producteur_service' => 'nullable|string|max:150',
                'date_periode' => 'nullable|string|max:100',
                'duree_conservation_ans' => 'nullable|integer|min:1|max:100',
                'date_versement' => 'nullable|date',
                'observation' => 'nullable|string',
            ]);

            if (! empty($validated['courrier_id'])) {
                $courrierLie = Courrier::find($validated['courrier_id']);
                if ($courrierLie && $courrierLie->statut?->code === 'ARCHIVE') {
                    return $this->error('Ce courrier est déjà archivé.', null, 409);
                }
            }

            $validated['cote_archive'] = Archive::genererCote();
            $validated['archive_par'] = auth()->id();
            $validated['statut_archive'] = 'ACTIF';
            $validated['duree_conservation_ans'] = $validated['duree_conservation_ans'] ?? 5;
            $validated['date_versement'] = $validated['date_versement'] ?? now();

            if (! empty($validated['duree_conservation_ans'])) {
                $validated['date_fin_conservation'] = now()
                    ->addYears($validated['duree_conservation_ans'])
                    ->toDateString();
            }

            $archive = Archive::create($validated);

            AuditLogger::log(
                'archive.creee',
                "Archive {$archive->cote_archive} créée par " . auth()->user()->name
            );

            if ($archive->courrier_id) {
                $courrier = Courrier::find($archive->courrier_id);
                if ($courrier) {
                    $courrier->update(['statut_id' => StatutCourrier::idParCode('ARCHIVE')]);

                    CircuitService::etape(
                        $courrier,
                        'courrier.archive',
                        'Archivage',
                        "Courrier {$courrier->numero} archivé sous la cote {$archive->cote_archive}",
                        null,
                        ['archive_id' => $archive->id, 'cote' => $archive->cote_archive]
                    );
                }
            }

            return $this->success(
                $archive->load(['courrier', 'category', 'emplacement', 'archivePar']),
                'Archive créée avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Archive $archive)
    {
        try {
            return $this->success(
                $archive->load(['courrier', 'category', 'emplacement', 'archivePar']),
                'Détails de l\'archive'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Archive $archive)
    {
        try {
            $validated = $request->validate([
                'archive_category_id' => 'nullable|exists:archive_categories,id',
                'archive_emplacement_id' => 'nullable|exists:archive_emplacements,id',
                'titre_dossier' => 'sometimes|string|max:255',
                'producteur_service' => 'nullable|string|max:150',
                'date_periode' => 'nullable|string|max:100',
                'duree_conservation_ans' => 'nullable|integer|min:1|max:100',
                'statut_archive' => 'nullable|in:ACTIF,VERSE,ELIMINE',
                'observation' => 'nullable|string',
            ]);

            if (array_key_exists('duree_conservation_ans', $validated) && $validated['duree_conservation_ans'] === null) {
                unset($validated['duree_conservation_ans']);
            } elseif (isset($validated['duree_conservation_ans'])) {
                $validated['date_fin_conservation'] = now()
                    ->addYears($validated['duree_conservation_ans'])
                    ->toDateString();
            }

            $archive->update($validated);

            AuditLogger::log(
                'archive.modifiee',
                "Archive {$archive->cote_archive} modifiée par " . auth()->user()->name
            );

            return $this->success(
                $archive->fresh(['courrier', 'category', 'emplacement', 'archivePar']),
                'Archive mise à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Archive $archive)
    {
        try {
            $cote = $archive->cote_archive;
            $courrier = $archive->courrier;

            $archive->delete();

            // Désarchiver le courrier lié si son statut était ARCHIVE
            if ($courrier) {
                $statutArchiveId = StatutCourrier::where('code', 'ARCHIVE')->value('id');

                if ($statutArchiveId && (int) $courrier->statut_id === (int) $statutArchiveId) {
                    $courrier->update(['statut_id' => StatutCourrier::idParCode('EN_COURS')]);

                    CircuitService::etape(
                        $courrier,
                        'courrier.desarchive',
                        'Désarchivage',
                        "Courrier {$courrier->numero} désarchivé (archive {$cote} supprimée)"
                    );
                }
            }

            AuditLogger::log(
                'archive.supprimee',
                "Archive {$cote} supprimée par " . auth()->user()->name
            );

            return $this->success(null, 'Archive supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }

    public function archiverCourrier(Request $request, Courrier $courrier)
    {
        try {
            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Ce courrier est déjà archivé.', null, 409);
            }

            $validated = $request->validate([
                'archive_category_id' => 'nullable|exists:archive_categories,id',
                'archive_emplacement_id' => 'nullable|exists:archive_emplacements,id',
                'titre_dossier' => 'nullable|string|max:255',
                'duree_conservation_ans' => 'nullable|integer|min:1|max:100',
                'observation' => 'nullable|string',
            ]);

            $validated['courrier_id'] = $courrier->id;
            $validated['cote_archive'] = Archive::genererCote();
            $validated['archive_par'] = auth()->id();
            $validated['titre_dossier'] = $validated['titre_dossier'] ?? $courrier->objet;
            $validated['producteur_service'] = $courrier->createur?->name;
            $validated['date_periode'] = $courrier->date_courrier?->format('Y-m-d');
            $validated['statut_archive'] = 'ACTIF';
            $validated['date_versement'] = now();

            if (! empty($validated['duree_conservation_ans'])) {
                $validated['date_fin_conservation'] = now()
                    ->addYears($validated['duree_conservation_ans'])
                    ->toDateString();
            }

            $validated['duree_conservation_ans'] = $validated['duree_conservation_ans'] ?? 5;

            $archive = Archive::create($validated);

            $courrier->update(['statut_id' => StatutCourrier::idParCode('ARCHIVE')]);

            AuditLogger::log(
                'courrier.archive',
                "Courrier {$courrier->numero} archivé sous la cote {$archive->cote_archive}"
            );

            CircuitService::etape(
                $courrier,
                'courrier.archive',
                'Archivage',
                "Courrier archivé sous la cote {$archive->cote_archive} par " . auth()->user()->name,
                null,
                ['archive_id' => $archive->id, 'cote' => $archive->cote_archive]
            );

            return $this->success(
                $archive->load(['courrier', 'category', 'emplacement', 'archivePar']),
                'Courrier archivé avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'archivage', $e->getMessage(), 500);
        }
    }
}