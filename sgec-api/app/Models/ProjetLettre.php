<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjetLettre extends Model
{
    use HasFactory;

    protected $table = 'projets_lettres';

    protected $fillable = [
        'reference_projet',
        'courrier_entrant_id',
        'dossier_id',
        'objet',
        'destinataire',
        'service_redacteur_id',
        'createur_id',
        'signataire_id',
        'statut',
        'date_creation',
        'date_soumission',
        'date_validation',
        'date_signature',
        'courrier_sortant_id',
        'date_expedition',
        'mode_expedition',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_soumission' => 'datetime',
        'date_validation' => 'datetime',
        'date_signature' => 'datetime',
        'date_expedition' => 'datetime',
    ];

    public const STATUTS = [
        'BROUILLON',
        'EN_REDACTION',
        'SOUMIS_A_VALIDATION',
        'A_CORRIGER',
        'VALIDE',
        'A_SIGNER',
        'SIGNE',
        'A_EXPEDIER',
        'EXPEDIE',
        'ARCHIVE',
        'ANNULE',
    ];

    public function courrierEntrant(): BelongsTo
    {
        return $this->belongsTo(Courrier::class, 'courrier_entrant_id');
    }

    public function courrierSortant(): BelongsTo
    {
        return $this->belongsTo(Courrier::class, 'courrier_sortant_id');
    }

    public function serviceRedacteur(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_redacteur_id');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'createur_id');
    }

    public function signataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signataire_id');
    }

    public function versions(): HasMany
    {
        return $this->hasMany(VersionProjetLettre::class)->orderByDesc('numero_version');
    }

    public function validations(): HasMany
    {
        return $this->hasMany(ValidationProjetLettre::class)->orderByDesc('created_at');
    }

    public function historique(): HasMany
    {
        return $this->hasMany(HistoriqueProjetLettre::class)->orderByDesc('created_at');
    }

    /** Prochaine version finale (dernière version). */
    public function derniereVersion(): ?VersionProjetLettre
    {
        return $this->versions()->orderByDesc('numero_version')->first();
    }

    public static function genererReference(): string
    {
        $annee = date('Y');
        $prefix = "PL-{$annee}-";
        $dernier = self::where('reference_projet', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('reference_projet');

        $num = 1;
        if ($dernier && preg_match('/(\d+)$/', $dernier, $m)) {
            $num = (int) $m[1] + 1;
        }

        return $prefix . str_pad((string) $num, 4, '0', STR_PAD_LEFT);
    }
}
