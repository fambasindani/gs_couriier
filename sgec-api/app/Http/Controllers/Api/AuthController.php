<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Connexion utilisateur.
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();

            if (! $user || ! Hash::check($request->password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => ['Identifiants incorrects.'],
                ]);
            }

            if (! $user->actif) {
                return $this->error('Compte désactivé. Contactez l\'administrateur.', null, 403);
            }

            $token = $user->createToken('sgec-token')->plainTextToken;

            return $this->success([
                'user' => $user->load('roles.permissions'),
                'token' => $token,
            ], 'Connexion réussie');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    /**
     * Informations de l'utilisateur connecté.
     */
    public function me(Request $request)
    {
        try {
            return $this->success(
                $request->user()->load('roles.permissions'),
                'Utilisateur connecté'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    /**
     * Déconnexion.
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return $this->success(null, 'Déconnexion réussie');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }
}