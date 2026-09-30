<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourrierAffectation extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'direction_id',
        'departement_id',
        'service_id',
        'user_id',
        'affecte_par',
        'date_affectation',
        'date_limite',
        'date_prise_en_charge',
        'date_traitement',
        'statut',
    ];

    protected $casts = [
        'date_affectation' => 'datetime',
        'date_limite' => 'datetime',
        'date_prise_en_charge' => 'datetime',
        'date_traitement' => 'datetime',
    ];

    // =====================================================================
    // Relations
    // =====================================================================

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class);
    }

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function affectePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'affecte_par');
    }
}