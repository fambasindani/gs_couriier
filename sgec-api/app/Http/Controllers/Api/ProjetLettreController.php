<?php

namespace App\Http\Controllers\Api;

use App\Helpers\AuditLogger;
use App\Http\Controllers\Controller;
use App\Models\Courrier;
use App\Models\ProjetLettre;
use App\Models\StatutCourrier;
use App\Models\TypeCourrier;
use App\Models\ValidationProjetLettre;
use App\Models\VersionProjetLettre;
use App\Services\ProjetLettreService;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ProjetLettreController extends Controller
{
    use ApiResponse;

    private const RELATIONS = [
        'courrierEntrant.typeCourrier', 'courrierEntrant.expediteur', 'courrierEntrant.destinataire',
        'courrierSortant.typeCourrier',
        'serviceRedacteur', 'createur', 'signataire',
        'versions.utilisateur', 'validations.valideur', 'validations.version', 'historique.utilisateur',
    ];

    public function index(Request $request)
    {
        try {
            $query = ProjetLettre::with([
                'courrierEntrant', 'courrierSortant', 'serviceRedacteur', 'createur', 'signataire',
            ]);

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('reference_projet', 'like', "%{$search}%")
                      ->orWhere('objet', 'like', "%{$search}%")
                      ->orWhere('destinataire', 'like', "%{$search}%");
                });
            }

            if ($request->filled('statut')) {
                $query->where('statut', $request->statut);
            }

            if ($request->filled('courrier_entrant_id')) {
                $query->where('courrier_entrant_id', $request->courrier_entrant_id);
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 15)),
                'Liste des projets de lettres'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'courrier_entrant_id' => 'nullable|exists:courriers,id',
                'dossier_id' => 'nullable|integer',
                'objet' => 'required|string|max:255',
                'destinataire' => 'nullable|string|max:255',
                'service_redacteur_id' => 'nullable|exists:services,id',
                'signataire_id' => 'nullable|exists:users,id',
            ]);

            $validated['reference_projet'] = ProjetLettre::genererReference();
            $validated['createur_id'] = auth()->id();
            $validated['statut'] = 'BROUILLON';
            $validated['date_creation'] = now();

            $projet = ProjetLettre::create($validated);

            ProjetLettreService::changerStatut($projet, 'BROUILLON', 'creation', auth()->user(), 'Création du projet de lettre');

            AuditLogger::log('projet_lettre.cree', "Projet {$projet->reference_projet} créé");

            return $this->success($projet->load(self::RELATIONS), 'Projet de lettre créé', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création', $e->getMessage(), 500);
        }
    }

    public function show(ProjetLettre $projetLettre)
    {
        try {
            return $this->success($projetLettre->load(self::RELATIONS), 'Détails du projet de lettre');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function update(Request $request, ProjetLettre $projetLettre)
    {
        try {
            $validated = $request->validate([
                'courrier_entrant_id' => 'nullable|exists:courriers,id',
                'dossier_id' => 'nullable|integer',
                'objet' => 'sometimes|string|max:255',
                'destinataire' => 'nullable|string|max:255',
                'service_redacteur_id' => 'nullable|exists:services,id',
                'signataire_id' => 'nullable|exists:users,id',
            ]);

            $projetLettre->update($validated);

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Projet mis à jour');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la mise à jour', $e->getMessage(), 500);
        }
    }

    public function genererWord(Request $request, ProjetLettre $projetLettre)
    {
        try {
            $version = ProjetLettreService::genererWord($projetLettre, $request->user(), $request->get('commentaire'));
            ProjetLettreService::changerStatut($projetLettre, 'EN_REDACTION', 'generation_word', $request->user(), "Version v{$version->numero_version} générée");

            return $this->success($version, 'Document Word généré', 201);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la génération', $e->getMessage(), 500);
        }
    }

    public function importerVersion(Request $request, ProjetLettre $projetLettre)
    {
        try {
            $validated = $request->validate([
                'fichier' => 'required|file|mimes:docx,doc|max:10240',
                'commentaire' => 'nullable|string',
            ]);

            $fichier = $request->file('fichier');
            if (in_array(strtolower($fichier->getClientOriginalExtension()), ['exe', 'php', 'js', 'bat'])) {
                return $this->error('Type de fichier non autorisé.', null, 422);
            }

            $version = ProjetLettreService::importerVersion($projetLettre, $fichier, $request->user(), $validated['commentaire'] ?? null);
            ProjetLettreService::changerStatut($projetLettre, 'EN_REDACTION', 'import_version', $request->user(), "Version v{$version->numero_version} importée");

            return $this->success($version, 'Version importée', 201);
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'import', $e->getMessage(), 500);
        }
    }

    public function telechargerVersion(ProjetLettre $projetLettre, VersionProjetLettre $version)
    {
        try {
            if ((int) $version->projet_lettre_id !== (int) $projetLettre->id) {
                return $this->error('Version introuvable pour ce projet.', null, 404);
            }

            $path = Storage::disk('local')->path($version->chemin_fichier);
            if (! file_exists($path)) {
                return $this->error('Fichier introuvable.', null, 404);
            }

            return response()->download($path, $version->nom_fichier_original);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors du téléchargement', $e->getMessage(), 500);
        }
    }

    public function soumettre(Request $request, ProjetLettre $projetLettre)
    {
        try {
            if ($projetLettre->versions()->count() === 0) {
                return $this->error('Générez ou importez au moins une version avant de soumettre.', null, 422);
            }

            $projetLettre->update(['date_soumission' => now()]);
            ProjetLettreService::changerStatut($projetLettre, 'SOUMIS_A_VALIDATION', 'soumission', $request->user(), $request->get('commentaire'));

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Projet soumis à validation');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la soumission', $e->getMessage(), 500);
        }
    }

    public function decision(Request $request, ProjetLettre $projetLettre)
    {
        try {
            $validated = $request->validate([
                'decision' => 'required|in:APPROUVE,CORRECTION,REJETE',
                'observation' => 'nullable|string',
                'niveau_validation' => 'nullable|integer|min:1',
            ]);

            if ($projetLettre->statut !== 'SOUMIS_A_VALIDATION') {
                return $this->error('Ce projet n\'est pas en attente de validation.', null, 409);
            }

            $derniereVersion = $projetLettre->derniereVersion();

            ValidationProjetLettre::create([
                'projet_lettre_id' => $projetLettre->id,
                'version_projet_id' => $derniereVersion?->id,
                'valideur_id' => $request->user()->id,
                'decision' => $validated['decision'],
                'observation' => $validated['observation'] ?? null,
                'date_decision' => now(),
                'niveau_validation' => $validated['niveau_validation'] ?? 1,
            ]);

            $nouveauStatut = match ($validated['decision']) {
                'APPROUVE' => 'A_SIGNER',
                'CORRECTION' => 'A_CORRIGER',
                'REJETE' => 'ANNULE',
            };

            if ($validated['decision'] === 'APPROUVE') {
                $projetLettre->update(['date_validation' => now()]);
            }

            ProjetLettreService::changerStatut($projetLettre, $nouveauStatut, 'decision_' . strtolower($validated['decision']), $request->user(), $validated['observation'] ?? null);

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Décision enregistrée');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la décision', $e->getMessage(), 500);
        }
    }

    public function signer(Request $request, ProjetLettre $projetLettre)
    {
        try {
            // Signature DIRECTE autorisée (sans passer par soumission/validation) pour les
            // personnes habilitées. On bloque seulement les états déjà signés/terminaux.
            if (in_array($projetLettre->statut, ['SIGNE', 'EXPEDIE', 'ARCHIVE', 'ANNULE'], true)) {
                return $this->error('Ce projet ne peut plus être signé (statut ' . $projetLettre->statut . ').', null, 409);
            }

            $version = $projetLettre->derniereVersion();
            if ($version) {
                ProjetLettreService::marquerVersionFinale($projetLettre, $version);
            }

            $projetLettre->update([
                'statut' => 'SIGNE',
                'date_signature' => now(),
                'signataire_id' => $projetLettre->signataire_id ?? $request->user()->id,
            ]);

            ProjetLettreService::changerStatut($projetLettre, 'SIGNE', 'signature', $request->user(), $request->get('commentaire'));
            AuditLogger::log('projet_lettre.signe', "Projet {$projetLettre->reference_projet} signé");

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Projet signé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la signature', $e->getMessage(), 500);
        }
    }

    public function creerCourrierSortant(Request $request, ProjetLettre $projetLettre)
    {
        try {
            if ($projetLettre->statut !== 'SIGNE') {
                return $this->error('Le projet doit être signé avant de créer le courrier sortant.', null, 409);
            }

            if ($projetLettre->courrier_sortant_id) {
                return $this->error('Un courrier sortant est déjà associé à ce projet.', null, 409);
            }

            $typeSortant = TypeCourrier::where('code', 'SORTANT')->value('id');

            $courrier = Courrier::create([
                'numero' => Courrier::genererNumero(),
                'reference_externe' => $projetLettre->reference_projet,
                'type_courrier_id' => $typeSortant,
                'priorite_id' => \App\Models\Priorite::where('code', 'NORMALE')->value('id') ?? \App\Models\Priorite::value('id'),
                'statut_id' => StatutCourrier::idParCode('ENREGISTRE'),
                'objet' => $projetLettre->objet,
                'contenu' => 'Courrier sortant généré depuis le projet de lettre ' . $projetLettre->reference_projet,
                'date_reception' => now(),
                'confidentialite' => 'INTERNE',
                'nombre_pages' => 0,
                'created_by' => $request->user()->id,
            ]);

            $projetLettre->update([
                'courrier_sortant_id' => $courrier->id,
                'statut' => 'A_EXPEDIER',
            ]);

            ProjetLettreService::changerStatut($projetLettre, 'A_EXPEDIER', 'courrier_sortant_cree', $request->user(), "Courrier sortant {$courrier->numero} créé");
            AuditLogger::log('projet_lettre.courrier_sortant', "Courrier sortant {$courrier->numero} créé depuis {$projetLettre->reference_projet}");

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Courrier sortant créé', 201);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la création du courrier sortant', $e->getMessage(), 500);
        }
    }

    public function expedier(Request $request, ProjetLettre $projetLettre)
    {
        try {
            $validated = $request->validate([
                'mode_expedition' => 'nullable|string|max:50',
                'commentaire' => 'nullable|string',
            ]);

            if (! $projetLettre->courrier_sortant_id) {
                return $this->error('Créez d\'abord le courrier sortant.', null, 409);
            }

            $projetLettre->update([
                'statut' => 'EXPEDIE',
                'date_expedition' => now(),
                'mode_expedition' => $validated['mode_expedition'] ?? $projetLettre->mode_expedition,
            ]);

            if ($projetLettre->courrierSortant) {
                $projetLettre->courrierSortant->update(['statut_id' => StatutCourrier::idParCode('TRAITE')]);
            }

            ProjetLettreService::changerStatut($projetLettre, 'EXPEDIE', 'expedition', $request->user(), $validated['commentaire'] ?? 'Courrier expédié');
            AuditLogger::log('projet_lettre.expedie', "Projet {$projetLettre->reference_projet} expédié");

            return $this->success($projetLettre->fresh(self::RELATIONS), 'Courrier expédié');
        } catch (ValidationException $e) {
            return $this->error('Erreur de validation', $e->errors(), 422);
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'expédition', $e->getMessage(), 500);
        }
    }

    public function archiver(Request $request, ProjetLettre $projetLettre)
    {
        try {
            ProjetLettreService::changerStatut($projetLettre, 'ARCHIVE', 'archivage', $request->user(), $request->get('commentaire'));
            return $this->success($projetLettre->fresh(self::RELATIONS), 'Projet archivé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'archivage', $e->getMessage(), 500);
        }
    }

    public function annuler(Request $request, ProjetLettre $projetLettre)
    {
        try {
            ProjetLettreService::changerStatut($projetLettre, 'ANNULE', 'annulation', $request->user(), $request->get('commentaire'));
            return $this->success($projetLettre->fresh(self::RELATIONS), 'Projet annulé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de l\'annulation', $e->getMessage(), 500);
        }
    }

    public function destroy(ProjetLettre $projetLettre)
    {
        try {
            $reference = $projetLettre->reference_projet;

            // Suppression des fichiers stockés
            Storage::disk('local')->deleteDirectory('projets_lettres/' . $projetLettre->id);

            $projetLettre->delete(); // cascade versions/validations/historique

            AuditLogger::log('projet_lettre.supprime', "Projet {$reference} supprimé");

            return $this->success(null, 'Projet de lettre supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}
