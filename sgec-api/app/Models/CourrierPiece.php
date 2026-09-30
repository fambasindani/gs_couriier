<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourrierPiece extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'nom_original',
        'nom_fichier',
        'chemin',
        'extension',
        'mime_type',
        'taille',
        'texte_ocr',
        'date_ocr',
        'est_principal',
        'uploaded_by',
    ];

    protected $casts = [
        'est_principal' => 'boolean',
        'taille' => 'integer',
        'date_ocr' => 'datetime',
    ];

    // =====================================================================
    // Relations
    // =====================================================================

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function uploadePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // =====================================================================
    // Helpers
    // =====================================================================

    /**
     * URL publique du fichier.
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->chemin);
    }

    /**
     * Taille lisible (ex: 1.5 MB).
     */
    public function getTailleLisibleAttribute(): string
    {
        $bytes = $this->taille ?? 0;

        if ($bytes < 1024) return $bytes . ' B';
        if ($bytes < 1048576) return round($bytes / 1024, 2) . ' KB';
        if ($bytes < 1073741824) return round($bytes / 1048576, 2) . ' MB';

        return round($bytes / 1073741824, 2) . ' GB';
    }
}