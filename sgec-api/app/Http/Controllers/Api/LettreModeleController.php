<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LettreModele;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LettreModeleController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = LettreModele::with(['typeCourrier', 'createur']);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('objet', 'like', "%{$search}%");
                });
            }

            if ($request->filled('actif')) {
                $query->where('actif', $request->boolean('actif'));
            }

            if ($request->filled('type_courrier_id')) {
                $query->where('type_courrier_id', $request->type_courrier_id);
            }

            return $this->success(
                $query->orderBy('nom')->paginate($request->get('per_page', 15)),
                'Liste des modèles de lettres'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nom' => 'required|string|max:150',
                'objet' => 'nullable|string|max:255',
                'corps' => 'required|string',
                'type_courrier_id' => 'nullable|exists:type_courriers,id',
                'actif' => 'boolean',
            ]);

            $validated['created_by'] = auth()->id();
            $modele = LettreModele::create($validated);

            return $this->success($modele->load(['typeCourrier', 'createur']), 'Modèle créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(LettreModele $lettreModele)
    {
        try {
            return $this->success($lettreModele->load(['typeCourrier', 'createur']), 'Détails du modèle');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, LettreModele $lettreModele)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:150',
                'objet' => 'nullable|string|max:255',
                'corps' => 'sometimes|string',
                'type_courrier_id' => 'nullable|exists:type_courriers,id',
                'actif' => 'boolean',
            ]);

            $lettreModele->update($validated);

            return $this->success($lettreModele->fresh(['typeCourrier', 'createur']), 'Modèle mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(LettreModele $lettreModele)
    {
        try {
            $lettreModele->delete();
            return $this->success(null, 'Modèle supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}
