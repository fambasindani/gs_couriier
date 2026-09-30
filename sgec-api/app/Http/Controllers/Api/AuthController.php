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
     * Mise à jour de son propre profil (nom, email).
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'name' => 'sometimes|string|max:150',
                'email' => 'sometimes|email|max:150|unique:users,email,' . $user->id,
            ]);

            $user->update($validated);

            return $this->success($user->load('roles.permissions'), 'Profil mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    /**
     * Modification de son propre mot de passe.
     */
    public function updatePassword(Request $request)
    {
        try {
            $user = $request->user();

            $validated = $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if (! Hash::check($validated['current_password'], $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Le mot de passe actuel est incorrect.'],
                ]);
            }

            // Le cast 'hashed' du modèle User hache automatiquement la valeur.
            $user->update(['password' => $validated['password']]);

            return $this->success(null, 'Mot de passe modifié avec succès');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la modification', $e->getMessage(), 500);
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