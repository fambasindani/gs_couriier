<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriqueProjetLettre extends Model
{
    use HasFactory;

    protected $table = 'historique_projets_lettres';

    protected $fillable = [
        'projet_lettre_id',
        'utilisateur_id',
        'action',
        'ancien_statut',
        'nouveau_statut',
        'commentaire',
        'date_action',
    ];

    protected $casts = [
        'date_action' => 'datetime',
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
