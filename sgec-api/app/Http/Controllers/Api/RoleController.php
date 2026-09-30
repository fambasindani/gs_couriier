<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoleController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Role::with('permissions');

            if ($request->filled('search')) {
                $query->where('nom', 'like', "%{$request->search}%");
            }

            return $this->success(
                $query->orderBy('nom')->paginate($request->get('per_page', 15)),
                'Liste des rôles'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:100|unique:roles,nom',
                'description' => 'nullable|string',
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            $role = Role::create([
                'nom' => $validated['nom'],
                'description' => $validated['description'] ?? null,
            ]);

            if (! empty($validated['permissions'])) {
                $role->permissions()->sync($validated['permissions']);
            }

            return $this->success($role->load('permissions'), 'Rôle créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Role $role)
    {
        try {
            return $this->success($role->load('permissions', 'users'), 'Détails du rôle');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Role $role)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:100|unique:roles,nom,' . $role->id,
                'description' => 'nullable|string',
                'permissions' => 'array',
                'permissions.*' => 'exists:permissions,id',
            ]);

            $role->update([
                'nom' => $validated['nom'] ?? $role->nom,
                'description' => $validated['description'] ?? $role->description,
            ]);

            if ($request->has('permissions')) {
                $role->permissions()->sync($validated['permissions'] ?? []);
            }

            return $this->success($role->fresh('permissions'), 'Rôle mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Role $role)
    {
        try {
            if ($role->users()->exists()) {
                return $this->error('Ce rôle est attribué à des utilisateurs. Retirez-le d\'abord.', null, 409);
            }

            $role->delete();
            return $this->success(null, 'Rôle supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}