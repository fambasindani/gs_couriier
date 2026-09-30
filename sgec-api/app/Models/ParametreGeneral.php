<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParametreGeneral extends Model
{
    use HasFactory;

    protected $table = 'parametres_generaux';

    protected $fillable = [
        'cle',
        'valeur',
        'type',
        'groupe',
        'description',
    ];

    /**
     * Accessor : caste automatiquement la valeur selon le type.
     */
    public function getValeurAttribute($value)
    {
        return match ($this->type) {
            'int' => (int) $value,
            'bool' => (bool) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}