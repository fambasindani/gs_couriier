<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\StatutCourrier;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CourrierAffectationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            $query = CourrierAffectation::with([
                'courrier', 'direction', 'departement', 'service',
                'user', 'affectePar',
            ])->whereHas('courrier', function ($q) use ($user) {
                $q->visiblePour($user)->visibleConfidentialite($user);
            });

            if ($request->filled('courrier_id')) {
                $query->where('courrier_id', $request->courrier_id);
            }

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            return $this->success(
                $query->orderByDesc('date_affectation')->paginate($request->get('per_page', 15)),
                'Liste des affectations'
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
                'direction_id' => 'nullable|exists:directions,id',
                'departement_id' => 'nullable|exists:departements,id',
                'service_id' => 'nullable|exists:services,id',
                'user_id' => 'nullable|exists:users,id',
                'date_limite' => 'nullable|date',
            ]);

            $courrier = Courrier::findOrFail($validated['courrier_id']);

            if (! $courrier->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à ce courrier.', null, 403);
            }

            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Un courrier archivé ne peut plus être affecté.', null, 409);
            }

            // Au moins une cible doit être renseignée
            if (empty($validated['direction_id']) 
                && empty($validated['departement_id']) 
                && empty($validated['service_id']) 
                && empty($validated['user_id'])) {
                return $this->error('Au moins une cible est requise (direction, département, service ou utilisateur).', null, 422);
            }

            $validated['affecte_par'] = auth()->id();
            $validated['date_affectation'] = now();
            $validated['statut'] = 'AFFECTE';

            $affectation = CourrierAffectation::create($validated);

            // Mettre à jour le statut du courrier (résolu par code, pas d'ID en dur)
            $courrier->update(['statut_id' => StatutCourrier::idParCode('AFFECTE')]);

            AuditLogger::log(
                'courrier.affecte',
                "Courrier {$courrier->numero} affecté par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                'courrier.affecte',
                'Affectation',
                "Courrier {$courrier->numero} affecté par " . auth()->user()->name,
                null,
                ['affectation_id' => $affectation->id]
            );

            return $this->success(
                $affectation->load(['courrier', 'direction', 'departement', 'service', 'user', 'affectePar']),
                'Courrier affecté avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'affectation', $e->getMessage(), 500);
        }
    }

    public function show(CourrierAffectation $affectation)
    {
        try {
            if (! $affectation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette affectation.', null, 403);
            }

            return $this->success(
                $affectation->load(['courrier', 'direction', 'departement', 'service', 'user', 'affectePar']),
                'Détails de l\'affectation'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, CourrierAffectation $affectation)
    {
        try {
            if (! $affectation->courrier?->estVisiblePar($request->user())) {
                return $this->error('Accès refusé à cette affectation.', null, 403);
            }

            $validated = $request->validate([
                'direction_id' => 'nullable|exists:directions,id',
                'departement_id' => 'nullable|exists:departements,id',
                'service_id' => 'nullable|exists:services,id',
                'user_id' => 'nullable|exists:users,id',
                'date_limite' => 'nullable|date',
                'statut' => 'nullable|in:AFFECTE,PRIS_EN_CHARGE,EN_TRAITEMENT,TRAITE,REJETE',
            ]);

            // Mise à jour automatique des dates selon le statut
            if (isset($validated['statut'])) {
                if ($validated['statut'] === 'PRIS_EN_CHARGE' && ! $affectation->date_prise_en_charge) {
                    $validated['date_prise_en_charge'] = now();
                }
                if ($validated['statut'] === 'TRAITE' && ! $affectation->date_traitement) {
                    $validated['date_traitement'] = now();
                }
            }

            $affectation->update($validated);

            AuditLogger::log(
                'courrier.affectation.maj',
                "Affectation #{$affectation->id} mise à jour"
            );

            // Garder le statut du courrier cohérent avec celui de l'affectation
            if (isset($validated['statut']) && $affectation->courrier) {
                $correspondance = [
                    'AFFECTE' => 'AFFECTE',
                    'PRIS_EN_CHARGE' => 'EN_COURS',
                    'EN_TRAITEMENT' => 'EN_COURS',
                    'TRAITE' => 'TRAITE',
                    'REJETE' => 'REJETE',
                ];

                if (isset($correspondance[$validated['statut']])) {
                    $affectation->courrier->update([
                        'statut_id' => StatutCourrier::idParCode($correspondance[$validated['statut']]),
                    ]);

                    CircuitService::etape(
                        $affectation->courrier,
                        'courrier.affectation.statut',
                        'Traitement',
                        "Affectation #{$affectation->id} passée au statut {$validated['statut']}"
                    );
                }
            }

            return $this->success(
                $affectation->fresh(['courrier', 'direction', 'departement', 'service', 'user', 'affectePar']),
                'Affectation mise à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    /**
     * Accusé de réception transversal (ex : DANTIC -> RH).
     * Le service destinataire confirme la réception ; l'émetteur voit l'info en temps réel.
     */
    public function accuserReception(Request $request, CourrierAffectation $affectation)
    {
        try {
            if (! $affectation->courrier?->estVisiblePar($request->user())) {
                return $this->error('Accès refusé à cette affectation.', null, 403);
            }

            if ($affectation->date_accuse_reception) {
                return $this->error('Réception déjà accusée.', null, 409);
            }

            $affectation->update(['date_accuse_reception' => now()]);

            AuditLogger::log(
                'courrier.accuse_reception',
                "Réception accusée pour le courrier {$affectation->courrier?->numero} par " . auth()->user()->name
            );

            if ($affectation->courrier) {
                CircuitService::etape(
                    $affectation->courrier,
                    'courrier.accuse_reception',
                    'Accusé de réception',
                    "Réception du courrier accusée par " . auth()->user()->name,
                    null,
                    ['affectation_id' => $affectation->id]
                );
            }

            return $this->success(
                $affectation->fresh(['courrier', 'direction', 'departement', 'service', 'user', 'affectePar']),
                'Réception accusée'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l’accusé de réception', $e->getMessage(), 500);
        }
    }

    public function destroy(CourrierAffectation $affectation)
    {
        try {
            if (! $affectation->courrier?->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à cette affectation.', null, 403);
            }

            $affectation->delete();
            return $this->success(null, 'Affectation supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}