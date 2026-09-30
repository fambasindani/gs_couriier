<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Direction;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DirectionController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Direction::with('departements.services');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('libelle', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('libelle')->paginate($request->get('per_page', 15)),
                'Liste des directions'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:directions,code',
                'libelle' => 'required|string|max:150',
                'description' => 'nullable|string',
            ]);

            $direction = Direction::create($validated);

            return $this->success($direction, 'Direction créée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Direction $direction)
    {
        try {
            return $this->success($direction->load('departements.services'), 'Détails de la direction');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Direction $direction)
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|string|max:50|unique:directions,code,' . $direction->id,
                'libelle' => 'sometimes|string|max:150',
                'description' => 'nullable|string',
            ]);

            $direction->update($validated);

            return $this->success($direction->fresh(), 'Direction mise à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Direction $direction)
    {
        try {
            $direction->delete();
            return $this->success(null, 'Direction supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}