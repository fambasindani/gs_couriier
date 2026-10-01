<?php

namespace App\Services;

use App\Models\HistoriqueProjetLettre;
use App\Models\ProjetLettre;
use App\Models\User;
use App\Models\VersionProjetLettre;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;

class ProjetLettreService
{
    private const DISQUE = 'local';

    /**
     * Génère un fichier Word (.docx) à partir du projet et l'enregistre comme version.
     */
    public static function genererWord(ProjetLettre $projet, User $user, ?string $commentaire = null): VersionProjetLettre
    {
        $projet->loadMissing(['courrierEntrant', 'createur', 'serviceRedacteur']);

        $phpWord = new PhpWord();
        $section = $phpWord->addSection([
            'marginTop' => 1200,
            'marginBottom' => 1200,
            'marginLeft' => 1200,
            'marginRight' => 1200,
        ]);

        // En-tête
        $section->addText('SGEC', ['bold' => true, 'size' => 16, 'color' => '000091']);
        $section->addText('République Démocratique du Congo', ['size' => 9, 'color' => '666666']);
        $section->addTextBreak(1);

        // Références
        $section->addText('Référence projet : ' . $projet->reference_projet, ['size' => 10]);
        if ($projet->courrierEntrant) {
            $section->addText('Référence courrier reçu : ' . $projet->courrierEntrant->numero, ['size' => 10]);
        }
        $section->addText('Destinataire : ' . ($projet->destinataire ?: '........................................'), ['size' => 10]);
        if ($projet->serviceRedacteur) {
            $section->addText('Service rédacteur : ' . $projet->serviceRedacteur->libelle, ['size' => 10]);
        }

        $section->addTextBreak(1);
        $section->addText('Objet : ' . $projet->objet, ['bold' => true, 'size' => 12], ['spaceAfter' => 240]);
        $section->addTextBreak(1);

        // Corps à rédiger
        $section->addText(
            '[Rédigez ici le corps de la lettre dans Microsoft Word, puis réimportez le fichier modifié.]',
            ['size' => 12, 'italic' => true, 'color' => '888888']
        );

        $section->addTextBreak(3);

        // Bloc signature
        $section->addText('Le ' . now()->format('d/m/Y'), ['size' => 11], ['alignment' => 'right']);
        $section->addText(
            $projet->signataire?->name ?: '........................................................',
            ['size' => 11, 'bold' => true],
            ['alignment' => 'right']
        );

        $tmp = tempnam(sys_get_temp_dir(), 'pl_') . '.docx';
        IOFactory::createWriter($phpWord, 'Word2007')->save($tmp);
        $contenu = file_get_contents($tmp);
        @unlink($tmp);

        return self::stockerVersion(
            $projet,
            $user,
            $contenu,
            'Projet_' . $projet->reference_projet . '.docx',
            $commentaire ?? 'Génération automatique du modèle Word',
            'docx'
        );
    }

    /**
     * Importe une version corrigée (.docx) fournie par l'utilisateur.
     */
    public static function importerVersion(ProjetLettre $projet, UploadedFile $fichier, User $user, ?string $commentaire = null): VersionProjetLettre
    {
        $contenu = file_get_contents($fichier->getRealPath());

        return self::stockerVersion(
            $projet,
            $user,
            $contenu,
            $fichier->getClientOriginalName(),
            $commentaire ?? 'Version importée depuis Word',
            strtolower($fichier->getClientOriginalExtension())
        );
    }

    private static function stockerVersion(
        ProjetLettre $projet,
        User $user,
        string $contenu,
        string $nomOriginal,
        ?string $commentaire,
        string $extension
    ): VersionProjetLettre {
        $numero = ((int) $projet->versions()->max('numero_version')) + 1;
        $nomFichier = 'v' . str_pad((string) $numero, 3, '0', STR_PAD_LEFT) . '_' . time() . '.' . $extension;
        $dossier = 'projets_lettres/' . $projet->id;
        $chemin = $dossier . '/' . $nomFichier;

        Storage::disk(self::DISQUE)->put($chemin, $contenu);

        return VersionProjetLettre::create([
            'projet_lettre_id' => $projet->id,
            'numero_version' => $numero,
            'chemin_fichier' => $chemin,
            'nom_fichier_original' => $nomOriginal,
            'commentaire' => $commentaire,
            'utilisateur_id' => $user->id,
            'date_creation' => now(),
            'est_version_finale' => false,
        ]);
    }

    /** Marque une version comme finale (toutes les autres repassent à false). */
    public static function marquerVersionFinale(ProjetLettre $projet, VersionProjetLettre $version): void
    {
        $projet->versions()->update(['est_version_finale' => false]);
        $version->update(['est_version_finale' => true]);
    }

    /**
     * Change le statut du projet et journalise l'action.
     */
    public static function changerStatut(
        ProjetLettre $projet,
        ?string $nouveauStatut,
        string $action,
        ?User $user,
        ?string $commentaire = null
    ): ProjetLettre {
        $ancien = $projet->statut;

        if ($nouveauStatut !== null && $nouveauStatut !== $ancien) {
            $projet->update(['statut' => $nouveauStatut]);
        }

        HistoriqueProjetLettre::create([
            'projet_lettre_id' => $projet->id,
            'utilisateur_id' => $user?->id,
            'action' => $action,
            'ancien_statut' => $ancien,
            'nouveau_statut' => $nouveauStatut ?? $ancien,
            'commentaire' => $commentaire,
            'date_action' => now(),
        ]);

        return $projet;
    }
}
