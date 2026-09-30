<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ServiceController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Service::with('departement.direction');

            if ($request->filled('departement_id')) {
                $query->where('departement_id', $request->departement_id);
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
                'Liste des services'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'departement_id' => 'required|exists:departements,id',
                'code' => 'required|string|max:50',
                'libelle' => 'required|string|max:150',
                'description' => 'nullable|string',
            ]);

            $service = Service::create($validated);

            return $this->success($service->load('departement'), 'Service créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Service $service)
    {
        try {
            return $this->success($service->load('departement.direction'), 'Détails du service');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Service $service)
    {
        try {
            $validated = $request->validate([
                'departement_id' => 'sometimes|exists:departements,id',
                'code' => 'sometimes|string|max:50',
                'libelle' => 'sometimes|string|max:150',
                'description' => 'nullable|string',
            ]);

            $service->update($validated);

            return $this->success($service->fresh('departement'), 'Service mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Service $service)
    {
        try {
            $service->delete();
            return $this->success(null, 'Service supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}