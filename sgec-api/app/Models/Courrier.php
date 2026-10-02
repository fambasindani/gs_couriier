<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;



class Courrier extends Model
{
    use HasFactory;

    protected $fillable = [
        'numero',
        'reference_externe',
        'type_courrier_id',
        'categorie_id',
        'priorite_id',
        'statut_id',
        'expediteur_id',
        'destinataire_id',
        'courrier_parent_id',
        'objet',
        'contenu',
        'date_courrier',
        'date_reception',
        'date_limite',
        'date_cloture',
        'confidentialite',
        'nombre_pieces',
        'nombre_pages',
        'observation',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_courrier' => 'date',
        'date_reception' => 'datetime',
        'date_limite' => 'datetime',
        'date_cloture' => 'datetime',
        'nombre_pieces' => 'integer',
        'nombre_pages' => 'integer',
    ];

    // =====================================================================
    // Relations
    // =====================================================================

    public function typeCourrier(): BelongsTo
    {
        return $this->belongsTo(TypeCourrier::class, 'type_courrier_id');
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieCourrier::class, 'categorie_id');
    }

    public function priorite(): BelongsTo
    {
        return $this->belongsTo(Priorite::class);
    }

    public function statut(): BelongsTo
    {
        return $this->belongsTo(StatutCourrier::class, 'statut_id');
    }

    public function expediteur(): BelongsTo
    {
        return $this->belongsTo(Expediteur::class);
    }

    public function destinataire(): BelongsTo
    {
        return $this->belongsTo(Destinataire::class);
    }

    /**
     * Courrier parent (si c'est une réponse).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Courrier::class, 'courrier_parent_id');
    }

    /**
     * Réponses liées à ce courrier.
     */
    public function reponses(): HasMany
    {
        return $this->hasMany(Courrier::class, 'courrier_parent_id');
    }

    /** Projets de lettres dont ce courrier est le courrier entrant d'origine. */
    public function projets(): HasMany
    {
        return $this->hasMany(ProjetLettre::class, 'courrier_entrant_id');
    }

    /** Projets dont ce courrier est le courrier sortant officiel. */
    public function projetsSortants(): HasMany
    {
        return $this->hasMany(ProjetLettre::class, 'courrier_sortant_id');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function modificateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // =====================================================================
    // Méthodes utilitaires
    // =====================================================================

    /**
     * Génère un numéro unique : COUR-2026-0001
     */
    /**
     * Génère le matricule du courrier selon son type.
     *  - Externe : EE-AAAA-0001 (entrant), ES-AAAA-0001 (sortant)
     *  - Interne : {PREFIX}-IE-AAAA-0001 / {PREFIX}-IS-AAAA-0001
     *              (préfixe = code de la direction émettrice)
     */
    public static function genererNumero(?string $typeCode = null, ?string $prefix = null): string
    {
        $annee = date('Y');

        $base = match ($typeCode) {
            'ENTRANT' => 'EE',
            'SORTANT' => 'ES',
            'INT_ENTRANT', 'INTERNE' => ($prefix ?: 'INT') . '-EE',
            'INT_SORTANT' => ($prefix ?: 'INT') . '-ES',
            default => 'COUR',
        };

        $pattern = "{$base}-{$annee}-";

        // lockForUpdate protège contre les numéros dupliqués en concurrence
        // (efficace lorsque la génération a lieu dans une transaction).
        $dernier = self::where('numero', 'like', "{$pattern}%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value('numero');

        $nouveauNum = 1;
        if ($dernier && preg_match('/(\d+)$/', $dernier, $matches)) {
            $nouveauNum = (int) $matches[1] + 1;
        }

        return $pattern . str_pad((string) $nouveauNum, 4, '0', STR_PAD_LEFT);
    }

    // =====================================================================
    // Machine à états des statuts
    // =====================================================================

    /**
     * Transitions autorisées d'un statut vers le suivant (par code).
     */
    public const TRANSITIONS = [
        'ENREGISTRE' => ['AFFECTE'],
        'AFFECTE' => ['EN_COURS', 'REJETE'],
        'EN_COURS' => ['TRAITE', 'VALIDE', 'REJETE'],
        'TRAITE' => ['CLOTURE', 'VALIDE'],
        'VALIDE' => ['CLOTURE', 'TRAITE'],
        'CLOTURE' => [],
        'REJETE' => [],
        'ANNULE' => [],
        'ARCHIVE' => [],
    ];

    /** @return array<int, string> */
    public static function transitionsAutorisees(?string $code): array
    {
        return self::TRANSITIONS[$code] ?? [];
    }

    public function transitionAutorisee(string $nouveauCode): bool
    {
        return in_array($nouveauCode, self::transitionsAutorisees($this->statut?->code), true);
    }

    // =====================================================================
    // Périmètre d'accès (directions / confidentialité)
    // =====================================================================

    /**
     * Restreint la requête aux courriers visibles par l'utilisateur :
     * créés par lui, ou affectés à lui / sa direction / son département / son service.
     * Un utilisateur avec `courriers.view.all` voit tout.
     */
    public function scopeVisiblePour(Builder $query, User $user): Builder
    {
        if ($user->hasPermission('courriers.view.all')) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($user) {
            $q->where('created_by', $user->id);

            $q->orWhereHas('affectations', function (Builder $a) use ($user) {
                $a->where('user_id', $user->id);

                if ($user->direction_id) {
                    $a->orWhere('direction_id', $user->direction_id);
                }
                if ($user->departement_id) {
                    $a->orWhere('departement_id', $user->departement_id);
                }
                if ($user->service_id) {
                    $a->orWhere('service_id', $user->service_id);
                }
            });
        });
    }

    /**
     * Filtre selon le niveau de confidentialité autorisé pour l'utilisateur.
     */
    public function scopeVisibleConfidentialite(Builder $query, User $user): Builder
    {
        if ($user->hasPermission('courriers.tres_confidentiel.view')) {
            return $query;
        }

        if ($user->hasPermission('courriers.confidentiel.view')) {
            return $query->whereIn('confidentialite', ['PUBLIC', 'INTERNE', 'CONFIDENTIEL']);
        }

        return $query->whereIn('confidentialite', ['PUBLIC', 'INTERNE']);
    }

    /**
     * Vérifie qu'un courrier précis est visible par l'utilisateur (confidentialité + périmètre).
     */
    public function estVisiblePar(User $user): bool
    {
        $niveau = $this->confidentialite;

        if ($niveau === 'TRES_CONFIDENTIEL' && ! $user->hasPermission('courriers.tres_confidentiel.view')) {
            return false;
        }

        if ($niveau === 'CONFIDENTIEL'
            && ! $user->hasPermission('courriers.confidentiel.view')
            && ! $user->hasPermission('courriers.tres_confidentiel.view')) {
            return false;
        }

        if ($user->hasPermission('courriers.view.all') || $this->created_by === $user->id) {
            return true;
        }

        return $this->affectations()->where(function (Builder $q) use ($user) {
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
        })->exists();
    }

        /**
     * Affectations liées à ce courrier.
     */
    public function affectations(): HasMany
    {
        return $this->hasMany(CourrierAffectation::class);
    }

    /**
     * Annotations liées à ce courrier.
     */
    public function annotations(): HasMany
    {
        return $this->hasMany(CourrierAnnotation::class);
    }

    /**
     * Validations liées à ce courrier.
     */
    public function validations(): HasMany
    {
        return $this->hasMany(CourrierValidation::class);
    }

        /**
     * Pièces jointes de ce courrier.
     */
    public function pieces(): HasMany
    {
        return $this->hasMany(CourrierPiece::class);
    }

        /**
     * Historique du courrier.
     */
    public function historiques(): HasMany
    {
        return $this->hasMany(CourrierHistorique::class)->orderByDesc('created_at');
    }
}