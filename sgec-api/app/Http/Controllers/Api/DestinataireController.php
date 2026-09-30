<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destinataire;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DestinataireController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = Destinataire::query();

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->filled('type_destinataire')) {
                $query->where('type_destinataire', $request->type_destinataire);
            }

            return $this->success(
                $query->orderBy('nom')->paginate($request->get('per_page', 15)),
                'Liste des destinataires'
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
                'type_destinataire' => 'required|in:INTERNE,EXTERNE',
                'adresse' => 'nullable|string',
                'telephone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:150',
            ]);

            $destinataire = Destinataire::create($validated);

            return $this->success($destinataire, 'Destinataire créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(Destinataire $destinataire)
    {
        try {
            return $this->success($destinataire, 'Détails du destinataire');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, Destinataire $destinataire)
    {
        try {
            $validated = $request->validate([
                'nom' => 'sometimes|string|max:150',
                'type_destinataire' => 'sometimes|in:INTERNE,EXTERNE',
                'adresse' => 'nullable|string',
                'telephone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:150',
            ]);

            $destinataire->update($validated);

            return $this->success($destinataire->fresh(), 'Destinataire mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(Destinataire $destinataire)
    {
        try {
            $destinataire->delete();
            return $this->success(null, 'Destinataire supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}