<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourrierValidation extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'user_id',
        'decision',
        'commentaire',
        'date_validation',
    ];

    protected $casts = [
        'date_validation' => 'datetime',
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