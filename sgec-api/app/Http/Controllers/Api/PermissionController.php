<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PermissionController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Permission::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('nom')->paginate($request->get('per_page', 15)),
                'Liste des permissions'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:100|unique:permissions,nom',
                'slug' => 'required|string|max:100|unique:permissions,slug',
                'description' => 'nullable|string',
            ]);

            $permission = Permission::create($validated);

            return $this->success($permission, 'Permission créée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Permission $permission)
    {
        try {
            return $this->success($permission->load('roles'), 'Détails de la permission');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Permission $permission)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:100|unique:permissions,nom,' . $permission->id,
                'slug' => 'sometimes|string|max:100|unique:permissions,slug,' . $permission->id,
                'description' => 'nullable|string',
            ]);

            $permission->update($validated);

            return $this->success($permission->fresh(), 'Permission mise à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Permission $permission)
    {
        try {
            $permission->delete();
            return $this->success(null, 'Permission supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}