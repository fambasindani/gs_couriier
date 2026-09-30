<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'departement_id',
        'code',
        'libelle',
        'description',
    ];

    /**
     * Département parent.
     */
    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }
}