<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LettreModele extends Model
{
    use HasFactory;

    protected $table = 'lettre_modeles';

    protected $fillable = [
        'nom',
        'objet',
        'corps',
        'type_courrier_id',
        'actif',
        'created_by',
    ];

    protected $casts = [
        'actif' => 'boolean',
    ];

    public function typeCourrier(): BelongsTo
    {
        return $this->belongsTo(TypeCourrier::class, 'type_courrier_id');
    }

    public function createur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
