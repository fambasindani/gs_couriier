<?php

namespace App\Models;

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
    public static function genererNumero(): string
    {
        $annee = date('Y');
        $prefix = "COUR-{$annee}-";

        // lockForUpdate protège contre les numéros dupliqués en concurrence
        // (efficace lorsque la génération a lieu dans une transaction).
        $dernier = self::where('numero', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value('numero');

        $nouveauNum = 1;
        if ($dernier && preg_match('/(\d+)$/', $dernier, $matches)) {
            $nouveauNum = (int) $matches[1] + 1;
        }

        return $prefix . str_pad((string) $nouveauNum, 4, '0', STR_PAD_LEFT);
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