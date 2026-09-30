<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourrierAnnotation extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'user_id',
        'annotation',
        'date_limite',
        'etat',
    ];

    protected $casts = [
        'date_limite' => 'datetime',
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