<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StatutCourrier extends Model
{
    use HasFactory;

    protected $table = 'statut_courriers';

    protected $fillable = [
        'code',
        'libelle',
        'description',
    ];

    public function courriers(): HasMany
    {
        return $this->hasMany(Courrier::class, 'statut_id');
    }

    /**
     * Retourne l'ID d'un statut à partir de son code (ex: 'AFFECTE').
     * Évite les IDs codés en dur qui se cassent si le référentiel change.
     */
    public static function idParCode(string $code): int
    {
        $id = static::where('code', $code)->value('id');

        if (! $id) {
            throw new \RuntimeException("Statut de courrier introuvable pour le code : {$code}");
        }

        return (int) $id;
    }
}