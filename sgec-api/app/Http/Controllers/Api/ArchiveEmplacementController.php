<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchiveEmplacement;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ArchiveEmplacementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = ArchiveEmplacement::with('archives');

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('intitule', 'like', "%{$search}%")
                      ->orWhere('salle', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('intitule')->paginate($request->get('per_page', 15)),
                'Liste des emplacements'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'intitule' => 'required|string|max:150',
                'salle' => 'nullable|string|max:100',
                'description' => 'nullable|string',
            ]);

            $emplacement = ArchiveEmplacement::create($validated);

            return $this->success($emplacement, 'Emplacement créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(ArchiveEmplacement $archiveEmplacement)
    {
        try {
            return $this->success($archiveEmplacement->load('archives'), 'Détails de l\'emplacement');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, ArchiveEmplacement $archiveEmplacement)
    {
        try {
            $validated = $request->validate([
                'intitule' => 'sometimes|string|max:150',
                'salle' => 'nullable|string|max:100',
                'description' => 'nullable|string',
            ]);

            $archiveEmplacement->update($validated);

            return $this->success($archiveEmplacement->fresh(), 'Emplacement mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(ArchiveEmplacement $archiveEmplacement)
    {
        try {
            $archiveEmplacement->delete();
            return $this->success(null, 'Emplacement supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}