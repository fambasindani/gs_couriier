<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\LettreModele;
use App\Models\StatutCourrier;
use App\Models\TypeCourrier;
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
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())
                ->select(Courrier::LIST_SELECT)
                ->with([
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

            if ($request->filled('created_by')) {
                $query->where('created_by', $request->created_by);
            }

            if ($request->filled('date_debut')) {
                $query->whereDate('date_reception', '>=', $request->date_debut);
            }

            if ($request->filled('date_fin')) {
                $query->whereDate('date_reception', '<=', $request->date_fin);
            }

            $courriers = $query->orderByDesc('created_at')
                               ->paginate($request->get('per_page', 15));

            $this->appliquerPerspective($courriers, $request->user());

            return $this->success($courriers, 'Liste des courriers');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la rÃ©cupÃ©ration', $e->getMessage(), 500);
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
                // 'nombre_pieces' est gÃ©rÃ© automatiquement par CourrierPieceController
                'nombre_pages' => 'nullable|integer|min:0',
                'observation' => 'nullable|string',
            ]);

            return DB::transaction(function () use ($validated) {
                // Matricule selon le type + (interne) prÃ©fixe de la direction Ã©mettrice
                $typeCode = TypeCourrier::find($validated['type_courrier_id'])?->code;
                $prefix = in_array($typeCode, ['INT_ENTRANT', 'INT_SORTANT'], true)
                    ? (auth()->user()->direction?->code ?? 'INT')
                    : null;

                $validated['numero'] = Courrier::genererNumero($typeCode, $prefix);
                $validated['created_by'] = auth()->id();
                $validated['date_reception'] = $validated['date_reception'] ?? now();
                // Colonne NOT NULL : on Ã©vite d'insÃ©rer null
                $validated['nombre_pages'] = $validated['nombre_pages'] ?? 0;

                $courrier = Courrier::create($validated);

                AuditLogger::log(
                    'courrier.created',
                    "Courrier {$courrier->numero} crÃ©Ã© par " . auth()->user()->name
                );

                CircuitService::etape(
                    $courrier,
                    'courrier.cree',
                    'Enregistrement',
                    "Courrier {$courrier->numero} crÃ©Ã© par " . auth()->user()->name,
                    null,
                    ['numero' => $courrier->numero, 'objet' => $courrier->objet]
                );

                return $this->success(
                    $courrier->load([
                        'typeCourrier', 'categorie', 'priorite', 'statut',
                        'expediteur', 'destinataire', 'createur',
                    ]),
                    'Courrier enregistrÃ© avec succÃ¨s',
                    201
                );
            });
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la crÃ©ation', $e->getMessage(), 500);
        }
    }

    public function show(Courrier $courrier)
    {
        try {
            $user = auth()->user();

            if (! $courrier->estVisiblePar($user)) {
                return $this->error('AccÃ¨s refusÃ© Ã  ce courrier.', null, 403);
            }

            $courrier->peut_supprimer = $user->hasPermission('courriers.delete')
                || ($courrier->estSupprimable() && $courrier->affecteAUneUniteDe($user));

            $courrier->sens_pour_moi = $courrier->sensPourUtilisateur($user);

            return $this->success(
                $courrier->load([
                    'typeCourrier', 'categorie', 'priorite', 'statut',
                    'expediteur', 'destinataire', 'createur', 'modificateur',
                    'parent', 'reponses', 'pieces',
                    'affectations.direction', 'affectations.departement',
                    'affectations.service', 'affectations.user', 'affectations.affectePar',
                    'annotations.user',
                    'validations.user',
                    'historiques',
                    'projets',
                    'projetsSortants',
                ]),
                'DÃ©tails du courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar($request->user())) {
                return $this->error('AccÃ¨s refusÃ© Ã  ce courrier.', null, 403);
            }

            if ($courrier->statut?->code === 'ARCHIVE') {
                return $this->error('Un courrier archivÃ© ne peut plus Ãªtre modifiÃ©.', null, 409);
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
                // 'nombre_pieces' est gÃ©rÃ© automatiquement par CourrierPieceController
                'nombre_pages' => 'nullable|integer|min:0',
                'observation' => 'nullable|string',
            ]);

            if (array_key_exists('nombre_pages', $validated) && $validated['nombre_pages'] === null) {
                $validated['nombre_pages'] = 0;
            }

            // Machine Ã  Ã©tats : on n'autorise que les transitions dÃ©finies
            if (array_key_exists('statut_id', $validated)) {
                $nouveauStatut = StatutCourrier::find($validated['statut_id']);
                if ($nouveauStatut
                    && $nouveauStatut->code !== $courrier->statut?->code
                    && ! $courrier->transitionAutorisee($nouveauStatut->code)) {
                    return $this->error(
                        "Transition de statut non autorisÃ©e : {$courrier->statut?->code} â†’ {$nouveauStatut->code}.",
                        null,
                        422
                    );
                }
            }

            $anciennesValeurs = $courrier->only(array_keys($validated));
            $validated['updated_by'] = auth()->id();

            $courrier->update($validated);

            $changements = $courrier->getChanges();
            unset($changements['updated_at'], $changements['updated_by']);

            AuditLogger::log(
                'courrier.updated',
                "Courrier {$courrier->numero} modifiÃ© par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                'courrier.modifie',
                'Modification',
                "Courrier {$courrier->numero} modifiÃ© par " . auth()->user()->name
                    . (! empty($changements) ? ' â€” Champs : ' . implode(', ', array_keys($changements)) : ''),
                $anciennesValeurs,
                $courrier->only(array_keys($changements))
            );

            return $this->success(
                $courrier->fresh([
                    'typeCourrier', 'categorie', 'priorite', 'statut',
                    'expediteur', 'destinataire',
                ]),
                'Courrier mis Ã  jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise Ã  jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Request $request, Courrier $courrier)
    {
        try {
            $user = $request->user();

            // Règle : l'émetteur ne peut pas supprimer un courrier déjà validé/clôturé/archivé.
            // Un utilisateur de la direction destinataire peut supprimer un courrier non encore validé
            // qui lui est affecté ; la permission courriers.delete reste prioritaire.
            $peutSupprimer = $user->hasPermission('courriers.delete')
                || ($courrier->estSupprimable() && $courrier->affecteAUneUniteDe($user));

            if (! $peutSupprimer) {
                return $this->error(
                    'Vous ne pouvez pas supprimer ce courrier : soit il est déjà validé, soit il n\'est pas affecté à votre service.',
                    null,
                    403
                );
            }

            $numero = $courrier->numero;

            // NB : pas d'Ã©tape dans courrier_historiques ici, car la suppression
            // en cascade effacerait aussitÃ´t l'entrÃ©e. La traÃ§abilitÃ© est assurÃ©e
            // par audit_logs via AuditLogger.
            $courrier->delete();

            AuditLogger::log(
                'courrier.deleted',
                "Courrier {$numero} supprimÃ© par " . auth()->user()->name
            );

            return $this->success(null, 'Courrier supprimÃ©');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }

    /**
     * Annule un courrier (permission dÃ©diÃ©e courriers.annuler).
     */
    public function annuler(Request $request, Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar($request->user())) {
                return $this->error('AccÃ¨s refusÃ© Ã  ce courrier.', null, 403);
            }

            if (in_array($courrier->statut?->code, ['ARCHIVE', 'ANNULE'], true)) {
                return $this->error('Ce courrier est dÃ©jÃ  annulÃ© ou archivÃ©.', null, 409);
            }

            $courrier->update(['statut_id' => StatutCourrier::idParCode('ANNULE')]);

            AuditLogger::log('courrier.annule', "Courrier {$courrier->numero} annulÃ© par " . auth()->user()->name);

            CircuitService::etape(
                $courrier,
                'courrier.annule',
                'Annulation',
                "Courrier {$courrier->numero} annulÃ© par " . auth()->user()->name
            );

            return $this->success($courrier->fresh(['typeCourrier', 'categorie', 'priorite', 'statut']), 'Courrier annulÃ©');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de lâ€™annulation', $e->getMessage(), 500);
        }
    }

    /**
     * ClÃ´ture un courrier (statut CLOTURE + date de clÃ´ture).
     */
    public function cloturer(Request $request, Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar($request->user())) {
                return $this->error('AccÃ¨s refusÃ© Ã  ce courrier.', null, 403);
            }

            if (in_array($courrier->statut?->code, ['CLOTURE', 'ARCHIVE'], true)) {
                return $this->error('Ce courrier est dÃ©jÃ  clÃ´turÃ© ou archivÃ©.', null, 409);
            }

            if (! $courrier->transitionAutorisee('CLOTURE')) {
                return $this->error(
                    "Impossible de clÃ´turer un courrier au statut {$courrier->statut?->code} (le courrier doit Ãªtre traitÃ© ou validÃ©).",
                    null,
                    422
                );
            }

            $courrier->update([
                'statut_id' => StatutCourrier::idParCode('CLOTURE'),
                'date_cloture' => now(),
            ]);

            AuditLogger::log(
                'courrier.cloture',
                "Courrier {$courrier->numero} clÃ´turÃ© par " . auth()->user()->name
            );

            CircuitService::etape(
                $courrier,
                'courrier.cloture',
                'ClÃ´ture',
                "Courrier {$courrier->numero} clÃ´turÃ© par " . auth()->user()->name
            );

            return $this->success(
                $courrier->fresh(['typeCourrier', 'categorie', 'priorite', 'statut']),
                'Courrier clÃ´turÃ©'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la clÃ´ture', $e->getMessage(), 500);
        }
    }

    /**
     * GÃ©nÃ¨re un projet de lettre Ã  partir d'un modÃ¨le, en fusionnant les
     * variables {{...}} avec les donnÃ©es du courrier.
     */
    public function genererLettre(Request $request, Courrier $courrier)
    {
        try {
            if (! $courrier->estVisiblePar($request->user())) {
                return $this->error('AccÃ¨s refusÃ© Ã  ce courrier.', null, 403);
            }

            $validated = $request->validate([
                'lettre_modele_id' => 'required|exists:lettre_modeles,id',
            ]);

            $modele = LettreModele::findOrFail($validated['lettre_modele_id']);
            $donnees = $this->fusionnerLettre($courrier, $modele);

            return $this->success([
                'modele' => ['id' => $modele->id, 'nom' => $modele->nom],
                'objet' => $donnees['objet'],
                'corps' => $donnees['corps'],
                'courrier' => ['id' => $courrier->id, 'numero' => $courrier->numero],
            ], 'Lettre gÃ©nÃ©rÃ©e');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la gÃ©nÃ©ration', $e->getMessage(), 500);
        }
    }

    /**
     * Construit l'objet et le corps de la lettre en fusionnant les variables {{...}}.
     *
     * @return array{objet: string|null, corps: string}
     */
    private function fusionnerLettre(Courrier $courrier, LettreModele $modele): array
    {
        $courrier->load(['typeCourrier', 'categorie', 'priorite', 'statut', 'expediteur', 'destinataire']);

        $variables = [
            'numero' => $courrier->numero,
            'objet' => $courrier->objet,
            'reference_externe' => $courrier->reference_externe ?? '',
            'date_courrier' => optional($courrier->date_courrier)->format('d/m/Y') ?? '',
            'date_reception' => optional($courrier->date_reception)->format('d/m/Y H:i') ?? '',
            'date_limite' => optional($courrier->date_limite)->format('d/m/Y H:i') ?? '',
            'type' => $courrier->typeCourrier?->libelle ?? '',
            'categorie' => $courrier->categorie?->libelle ?? '',
            'priorite' => $courrier->priorite?->libelle ?? '',
            'statut' => $courrier->statut?->libelle ?? '',
            'confidentialite' => $courrier->confidentialite,
            'expediteur' => $courrier->expediteur?->nom ?? '',
            'destinataire' => $courrier->destinataire?->nom ?? '',
            'date_du_jour' => now()->format('d/m/Y'),
        ];

        $fusionner = function (?string $texte) use ($variables) {
            return preg_replace_callback(
                '/\{\{\s*([a-z_]+)\s*\}\}/i',
                fn ($m) => $variables[strtolower($m[1])] ?? $m[0],
                (string) $texte
            );
        };

        return [
            'objet' => $modele->objet ? $fusionner($modele->objet) : null,
            'corps' => $fusionner($modele->corps),
        ];
    }

    // =====================================================================
    // Courriers liÃ©s (parent + rÃ©ponses)
    // =====================================================================

    /**
     * Voir les courriers liÃ©s Ã  un courrier (parent + rÃ©ponses).
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
            ], 'Courriers liÃ©s');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la rÃ©cupÃ©ration', $e->getMessage(), 500);
        }
    }

    /**
     * Lier un courrier Ã  un autre (rÃ©ponse Ã  un courrier parent).
     */
    public function lier(Request $request, Courrier $courrier)
    {
        try {
            $validated = $request->validate([
                'courrier_parent_id' => 'required|exists:courriers,id',
            ]);

            if ($validated['courrier_parent_id'] == $courrier->id) {
                return $this->error('Un courrier ne peut pas Ãªtre liÃ© Ã  lui-mÃªme.', null, 422);
            }

            $courrier->update(['courrier_parent_id' => $validated['courrier_parent_id']]);

            AuditLogger::log(
                'courrier.lie',
                "Courrier {$courrier->numero} liÃ© au courrier parent #{$validated['courrier_parent_id']}"
            );

            CircuitService::etape(
                $courrier,
                'courrier.lie',
                'Liaison',
                "Courrier {$courrier->numero} liÃ© au courrier parent #{$validated['courrier_parent_id']}"
            );

            return $this->success(
                $courrier->fresh(['parent', 'reponses']),
                'Courrier liÃ© avec succÃ¨s'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la liaison', $e->getMessage(), 500);
        }
    }

    /**
     * DÃ©lier un courrier (supprimer le lien parent).
     */
    public function delier(Courrier $courrier)
    {
        try {
            $courrier->update(['courrier_parent_id' => null]);

            AuditLogger::log(
                'courrier.delie',
                "Courrier {$courrier->numero} dÃ©liÃ© de son parent"
            );

            CircuitService::etape(
                $courrier,
                'courrier.delie',
                'Liaison',
                "Courrier {$courrier->numero} dÃ©liÃ© de son parent"
            );

            return $this->success($courrier->fresh(), 'Courrier dÃ©liÃ© avec succÃ¨s');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la dÃ©liaison', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Courriers en retard
    // =====================================================================

    /**
     * Courriers en retard (date_limite dÃ©passÃ©e et non traitÃ©s).
     */
    public function enRetard(Request $request)
    {
        try {
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())
                ->select(Courrier::LIST_SELECT)
                ->with([
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

            $this->appliquerPerspective($courriers, $request->user());

            return $this->success($courriers, 'Courriers en retard');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la rÃ©cupÃ©ration', $e->getMessage(), 500);
        }
    }

    // =====================================================================
    // Recherche avancÃ©e
    // =====================================================================

    /**
     * Recherche avancÃ©e multi-critÃ¨res.
     */
    public function rechercheAvancee(Request $request)
    {
        try {
            $query = Courrier::visiblePour($request->user())->visibleConfidentialite($request->user())
                ->select(Courrier::LIST_SELECT)
                ->with([
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

            // ConfidentialitÃ© multi-valeurs
            if ($request->filled('confidentialite')) {
                $values = explode(',', $request->confidentialite);
                $query->whereIn('confidentialite', $values);
            }

            // PÃ©riode de rÃ©ception
            if ($request->filled('date_debut')) {
                $query->whereDate('date_reception', '>=', $request->date_debut);
            }
            if ($request->filled('date_fin')) {
                $query->whereDate('date_reception', '<=', $request->date_fin);
            }

            // PÃ©riode limite
            if ($request->filled('date_limite_debut')) {
                $query->whereDate('date_limite', '>=', $request->date_limite_debut);
            }
            if ($request->filled('date_limite_fin')) {
                $query->whereDate('date_limite', '<=', $request->date_limite_fin);
            }

            // Nombre de piÃ¨ces
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

            // Avec piÃ¨ces jointes
            if ($request->filled('avec_pieces') && $request->boolean('avec_pieces')) {
                $query->has('pieces');
            }

            // Avec rÃ©ponses
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

            $courriers = $query->paginate($request->get('per_page', 15));

            $this->appliquerPerspective($courriers, $request->user());

            return $this->success(
                $courriers,
                'RÃ©sultats de la recherche avancÃ©e'
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
            return $this->error('Erreur lors de la rÃ©cupÃ©ration', $e->getMessage(), 500);
        }
    }

    /**
     * Pose sur chaque courrier d'une liste paginée :
     * - `peut_supprimer` : permission courriers.delete OU (affecté à l'unité de l'utilisateur ET non encore validé) ;
     * - `sens_pour_moi` : sens relatif 'ENTRANT'/'SORTANT' des courriers internes selon le point de vue.
     */
    protected function appliquerPerspective($paginator, $user): void
    {
        $items = collect($paginator->items());
        $ids = $items->pluck('id')->filter();

        $peutToutSupprimer = $user->hasPermission('courriers.delete');
        $cibles = collect();
        $emmets = collect();

        if ($ids->isNotEmpty()) {
            $affBase = CourrierAffectation::whereIn('courrier_id', $ids);

            if (! $peutToutSupprimer) {
                $cibles = (clone $affBase)
                    ->where(function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                        if ($user->direction_id) {
                            $q->orWhere('direction_id', $user->direction_id);
                        }
                        if ($user->departement_id) {
                            $q->orWhere('departement_id', $user->departement_id);
                        }
                        if ($user->service_id) {
                            $q->orWhere('service_id', $user->service_id);
                        }
                    })
                    ->distinct()
                    ->pluck('courrier_id')
                    ->flip();
            }

            $emmets = (clone $affBase)
                ->where('affecte_par', $user->id)
                ->distinct()
                ->pluck('courrier_id')
                ->flip();
        }

        foreach ($items as $courrier) {
            $recepteur = $cibles->has($courrier->id);
            $emetteur = (int) $courrier->created_by === (int) $user->id
                || $emmets->has($courrier->id);

            $courrier->peut_supprimer = $peutToutSupprimer
                || ($courrier->estSupprimable() && $recepteur);

            $code = $courrier->typeCourrier?->code;
            $sens = null;
            if (in_array($code, ['INT_ENTRANT', 'INT_SORTANT'], true)) {
                if ($recepteur && ! $emetteur) {
                    $sens = 'ENTRANT';
                } elseif ($emetteur) {
                    $sens = 'SORTANT';
                }
            }
            $courrier->sens_pour_moi = $sens;
        }
    }
}