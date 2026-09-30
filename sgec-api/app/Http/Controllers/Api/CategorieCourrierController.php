<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CategorieCourrier;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CategorieCourrierController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = CategorieCourrier::query();

            if ($request->filled('search')) {
                $query->where('libelle', 'like', "%{$request->search}%");
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des catégories'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'libelle' => 'required|string|max:100|unique:categorie_courriers,libelle',
            ]);

            $categorie = CategorieCourrier::create($validated);

            return $this->success($categorie, 'Catégorie créée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(CategorieCourrier $categorieCourrier)
    {
        try {
            return $this->success($categorieCourrier, 'Détails de la catégorie');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, CategorieCourrier $categorieCourrier)
    {
        try {
            $validated = $request->validate([
                'libelle' => 'sometimes|string|max:100|unique:categorie_courriers,libelle,' . $categorieCourrier->id,
            ]);

            $categorieCourrier->update($validated);

            return $this->success($categorieCourrier->fresh(), 'Catégorie mise à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(CategorieCourrier $categorieCourrier)
    {
        try {
            $categorieCourrier->delete();
            return $this->success(null, 'Catégorie supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}