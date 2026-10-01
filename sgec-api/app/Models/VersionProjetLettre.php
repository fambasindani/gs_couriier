<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VersionProjetLettre extends Model
{
    use HasFactory;

    protected $table = 'versions_projets_lettres';

    protected $fillable = [
        'projet_lettre_id',
        'numero_version',
        'chemin_fichier',
        'nom_fichier_original',
        'commentaire',
        'utilisateur_id',
        'date_creation',
        'est_version_finale',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'est_version_finale' => 'boolean',
    ];

    public function projet(): BelongsTo
    {
        return $this->belongsTo(ProjetLettre::class, 'projet_lettre_id');
    }

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'utilisateur_id');
    }
}
