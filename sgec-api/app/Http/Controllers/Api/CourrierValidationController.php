<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Models\CourrierValidation;
use App\Models\StatutCourrier;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourrierValidationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $query = CourrierValidation::with(['courrier', 'user'])
                ->whereHas('courrier', function ($q) use ($user) {
                    $q->visiblePour($user)->visibleConfidentialite($user);
                });

            if ($request->filled('courrier_id')) {
                $query->where('courrier_id', $request->courrier_id);
            }

            if ($request->filled('decision')) {
                $query->where('decision', $request->decision);
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 15)),
                'Liste des validations'
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
                'decision' => 'required|in:VISE,VALIDE,REJETE',
                'commentaire' => 'nullable|string',
            ]);

            $courrier = Courrier::findOrFail($validated['courrier_id']);

            if (! $courrier->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à ce courrier.', null, 403);
            }

            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Un courrier archivé ne peut plus être validé.', null, 409);
            }

            $validated['user_id'] = auth()->id();
            $validated['date_validation'] = now();

            $validation = CourrierValidation::create($validated);

            // Mettre à jour le statut du courrier selon la décision (résolu par code)

            $codeStatut = match ($validated['decision']) {
                'VISE', 'VALIDE' => 'VALIDE',
                'REJETE' => 'REJETE',
                default => null,
            };

            if ($codeStatut) {
                $courrier->update(['statut_id' => StatutCourrier::idParCode($codeStatut)]);
            }

            AuditLogger::log(
                'courrier.valide',
                "Courrier {$courrier->numero} {$validated['decision']} par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                $codeStatut === 'REJETE' ? 'courrier.rejete' : 'courrier.valide',
                'Validation',
                "Courrier {$courrier->numero} {$validated['decision']} par " . auth()->user()->name,
                null,
                ['validation_id' => $validation->id, 'decision' => $validated['decision']]
            );

            return $this->success(
                $validation->load(['courrier', 'user']),
                'Validation enregistrée avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la validation', $e->getMessage(), 500);
        }
    }

    public function show(CourrierValidation $validation)
    {
        try {
            if (! $validation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette validation.', null, 403);
            }

            return $this->success(
                $validation->load(['courrier', 'user']),
                'Détails de la validation'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, CourrierValidation $validation)
    {
        try {
            if (! $validation->courrier?->estVisiblePar($request->user())) {
                return $this->error('Accès refusé à cette validation.', null, 403);
            }

            $validated = $request->validate([
                'decision' => 'sometimes|in:VISE,VALIDE,REJETE',
                'commentaire' => 'nullable|string',
            ]);

            $validation->update($validated);

            // Resynchroniser le statut du courrier si la décision change
            if (isset($validated['decision']) && $validation->courrier) {
                $codeStatut = match ($validated['decision']) {
                    'VISE', 'VALIDE' => 'VALIDE',
                    'REJETE' => 'REJETE',
                    default => null,
                };

                if ($codeStatut) {
                    $validation->courrier->update([
                        'statut_id' => StatutCourrier::idParCode($codeStatut),
                    ]);

                    CircuitService::etape(
                        $validation->courrier,
                        $codeStatut === 'REJETE' ? 'courrier.rejete' : 'courrier.valide',
                        'Validation',
                        "Décision de validation #{$validation->id} mise à jour : {$validated['decision']}"
                    );
                }
            }

            return $this->success(
                $validation->fresh(['courrier', 'user']),
                'Validation mise à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(CourrierValidation $validation)
    {
        try {
            if (! $validation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette validation.', null, 403);
            }

            $validation->delete();
            return $this->success(null, 'Validation supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}