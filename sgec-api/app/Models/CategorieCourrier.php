<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategorieCourrier extends Model
{
    use HasFactory;

    protected $table = 'categorie_courriers';

    protected $fillable = [
        'libelle',
    ];

    /**
     * Courriers de cette catégorie.
     */
    public function courriers(): HasMany
    {
        return $this->hasMany(Courrier::class, 'categorie_id');
    }
}