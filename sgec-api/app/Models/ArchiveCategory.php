<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArchiveCategory extends Model
{
    use HasFactory;

    protected $fillable = ['libelle', 'description'];

    public function archives(): HasMany
    {
        return $this->hasMany(Archive::class);
    }
}