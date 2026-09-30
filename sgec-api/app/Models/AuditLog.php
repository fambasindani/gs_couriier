<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event',
        'url',
        'ip_address',
        'user_agent',
    ];

    /**
     * Utilisateur ayant déclenché l'événement.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}