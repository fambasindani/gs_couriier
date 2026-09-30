<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destinataire extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'type_destinataire',
        'adresse',
        'telephone',
        'email',
    ];

    public function courriers(): HasMany
    {
        return $this->hasMany(Courrier::class);
    }
}