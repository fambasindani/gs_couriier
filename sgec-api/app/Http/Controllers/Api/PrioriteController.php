<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Priorite;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PrioriteController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Priorite::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('libelle', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('niveau')->paginate($request->get('per_page', 15)),
                'Liste des priorités'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'code' => 'required|string|max:50|unique:priorites,code',
                'libelle' => 'required|string|max:100',
                'niveau' => 'required|integer|min:1',
            ]);

            $priorite = Priorite::create($validated);

            return $this->success($priorite, 'Priorité créée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Priorite $priorite)
    {
        try {
            return $this->success($priorite, 'Détails de la priorité');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Priorite $priorite)
    {
        try {
            $validated = $request->validate([
                'code' => 'sometimes|string|max:50|unique:priorites,code,' . $priorite->id,
                'libelle' => 'sometimes|string|max:100',
                'niveau' => 'sometimes|integer|min:1',
            ]);

            $priorite->update($validated);

            return $this->success($priorite->fresh(), 'Priorité mise à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Priorite $priorite)
    {
        try {
            $priorite->delete();
            return $this->success(null, 'Priorité supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}