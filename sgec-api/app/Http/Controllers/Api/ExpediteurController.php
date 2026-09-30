<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expediteur;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ExpediteurController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Expediteur::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('type_personne')) {
                $query->where('type_personne', $request->type_personne);
            }

            return $this->success(
                $query->orderBy('nom')->paginate($request->get('per_page', 15)),
                'Liste des expéditeurs'
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
                'type_personne' => 'required|in:PHYSIQUE,MORALE',
                'adresse' => 'nullable|string',
                'telephone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:150',
            ]);

            $expediteur = Expediteur::create($validated);

            return $this->success($expediteur, 'Expéditeur créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Expediteur $expediteur)
    {
        try {
            return $this->success($expediteur, 'Détails de l\'expéditeur');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Expediteur $expediteur)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:150',
                'type_personne' => 'sometimes|in:PHYSIQUE,MORALE',
                'adresse' => 'nullable|string',
                'telephone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:150',
            ]);

            $expediteur->update($validated);

            return $this->success($expediteur->fresh(), 'Expéditeur mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Expediteur $expediteur)
    {
        try {
            $expediteur->delete();
            return $this->success(null, 'Expéditeur supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}