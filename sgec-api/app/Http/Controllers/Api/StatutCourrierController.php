<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StatutCourrier;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class StatutCourrierController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = StatutCourrier::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('libelle', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des statuts de courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:statut_courriers,code',
                'libelle' => 'required|string|max:100',
                'description' => 'nullable|string',
            ]);

            $statut = StatutCourrier::create($validated);

            return $this->success($statut, 'Statut créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(StatutCourrier $statutCourrier)
    {
        try {
            return $this->success($statutCourrier, 'Détails du statut');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, StatutCourrier $statutCourrier)
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|string|max:50|unique:statut_courriers,code,' . $statutCourrier->id,
                'libelle' => 'sometimes|string|max:100',
                'description' => 'nullable|string',
            ]);

            $statutCourrier->update($validated);

            return $this->success($statutCourrier->fresh(), 'Statut mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(StatutCourrier $statutCourrier)
    {
        try {
            $statutCourrier->delete();
            return $this->success(null, 'Statut supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}