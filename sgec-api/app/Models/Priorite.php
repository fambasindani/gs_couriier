<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Priorite extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'libelle',
        'niveau',
    ];

    protected $casts = [
        'niveau' => 'integer',
    ];

    /**
     * Courriers ayant cette priorité.
     */
    public function courriers(): HasMany
    {
        return $this->hasMany(Courrier::class, 'priorite_id');
    }
}