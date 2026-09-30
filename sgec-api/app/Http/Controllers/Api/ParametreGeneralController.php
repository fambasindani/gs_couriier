<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParametreGeneral;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ParametreGeneralController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = ParametreGeneral::query();

            if ($request->filled('groupe')) {
                $query->where('groupe', $request->groupe);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('cle', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            return $this->success(
                $query->orderBy('groupe')->orderBy('cle')->paginate($request->get('per_page', 20)),
                'Liste des paramètres'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'cle' => 'required|string|max:100|unique:parametres_generaux,cle',
                'valeur' => 'nullable',
                'type' => 'required|in:string,int,bool,json',
                'groupe' => 'required|string|max:50',
                'description' => 'nullable|string',
            ]);

            if (is_bool($validated['valeur'])) {
                $validated['valeur'] = $validated['valeur'] ? '1' : '0';
            }

            $parametre = ParametreGeneral::create($validated);

            return $this->success($parametre, 'Paramètre créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(ParametreGeneral $parametreGeneral)
    {
        try {
            return $this->success($parametreGeneral, 'Détails du paramètre');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, ParametreGeneral $parametreGeneral)
    {
        try {
            $validated = $request->validate([
                'cle' => 'sometimes|string|max:100|unique:parametres_generaux,cle,' . $parametreGeneral->id,
                'valeur' => 'nullable',
                'type' => 'sometimes|in:string,int,bool,json',
                'groupe' => 'sometimes|string|max:50',
                'description' => 'nullable|string',
            ]);

            if (isset($validated['valeur']) && is_bool($validated['valeur'])) {
                $validated['valeur'] = $validated['valeur'] ? '1' : '0';
            }

            $parametreGeneral->update($validated);

            return $this->success($parametreGeneral->fresh(), 'Paramètre mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(ParametreGeneral $parametreGeneral)
    {
        try {
            $parametreGeneral->delete();
            return $this->success(null, 'Paramètre supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}