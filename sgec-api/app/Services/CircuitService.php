<?php

namespace App\Services;

use App\Models\Courrier;
use App\Models\CourrierHistorique;

class CircuitService
{
    /**
     * Enregistre une étape du circuit de traitement.
     */
    public static function etape(
        Courrier $courrier,
        string $action,
        ?string $etape = null,
        ?string $description = null,
        ?array $ancienneValeur = null,
        ?array $nouvelleValeur = null
    ): CourrierHistorique {
        return CourrierHistorique::create([
            'courrier_id' => $courrier->id,
            'user_id' => auth()->id(),
            'action' => $action,
            'etape' => $etape,
            'description' => $description,
            'ancienne_valeur' => $ancienneValeur,
            'nouvelle_valeur' => $nouvelleValeur,
            'adresse_ip' => request()->ip(),
        ]);
    }

    /**
     * Reconstruit le circuit complet d'un courrier.
     */
    public static function getCircuit(Courrier $courrier): array
    {
        $historiques = $courrier->historiques()
            ->with('user.direction')
            ->orderBy('created_at')
            ->get();

        return [
            'courrier' => [
                'id' => $courrier->id,
                'numero' => $courrier->numero,
                'objet' => $courrier->objet,
                'statut_actuel' => $courrier->statut?->libelle,
                'date_reception' => $courrier->date_reception,
            ],
            'etapes' => $historiques->map(function ($h) {
                return [
                    'id' => $h->id,
                    'action' => $h->action,
                    'etape' => $h->etape,
                    'description' => $h->description,
                    'user' => $h->user ? [
                        'id' => $h->user->id,
                        'name' => $h->user->name,
                    ] : null,
                    'direction' => $h->user?->direction?->libelle,
                    'date' => $h->created_at,
                    'adresse_ip' => $h->adresse_ip,
                ];
            })->toArray(),
            'total_etapes' => $historiques->count(),
        ];
    }

    /**
     * Retourne l'étape actuelle (dernière action).
     */
    public static function getEtapeActuelle(Courrier $courrier): ?array
    {
        $dernier = $courrier->historiques()
            ->with('user.direction')
            ->orderByDesc('created_at')
            ->first();

        if (! $dernier) {
            return null;
        }

        return [
            'action' => $dernier->action,
            'etape' => $dernier->etape,
            'description' => $dernier->description,
            'user' => $dernier->user?->name,
            'direction' => $dernier->user?->direction?->libelle,
            'date' => $dernier->created_at,
        ];
    }
}