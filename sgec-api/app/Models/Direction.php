<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Direction extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'libelle',
        'description',
    ];

    /**
     * Départements rattachés à cette direction.
     */
    public function departements(): HasMany
    {
        return $this->hasMany(Departement::class);
    }
}