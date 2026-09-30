<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeCourrier extends Model
{
    use HasFactory;

    protected $table = 'type_courriers';

    protected $fillable = [
        'code',
        'libelle',
    ];

    /**
     * Courriers de ce type.
     */
    public function courriers(): HasMany
    {
        return $this->hasMany(Courrier::class, 'type_courrier_id');
    }
}