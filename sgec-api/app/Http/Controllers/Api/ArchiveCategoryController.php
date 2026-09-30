<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchiveCategory;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ArchiveCategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = ArchiveCategory::with('archives');

            if ($request->filled('search')) {
                $query->where('libelle', 'like', "%{$request->search}%");
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des catégories d\'archives'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'libelle' => 'required|string|max:150|unique:archive_categories,libelle',
                'description' => 'nullable|string',
            ]);

            $category = ArchiveCategory::create($validated);

            return $this->success($category, 'Catégorie créée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(ArchiveCategory $archiveCategory)
    {
        try {
            return $this->success($archiveCategory->load('archives'), 'Détails de la catégorie');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, ArchiveCategory $archiveCategory)
    {
        try {
            $validated = $request->validate([
                'libelle' => 'sometimes|string|max:150|unique:archive_categories,libelle,' . $archiveCategory->id,
                'description' => 'nullable|string',
            ]);

            $archiveCategory->update($validated);

            return $this->success($archiveCategory->fresh(), 'Catégorie mise à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(ArchiveCategory $archiveCategory)
    {
        try {
            $archiveCategory->delete();
            return $this->success(null, 'Catégorie supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}