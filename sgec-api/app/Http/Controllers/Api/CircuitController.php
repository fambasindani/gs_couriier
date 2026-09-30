<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courrier;
use App\Services\CircuitService;
use App\Traits\ApiResponse;

class CircuitController extends Controller
{
    use ApiResponse;

    /**
     * Circuit complet d'un courrier (toutes les étapes).
     */
    public function circuit(Courrier $courrier)
    {
        try {
            return $this->success(
                CircuitService::getCircuit($courrier),
                'Circuit du courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération du circuit', $e->getMessage(), 500);
        }
    }

    /**
     * Étape actuelle (dernière action en date).
     */
    public function etapeActuelle(Courrier $courrier)
    {
        try {
            return $this->success(
                CircuitService::getEtapeActuelle($courrier),
                'Étape actuelle du courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération de l\'étape', $e->getMessage(), 500);
        }
    }

    /**
     * Timeline simplifiée pour l'affichage UI (React).
     */
    public function timeline(Courrier $courrier)
    {
        try {
            $historiques = $courrier->historiques()
                ->with('user')
                ->orderBy('created_at')
                ->get()
                ->map(function ($h) {
                    return [
                        'titre' => $h->etape ?? $h->action,
                        'description' => $h->description,
                        'auteur' => $h->user?->name ?? 'Système',
                        'date' => $h->created_at->format('d/m/Y H:i'),
                        'timestamp' => $h->created_at,
                        'icone' => $this->getIcone($h->action),
                    ];
                });

            return $this->success(
                [
                    'courrier' => [
                        'id' => $courrier->id,
                        'numero' => $courrier->numero,
                    ],
                    'timeline' => $historiques,
                ],
                'Timeline du courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération de la timeline', $e->getMessage(), 500);
        }
    }

    /**
     * Retourne une icône FontAwesome selon l'action.
     */
    private function getIcone(string $action): string
    {
        return match (true) {
            str_contains($action, 'cree') => 'fa-plus-circle',
            str_contains($action, 'affecte') => 'fa-share-nodes',
            str_contains($action, 'annote') => 'fa-note-sticky',
            str_contains($action, 'valide') => 'fa-check-double',
            str_contains($action, 'rejete') => 'fa-times-circle',
            str_contains($action, 'cloture') => 'fa-lock',
            str_contains($action, 'piece') => 'fa-paperclip',
            default => 'fa-circle-info',
        };
    }
}