<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Models\CourrierAnnotation;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourrierAnnotationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $query = CourrierAnnotation::with(['courrier', 'user'])
                ->whereHas('courrier', function ($q) use ($user) {
                    $q->visiblePour($user)->visibleConfidentialite($user);
                });

            if ($request->filled('courrier_id')) {
                $query->where('courrier_id', $request->courrier_id);
            }

            if ($request->filled('etat')) {
                $query->where('etat', $request->etat);
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 15)),
                'Liste des annotations'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'courrier_id' => 'required|exists:courriers,id',
                'annotation' => 'required|string',
                'date_limite' => 'nullable|date',
                'etat' => 'nullable|in:EN_ATTENTE,EN_COURS,EXECUTEE,ANNULEE',
            ]);

            $courrier = Courrier::findOrFail($validated['courrier_id']);

            if (! $courrier->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à ce courrier.', null, 403);
            }

            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Un courrier archivé ne peut plus être annoté.', null, 409);
            }

            $validated['user_id'] = auth()->id();

            $annotation = CourrierAnnotation::create($validated);

            AuditLogger::log(
                'courrier.annote',
                "Annotation ajoutée sur {$courrier->numero} par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                'courrier.annote',
                'Annotation',
                "Annotation ajoutée sur {$courrier->numero} par " . auth()->user()->name,
                null,
                ['annotation_id' => $annotation->id]
            );

            return $this->success(
                $annotation->load(['courrier', 'user']),
                'Annotation ajoutée avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(CourrierAnnotation $annotation)
    {
        try {
            if (! $annotation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette annotation.', null, 403);
            }

            return $this->success(
                $annotation->load(['courrier', 'user']),
                'Détails de l\'annotation'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, CourrierAnnotation $annotation)
    {
        try {
            if (! $annotation->courrier?->estVisiblePar($request->user())) {
                return $this->error('Accès refusé à cette annotation.', null, 403);
            }

            $validated = $request->validate([
                'annotation' => 'sometimes|string',
                'date_limite' => 'nullable|date',
                'etat' => 'nullable|in:EN_ATTENTE,EN_COURS,EXECUTEE,ANNULEE',
            ]);

            $annotation->update($validated);

            CircuitService::etape(
                $annotation->courrier,
                'courrier.annote.modifiee',
                'Instruction',
                "Instruction #{$annotation->id} modifiée par " . auth()->user()->name
            );

            return $this->success(
                $annotation->fresh(['courrier', 'user']),
                'Instruction mise à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(CourrierAnnotation $annotation)
    {
        try {
            if (! $annotation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette annotation.', null, 403);
            }

            if ($annotation->courrier) {
                CircuitService::etape(
                    $annotation->courrier,
                    'courrier.annote.supprimee',
                    'Instruction',
                    "Instruction #{$annotation->id} supprimée par " . auth()->user()->name
                );
            }

            $annotation->delete();
            return $this->success(null, 'Instruction supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}