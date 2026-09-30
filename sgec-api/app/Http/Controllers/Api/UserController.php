<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = User::with('roles');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('actif')) {
                $query->where('actif', $request->boolean('actif'));
            }

            if ($request->filled('role_id')) {
                $query->whereHas('roles', fn ($q) => $q->where('roles.id', $request->role_id));
            }

            $users = $query->orderBy('name')->paginate($request->get('per_page', 15));

            return $this->success($users, 'Liste des utilisateurs');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:150',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'actif' => 'boolean',
                'roles' => 'array',
                'roles.*' => 'exists:roles,id',
            ]);

            $validated['password'] = Hash::make($validated['password']);

            $user = User::create($validated);

            if (! empty($validated['roles'])) {
                $user->roles()->sync($validated['roles']);
            }

            return $this->success($user->load('roles'), 'Utilisateur créé avec succès', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(User $user)
    {
        try {
            return $this->success($user->load('roles.permissions'), 'Détails utilisateur');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:150',
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'password' => 'sometimes|string|min:8',
                'actif' => 'boolean',
                'roles' => 'array',
                'roles.*' => 'exists:roles,id',
            ]);

            if (isset($validated['password'])) {
                $validated['password'] = Hash::make($validated['password']);
            }

            $user->update($validated);

            if ($request->has('roles')) {
                $user->roles()->sync($validated['roles'] ?? []);
            }

            return $this->success($user->fresh('roles'), 'Utilisateur mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(User $user)
    {
        try {
            if ($user->id === auth()->id()) {
                return $this->error('Vous ne pouvez pas supprimer votre propre compte.', null, 403);
            }

            $user->delete();
            return $this->success(null, 'Utilisateur supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}