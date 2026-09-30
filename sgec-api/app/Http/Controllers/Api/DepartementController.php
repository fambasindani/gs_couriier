<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DepartementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Departement::with('direction', 'services');

            if ($request->filled('direction_id')) {
                $query->where('direction_id', $request->direction_id);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('libelle', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des départements'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'direction_id' => 'required|exists:directions,id',
                'code' => 'required|string|max:50',
                'libelle' => 'required|string|max:150',
                'description' => 'nullable|string',
            ]);

            $departement = Departement::create($validated);

            return $this->success($departement->load('direction'), 'Département créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Departement $departement)
    {
        try {
            return $this->success($departement->load('direction', 'services'), 'Détails du département');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Departement $departement)
    {
        try {
            $validated = $request->validate([
                'direction_id' => 'sometimes|exists:directions,id',
                'code' => 'sometimes|string|max:50',
                'libelle' => 'sometimes|string|max:150',
                'description' => 'nullable|string',
            ]);

            $departement->update($validated);

            return $this->success($departement->fresh('direction'), 'Département mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Departement $departement)
    {
        try {
            $departement->delete();
            return $this->success(null, 'Département supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}