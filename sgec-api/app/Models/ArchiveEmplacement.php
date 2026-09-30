<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArchiveEmplacement extends Model
{
    use HasFactory;

    protected $fillable = ['intitule', 'salle', 'description'];

    public function archives(): HasMany
    {
        return $this->hasMany(Archive::class);
    }
}