<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CourrierController extends Controller
{
    use ApiResponse;

    // =====================================================================
    // CRUD de base
    // =====================================================================

    public function index(Request $request)
    {
        try {
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())->with([
                'typeCourrier', 'categorie', 'priorite', 'statut',
                'expediteur', 'destinataire', 'createur',
            ]);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('numero', 'like', "%{$search}%")
                      ->orWhere('reference_externe', 'like', "%{$search}%")
                      ->orWhere('objet', 'like', "%{$search}%")
                      ->orWhere('contenu', 'like', "%{$search}%");
                });
            }

            if ($request->filled('type_courrier_id')) {
                $query->where('type_courrier_id', $request->type_courrier_id);
            }

            if ($request->filled('categorie_id')) {
                $query->where('categorie_id', $request->categorie_id);
            }

            if ($request->filled('priorite_id')) {
                $query->where('priorite_id', $request->priorite_id);
            }

            if ($request->filled('statut_id')) {
                $query->where('statut_id', $request->statut_id);
            }

            if ($request->filled('confidentialite')) {
                $query->where('confidentialite', $request->confidentialite);
            }

            if ($request->filled('date_debut')) {
                $query->whereDate('date_reception', '>=', $request->date_debut);
            }

            if ($request->filled('date_fin')) {
                $query->whereDate('date_reception', '<=', $request->date_fin);
            }

            $courriers = $query->orderByDesc('created_at')
                               ->paginate($request->get('per_page', 15));

            return $this->success($courriers, 'Liste des courriers');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'reference_externe' => 'nullable|string|max:150',
                'type_courrier_id' => 'required|exists:type_courriers,id',
                'categorie_id' => 'nullable|exists:categorie_courriers,id',
                'priorite_id' => 'required|exists:priorites,id',
                'statut_id' => 'required|exists:statut_courriers,id',
                'expediteur_id' => 'nullable|exists:expediteurs,id',
                'destinataire_id' => 'nullable|exists:destinataires,id',
                'courrier_parent_id' => 'nullable|exists:courriers,id',
                'objet' => 'required|string|max:500',
                'contenu' => 'nullable|string',
                'date_courrier' => 'nullable|date',
                'date_reception' => 'nullable|date',
                'date_limite' => 'nullable|date',
                'date_cloture' => 'nullable|date',
                'confidentialite' => 'nullable|in:PUBLIC,INTERNE,CONFIDENTIEL,TRES_CONFIDENTIEL',
                // 'nombre_pieces' est géré automatiquement par CourrierPieceController
                'nombre_pages' => 'nullable|integer|min:0',
                'observation' => 'nullable|string',
            ]);

            return DB::transaction(function () use ($validated) {
                $validated['numero'] = Courrier::genererNumero();
                $validated['created_by'] = auth()->id();
                $validated['date_reception'] = $validated['date_reception'] ?? now();
                // Colonne NOT NULL : on évite d'insérer null
                $validated['nombre_pages'] = $validated['nombre_pages'] ?? 0;

                $courrier = Courrier::create($validated);

                AuditLogger::log(
                    'courrier.created',
                    "Courrier {$courrier->numero} créé par " . auth()->user()->name
                );

                CircuitService::etape(
                    $courrier,
                    'courrier.cree',
                    'Enregistrement',
                    "Courrier {$courrier->numero} créé par " . auth()->user()->name,
                    null,
                    ['numero' => $courrier->numero, 'objet' => $courrier->objet]
                );

                return $this->success(
                    $courrier->load([
                        'typeCourrier', 'categorie', 'priorite', 'statut',
                        'expediteur', 'destinataire', 'createur',
                    ]),
                    'Courrier enregistré avec succès',
                    201
                );
            });
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar(auth()->user())) {
                return $this->error('Accès refusé à ce courrier.', null, 403);
            }

            return $this->success(
                $courrier->load([
                    'typeCourrier', 'categorie', 'priorite', 'statut',
                    'expediteur', 'destinataire', 'createur', 'modificateur',
                    'parent', 'reponses', 'pieces', 'affectations',
                    'annotations', 'validations', 'historiques',
                ]),
                'Détails du courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar($request->user())) {
                return $this->error('Accès refusé à ce courrier.', null, 403);
            }

            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Un courrier archivé ne peut plus être modifié.', null, 409);
            }

            $validated = $request->validate([
                'reference_externe' => 'nullable|string|max:150',
                'type_courrier_id' => 'sometimes|exists:type_courriers,id',
                'categorie_id' => 'nullable|exists:categorie_courriers,id',
                'priorite_id' => 'sometimes|exists:priorites,id',
                'statut_id' => 'sometimes|exists:statut_courriers,id',
                'expediteur_id' => 'nullable|exists:expediteurs,id',
                'destinataire_id' => 'nullable|exists:destinataires,id',
                'courrier_parent_id' => 'nullable|exists:courriers,id',
                'objet' => 'sometimes|string|max:500',
                'contenu' => 'nullable|string',
                'date_courrier' => 'nullable|date',
                'date_reception' => 'nullable|date',
                'date_limite' => 'nullable|date',
                'date_cloture' => 'nullable|date',
                'confidentialite' => 'nullable|in:PUBLIC,INTERNE,CONFIDENTIEL,TRES_CONFIDENTIEL',
                // 'nombre_pieces' est géré automatiquement par CourrierPieceController
                'nombre_pages' => 'nullable|integer|min:0',
                'observation' => 'nullable|string',
            ]);

            if (array_key_exists('nombre_pages', $validated) && $validated['nombre_pages'] === null) {
                $validated['nombre_pages'] = 0;
            }

            $anciennesValeurs = $courrier->only(array_keys($validated));
            $validated['updated_by'] = auth()->id();

            $courrier->update($validated);

            $changements = $courrier->getChanges();
            unset($changements['updated_at'], $changements['updated_by']);

            AuditLogger::log(
                'courrier.updated',
                "Courrier {$courrier->numero} modifié par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                'courrier.modifie',
                'Modification',
                "Courrier {$courrier->numero} modifié par " . auth()->user()->name
                    . (! empty($changements) ? ' — Champs : ' . implode(', ', array_keys($changements)) : ''),
                $anciennesValeurs,
                $courrier->only(array_keys($changements))
            );

            return $this->success(
                $courrier->fresh([
                    'typeCourrier', 'categorie', 'priorite', 'statut',
                    'expediteur', 'destinataire',
                ]),
                'Courrier mis à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Courrier $courrier)
    {
        try {
            $numero = $courrier->numero;

            // NB : pas d'étape dans courrier_historiques ici, car la suppression
            // en cascade effacerait aussitôt l'entrée. La traçabilité est assurée
            // par audit_logs via AuditLogger.
            $courrier->delete();

            AuditLogger::log(
                'courrier.deleted',
                "Courrier {$numero} supprimé par " . auth()->user()->name
            );

            return $this->success(null, 'Courrier supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Courriers liés (parent + réponses)
    // =====================================================================

    /**
     * Voir les courriers liés à un courrier (parent + réponses).
     */
    public function lies(Courrier $courrier)
    {
        try {
            $parent = $courrier->parent;
            $reponses = $courrier->reponses()
                ->with(['typeCourrier', 'statut', 'createur'])
                ->get();

            return $this->success([
                'courrier' => [
                    'id' => $courrier->id,
                    'numero' => $courrier->numero,
                    'objet' => $courrier->objet,
                ],
                'parent' => $parent ? [
                    'id' => $parent->id,
                    'numero' => $parent->numero,
                    'objet' => $parent->objet,
                    'date_reception' => $parent->date_reception,
                ] : null,
                'reponses' => $reponses,
                'total_reponses' => $reponses->count(),
            ], 'Courriers liés');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    /**
     * Lier un courrier à un autre (réponse à un courrier parent).
     */
    public function lier(Request $request, Courrier $courrier)
    {
        try {
            $validated = $request->validate([
                'courrier_parent_id' => 'required|exists:courriers,id',
            ]);

            if ($validated['courrier_parent_id'] == $courrier->id) {
                return $this->error('Un courrier ne peut pas être lié à lui-même.', null, 422);
            }

            $courrier->update(['courrier_parent_id' => $validated['courrier_parent_id']]);

            AuditLogger::log(
                'courrier.lie',
                "Courrier {$courrier->numero} lié au courrier parent #{$validated['courrier_parent_id']}"
            );

            return $this->success(
                $courrier->fresh(['parent', 'reponses']),
                'Courrier lié avec succès'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la liaison', $e->getMessage(), 500);
        }
    }

    /**
     * Délier un courrier (supprimer le lien parent).
     */
    public function delier(Courrier $courrier)
    {
        try {
            $courrier->update(['courrier_parent_id' => null]);

            AuditLogger::log(
                'courrier.delie',
                "Courrier {$courrier->numero} délié de son parent"
            );

            return $this->success($courrier->fresh(), 'Courrier délié avec succès');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la déliaison', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Courriers en retard
    // =====================================================================

    /**
     * Courriers en retard (date_limite dépassée et non traités).
     */
    public function enRetard(Request $request)
    {
        try {
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())->with([
                'typeCourrier', 'priorite', 'statut',
                'expediteur', 'destinataire', 'createur',
            ])
                ->whereNotNull('date_limite')
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']));

            if ($request->filled('priorite_id')) {
                $query->where('priorite_id', $request->priorite_id);
            }

            if ($request->filled('type_courrier_id')) {
                $query->where('type_courrier_id', $request->type_courrier_id);
            }

            $courriers = $query->orderBy('date_limite')
                ->paginate($request->get('per_page', 15));

            $courriers->getCollection()->transform(function ($c) {
                $c->jours_retard = $c->date_limite ? now()->diffInDays($c->date_limite) : null;
                return $c;
            });

            return $this->success($courriers, 'Courriers en retard');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Recherche avancée
    // =====================================================================

    /**
     * Recherche avancée multi-critères.
     */
    public function rechercheAvancee(Request $request)
    {
        try {
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())->with([
                'typeCourrier', 'categorie', 'priorite', 'statut',
                'expediteur', 'destinataire', 'createur',
            ]);

            // Recherche textuelle
            if ($request->filled('q')) {
                $q = $request->q;
                $query->where(function ($sub) use ($q) {
                    $sub->where('numero', 'like', "%{$q}%")
                        ->orWhere('reference_externe', 'like', "%{$q}%")
                        ->orWhere('objet', 'like', "%{$q}%")
                        ->orWhere('contenu', 'like', "%{$q}%")
                        ->orWhere('observation', 'like', "%{$q}%");
                });
            }

            // Filtres principaux
            if ($request->filled('type_courrier_id')) {
                $query->where('type_courrier_id', $request->type_courrier_id);
            }
            if ($request->filled('categorie_id')) {
                $query->where('categorie_id', $request->categorie_id);
            }
            if ($request->filled('priorite_id')) {
                $query->where('priorite_id', $request->priorite_id);
            }
            if ($request->filled('statut_id')) {
                $query->where('statut_id', $request->statut_id);
            }
            if ($request->filled('expediteur_id')) {
                $query->where('expediteur_id', $request->expediteur_id);
            }
            if ($request->filled('destinataire_id')) {
                $query->where('destinataire_id', $request->destinataire_id);
            }
            if ($request->filled('created_by')) {
                $query->where('created_by', $request->created_by);
            }

            // Confidentialité multi-valeurs
            if ($request->filled('confidentialite')) {
                $values = explode(',', $request->confidentialite);
                $query->whereIn('confidentialite', $values);
            }

            // Période de réception
            if ($request->filled('date_debut')) {
                $query->whereDate('date_reception', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_reception', '<=', $request->date_fin);
            }

            // Période limite
            if ($request->filled('date_limite_debut')) {
                $query->whereDate('date_limite', '>=', $request->date_limite_debut);
            }
            if ($request->filled('date_limite_fin')) {
                $query->whereDate('date_limite', '<=', $request->date_limite_fin);
            }

            // Nombre de pièces
            if ($request->filled('min_pieces')) {
                $query->where('nombre_pieces', '>=', $request->min_pieces);
            }
            if ($request->filled('max_pieces')) {
                $query->where('nombre_pieces', '<=', $request->max_pieces);
            }

            // Courriers en retard
            if ($request->filled('en_retard') && $request->boolean('en_retard')) {
                $query->whereNotNull('date_limite')
                    ->where('date_limite', '<', now())
                    ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']));
            }

            // Avec pièces jointes
            if ($request->filled('avec_pieces') && $request->boolean('avec_pieces')) {
                $query->has('pieces');
            }

            // Avec réponses
            if ($request->filled('avec_reponses') && $request->boolean('avec_reponses')) {
                $query->has('reponses');
            }

            // Tri dynamique
            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $allowedSorts = [
                'numero', 'objet', 'date_reception', 'date_limite',
                'created_at', 'updated_at', 'priorite_id', 'statut_id',
            ];

            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
            } else {
                $query->orderByDesc('created_at');
            }

            return $this->success(
                $query->paginate($request->get('per_page', 15)),
                'Résultats de la recherche avancée'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la recherche', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Statistiques rapides
    // =====================================================================

    /**
     * Statistiques rapides sur les courriers.
     */
    public function stats(Request $request)
    {
        try {
            $user = $request->user();
            $base = Courrier::visiblePour($user)->visibleConfidentialite($user);

            $total = (clone $base)->count();
            $enRetard = (clone $base)->whereNotNull('date_limite')
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->count();

            return $this->success([
                'total' => $total,
                'en_retard' => $enRetard,
                'avec_parent' => (clone $base)->whereNotNull('courrier_parent_id')->count(),
                'avec_reponses' => (clone $base)->has('reponses')->count(),
                'avec_pieces' => (clone $base)->has('pieces')->count(),
                'aujourd_hui' => (clone $base)->whereDate('created_at', today())->count(),
                'cette_semaine' => (clone $base)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'ce_mois' => (clone $base)->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year)
                    ->count(),
            ], 'Statistiques des courriers');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }
}