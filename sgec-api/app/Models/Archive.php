<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Archive extends Model
{
    use HasFactory;

    protected $fillable = [
        'courrier_id',
        'archive_category_id',
        'archive_emplacement_id',
        'archive_par',
        'cote_archive',
        'titre_dossier',
        'producteur_service',
        'date_periode',
        'duree_conservation_ans',
        'date_versement',
        'date_fin_conservation',
        'statut_archive',
        'observation',
    ];

    protected $casts = [
        'date_versement' => 'date',
        'date_fin_conservation' => 'date',
        'duree_conservation_ans' => 'integer',
    ];

    public function courrier(): BelongsTo
    {
        return $this->belongsTo(Courrier::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArchiveCategory::class, 'archive_category_id');
    }

    public function emplacement(): BelongsTo
    {
        return $this->belongsTo(ArchiveEmplacement::class, 'archive_emplacement_id');
    }

    public function archivePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archive_par');
    }

    public static function genererCote(): string
    {
        $annee = date('Y');
        $prefix = "ARCH-{$annee}-";

        $dernier = self::where('cote_archive', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value('cote_archive');

        $nouveauNum = 1;
        if ($dernier && preg_match('/(\d+)$/', $dernier, $matches)) {
            $nouveauNum = (int) $matches[1] + 1;
        }

        return $prefix . str_pad((string) $nouveauNum, 4, '0', STR_PAD_LEFT);
    }

    public function getAnneesRestantesAttribute(): ?int
    {
        if (! $this->date_fin_conservation) {
            return null;
        }

        $restantes = now()->diffInYears($this->date_fin_conservation, false);
        return max(0, (int) $restantes);
    }
}