<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Departement extends Model
{
    use HasFactory;

    protected $fillable = [
        'direction_id',
        'code',
        'libelle',
        'description',
    ];

    /**
     * Direction parente.
     */
    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class);
    }

    /**
     * Services rattachés à ce département.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}