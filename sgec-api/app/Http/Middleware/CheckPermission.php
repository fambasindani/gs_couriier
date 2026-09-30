<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Vérifie que l'utilisateur connecté possède la permission demandée.
     * L'administrateur a toujours accès.
     *
     * Usage : ->middleware('permission:users.create')
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié.',
            ], 401);
        }

        // 🔓 Administrateur : accès total automatique
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Vérification fine par permission
        if (! $user->hasPermission($permission)) {
            return response()->json([
                'success' => false,
                'message' => "Accès refusé. Permission requise : {$permission}",
            ], 403);
        }

        return $next($request);
    }
}