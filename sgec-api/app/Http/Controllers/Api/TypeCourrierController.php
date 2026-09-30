<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypeCourrier;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TypeCourrierController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = TypeCourrier::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('libelle', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des types de courrier'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:type_courriers,code',
                'libelle' => 'required|string|max:100',
            ]);

            $type = TypeCourrier::create($validated);

            return $this->success($type, 'Type de courrier créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(TypeCourrier $typeCourrier)
    {
        try {
            return $this->success($typeCourrier, 'Détails du type de courrier');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, TypeCourrier $typeCourrier)
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|string|max:50|unique:type_courriers,code,' . $typeCourrier->id,
                'libelle' => 'sometimes|string|max:100',
            ]);

            $typeCourrier->update($validated);

            return $this->success($typeCourrier->fresh(), 'Type de courrier mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(TypeCourrier $typeCourrier)
    {
        try {
            $typeCourrier->delete();
            return $this->success(null, 'Type de courrier supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}