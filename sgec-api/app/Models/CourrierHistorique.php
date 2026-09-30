<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourrierHistorique extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'user_id',
        'action',
        'etape',
        'description',
        'ancienne_valeur',
        'nouvelle_valeur',
        'adresse_ip',
    ];

    protected $casts = [
        'ancienne_valeur' => 'array',
        'nouvelle_valeur' => 'array',
    ];

    // =====================================================================
    // Relations
    // =====================================================================

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}