<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class NotificationController extends Controller
{
    use ApiResponse;

    /**
     * Notifications de l'utilisateur connecté, limitées à son périmètre
     * (direction / département / service) et à sa confidentialité autorisée.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $notifications = collect();

            // 1) Courriers en retard dans le périmètre
            $enRetard = Courrier::visiblePour($user)->visibleConfidentialite($user)
                ->whereNotNull('date_limite')
                ->where('date_limite', '<', now())
                ->whereDoesntHave('statut', fn ($q) => $q->whereIn('code', ['TRAITE', 'VALIDE', 'CLOTURE', 'REJETE', 'ARCHIVE']))
                ->orderByDesc('date_limite')
                ->limit(5)
                ->get();

            foreach ($enRetard as $c) {
                $notifications->push([
                    'id' => 'retard-' . $c->id,
                    'type' => 'retard',
                    'title' => 'Dossier en retard',
                    'description' => "{$c->numero} — {$c->objet}",
                    'date' => optional($c->date_limite)->toIso8601String(),
                    'url' => "/courriers/{$c->id}",
                ]);
            }

            // 2) Affectations à traiter (statut AFFECTE) dans le périmètre
            $affectations = CourrierAffectation::with('courrier')
                ->where('statut', 'AFFECTE')
                ->whereHas('courrier', fn ($q) => $q->visiblePour($user)->visibleConfidentialite($user))
                ->when(! $user->hasPermission('courriers.view.all'), function ($q) use ($user) {
                    $q->where(function ($sub) use ($user) {
                        $sub->where('user_id', $user->id);

                        if ($user->direction_id) {
                            $sub->orWhere('direction_id', $user->direction_id);
                        }
                        if ($user->departement_id) {
                            $sub->orWhere('departement_id', $user->departement_id);
                        }
                        if ($user->service_id) {
                            $sub->orWhere('service_id', $user->service_id);
                        }
                    });
                })
                ->orderByDesc('date_affectation')
                ->limit(5)
                ->get();

            foreach ($affectations as $a) {
                $notifications->push([
                    'id' => 'affectation-' . $a->id,
                    'type' => 'affectation',
                    'title' => 'Affectation à traiter',
                    'description' => trim(($a->courrier?->numero ?? '') . ' — ' . ($a->courrier?->objet ?? '')),
                    'date' => optional($a->date_affectation)->toIso8601String(),
                    'url' => $a->courrier ? "/courriers/{$a->courrier->id}" : '/traitement/affectations',
                ]);
            }

            // 3) Derniers courriers du périmètre
            $recents = Courrier::visiblePour($user)->visibleConfidentialite($user)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();

            foreach ($recents as $c) {
                $notifications->push([
                    'id' => 'courrier-' . $c->id,
                    'type' => 'courrier',
                    'title' => 'Nouveau courrier',
                    'description' => "{$c->numero} — {$c->objet}",
                    'date' => optional($c->created_at)->toIso8601String(),
                    'url' => "/courriers/{$c->id}",
                ]);
            }

            $items = $notifications
                ->sortByDesc('date')
                ->take(10)
                ->map(function ($n) {
                    $n['date_humaine'] = $n['date'] ? Carbon::parse($n['date'])->diffForHumans() : '';
                    return $n;
                })
                ->values();

            return $this->success([
                'total' => $items->count(),
                'items' => $items,
            ], 'Notifications');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }
}
