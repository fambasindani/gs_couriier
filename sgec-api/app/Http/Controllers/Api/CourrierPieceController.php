<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\AuditLogger;
use App\Models\Courrier;
use App\Models\CourrierPiece;
use App\Services\CircuitService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CourrierPieceController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = CourrierPiece::with(['courrier', 'uploadePar']);

            if ($request->filled('courrier_id')) {
                $query->where('courrier_id', $request->courrier_id);
            }

            if ($request->filled('est_principal')) {
                $query->where('est_principal', $request->boolean('est_principal'));
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 15)),
                'Liste des pièces jointes'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'courrier_id' => 'required|exists:courriers,id',
                'fichier' => 'required|file|max:20480|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt',
                'est_principal' => 'nullable|boolean',
            ]);

            $courrier = Courrier::findOrFail($validated['courrier_id']);
            $file = $request->file('fichier');

            $nomOriginal = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $nomFichier = 'courrier_' . $courrier->id . '_' . time() . '.' . $extension;
            $dossier = 'courriers/' . $courrier->id;

            $chemin = $file->storeAs($dossier, $nomFichier, 'public');

            $piece = CourrierPiece::create([
                'courrier_id' => $courrier->id,
                'nom_original' => $nomOriginal,
                'nom_fichier' => $nomFichier,
                'chemin' => $chemin,
                'extension' => $extension,
                'mime_type' => $file->getClientMimeType(),
                'taille' => $file->getSize(),
                'est_principal' => $validated['est_principal'] ?? false,
                'uploaded_by' => auth()->id(),
            ]);

            $courrier->increment('nombre_pieces');

            AuditLogger::log(
                'courrier.piece.ajoutee',
                "Pièce '{$nomOriginal}' ajoutée au courrier {$courrier->numero}"
            );

            CircuitService::etape(
                $courrier,
                'courrier.piece.ajoutee',
                'Pièce jointe',
                "Pièce '{$nomOriginal}' ajoutée au courrier {$courrier->numero}"
            );

            return $this->success(
                $piece->load(['courrier', 'uploadePar']),
                'Pièce jointe uploadée avec succès',
                201
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'upload', $e->getMessage(), 500);
        }
    }

    public function show(CourrierPiece $piece)
    {
        try {
            return $this->success(
                $piece->load(['courrier', 'uploadePar']),
                'Détails de la pièce jointe'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function download(CourrierPiece $piece)
    {
        try {
            if (! Storage::disk('public')->exists($piece->chemin)) {
                return $this->error('Fichier introuvable', null, 404);
            }

            return Storage::disk('public')->download($piece->chemin, $piece->nom_original);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du téléchargement', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, CourrierPiece $piece)
    {
        try {
            $validated = $request->validate([
                'est_principal' => 'nullable|boolean',
            ]);

            $piece->update($validated);

            return $this->success(
                $piece->fresh(['courrier', 'uploadePar']),
                'Pièce jointe mise à jour'
            );
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function destroy(CourrierPiece $piece)
    {
        try {
            $courrier = $piece->courrier;

            if (Storage::disk('public')->exists($piece->chemin)) {
                Storage::disk('public')->delete($piece->chemin);
            }

            $nomOriginal = $piece->nom_original;
            $piece->delete();

            if ($courrier) {
                $courrier->decrement('nombre_pieces');

                AuditLogger::log(
                    'courrier.piece.supprimee',
                    "Pièce '{$nomOriginal}' supprimée du courrier {$courrier->numero}"
                );

                CircuitService::etape(
                    $courrier,
                    'courrier.piece.supprimee',
                    'Pièce jointe',
                    "Pièce '{$nomOriginal}' supprimée du courrier {$courrier->numero}"
                );
            }

            return $this->success(null, 'Pièce jointe supprimée');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}