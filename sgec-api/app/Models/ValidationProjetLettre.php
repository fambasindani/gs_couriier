<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ValidationProjetLettre extends Model
{
    use HasFactory;

    protected $table = 'validations_projets_lettres';

    protected $fillable = [
        'projet_lettre_id',
        'version_projet_id',
        'valideur_id',
        'decision',
        'observation',
        'date_decision',
        'niveau_validation',
    ];

    protected $casts = [
        'date_decision' => 'datetime',
    ];

    public function projet(): BelongsTo
    {
        return $this->belongsTo(ProjetLettre::class, 'projet_lettre_id');
    }

    public function version(): BelongsTo
    {
        return $this->belongsTo(VersionProjetLettre::class, 'version_projet_id');
    }

    public function valideur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valideur_id');
    }
}
