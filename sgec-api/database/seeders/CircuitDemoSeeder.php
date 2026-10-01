<?php

namespace Database\Seeders;

use App\Models\Archive;
use App\Models\ArchiveCategory;
use App\Models\ArchiveEmplacement;
use App\Models\CategorieCourrier;
use App\Models\Courrier;
use App\Models\CourrierAffectation;
use App\Models\CourrierAnnotation;
use App\Models\CourrierHistorique;
use App\Models\CourrierValidation;
use App\Models\Destinataire;
use App\Models\Direction;
use App\Models\Departement;
use App\Models\Expediteur;
use App\Models\Priorite;
use App\Models\Service;
use App\Models\StatutCourrier;
use App\Models\TypeCourrier;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Deux courriers parcourant TOUT le cycle jusqu'à l'archivage,
 * avec l'historique complet (circuit de traitement).
 *
 * Commande : php artisan db:seed --class=CircuitDemoSeeder
 */
class CircuitDemoSeeder extends Seeder
{
    /** @var array<int, string> */
    private array $numeros = ['COUR-2026-9001', 'COUR-2026-9002'];

    public function run(): void
    {
        $admin = User::where('email', 'pierrepapy@gmail.com')->first();
        $directeur = User::where('email', 'directeur@sgec.cd')->first() ?? $admin;
        $agent = User::where('email', 'agent@sgec.cd')->first() ?? $admin;

        if (! $admin) {
            $this->command->error('Utilisateur admin introuvable. Lancez d’abord UserSeeder.');
            return;
        }

        $type = fn (string $code) => TypeCourrier::where('code', $code)->value('id');
        $cat = fn (string $libelle) => CategorieCourrier::where('libelle', $libelle)->value('id');
        $prio = fn (string $code) => Priorite::where('code', $code)->value('id');
        $exp = fn (string $nom) => Expediteur::where('nom', $nom)->value('id');
        $dest = fn (string $nom) => Destinataire::where('nom', $nom)->value('id');
        $dir = fn (string $code) => Direction::where('code', $code)->value('id');
        $dept = fn (string $code) => Departement::where('code', $code)->value('id');
        $serv = fn (string $code) => Service::where('code', $code)->value('id');

        // Nettoyage (idempotent)
        $anciens = Courrier::whereIn('numero', $this->numeros)->pluck('id');
        if ($anciens->isNotEmpty()) {
            Archive::whereIn('courrier_id', $anciens)->delete();
            Courrier::whereIn('id', $anciens)->delete(); // cascade enfants
        }

        // -----------------------------------------------------------------
        // COURRIER 1 — ENTRANT (Ministère du Budget → Direction Générale)
        // -----------------------------------------------------------------
        $c1 = $this->creerCourrier([
            'numero' => $this->numeros[0],
            'reference_externe' => 'MIN/BUD/2026/9001',
            'type_courrier_id' => $type('ENTRANT'),
            'categorie_id' => $cat('Financier'),
            'priorite_id' => $prio('HAUTE'),
            'expediteur_id' => $exp('Ministère du Budget'),
            'destinataire_id' => $dest('Direction Générale'),
            'objet' => 'Transmission du projet de budget 2027',
            'contenu' => 'Veuillez trouver ci-joint le projet de budget pour l’exercice 2027.',
            'confidentialite' => 'CONFIDENTIEL',
            'created_by' => $admin->id,
        ]);

        $this->circuitComplet($c1, [
            'affecte_par' => $admin->id,
            'direction_id' => $dir('DAF'),
            'departement_id' => $dept('DAF-FIN'),
            'service_id' => $serv('DAF-FIN-BUD'),
            'agent' => $agent,
            'directeur' => $directeur,
            'annotation' => 'Préparer une note de synthèse pour le DG avant vendredi.',
            'commentaire_validation' => 'Validé pour transmission au Conseil des ministres.',
        ]);

        // -----------------------------------------------------------------
        // COURRIER 2 — SORTANT (Direction Générale → Ministère de la Justice)
        // -----------------------------------------------------------------
        $c2 = $this->creerCourrier([
            'numero' => $this->numeros[1],
            'reference_externe' => 'SGEC/SORT/2026/9002',
            'type_courrier_id' => $type('SORTANT'),
            'categorie_id' => $cat('Juridique'),
            'priorite_id' => $prio('NORMALE'),
            'expediteur_id' => $exp('Direction Générale DGRAD'),
            'destinataire_id' => $dest('Ministère de la Justice'),
            'objet' => 'Réponse à la demande de documentation juridique',
            'contenu' => 'En réponse à votre demande, veuillez trouver les pièces sollicitées.',
            'confidentialite' => 'INTERNE',
            'created_by' => $admin->id,
        ]);

        $this->circuitComplet($c2, [
            'affecte_par' => $admin->id,
            'direction_id' => $dir('DG'),
            'departement_id' => $dept('DG-DANTIC'),
            'service_id' => $serv('DANTIC-DEV'),
            'agent' => $agent,
            'directeur' => $directeur,
            'annotation' => 'Vérifier la conformité des pièces avant envoi.',
            'commentaire_validation' => 'Visa accordé, prêt pour expédition.',
        ]);

        $this->command->info('✅ 2 courriers avec circuit complet (jusqu’à l’archivage) créés : ' . implode(', ', $this->numeros));
    }

    private function creerCourrier(array $data): Courrier
    {
        return Courrier::create(array_merge([
            'statut_id' => StatutCourrier::idParCode('ENREGISTRE'),
            'date_courrier' => now()->subDays(20),
            'date_reception' => now()->subDays(20),
            'date_limite' => now()->addDays(5),
            'nombre_pieces' => 0,
            'nombre_pages' => 3,
        ], $data));
    }

    /**
     * Déroule toutes les étapes du circuit et journalise chaque étape.
     */
    private function circuitComplet(Courrier $courrier, array $cfg): void
    {
        $debut = now()->subDays(20);
        $jour = fn (int $n) => $debut->copy()->addDays($n)->addHours(9);

        // 1) Enregistrement
        $this->etape($courrier->id, $courrier->created_by, 'courrier.cree', 'Enregistrement',
            "Courrier {$courrier->numero} créé", $jour(0));

        // 2) Affectation
        $affectation = CourrierAffectation::create([
            'courrier_id' => $courrier->id,
            'direction_id' => $cfg['direction_id'],
            'departement_id' => $cfg['departement_id'],
            'service_id' => $cfg['service_id'],
            'user_id' => $cfg['agent']->id,
            'affecte_par' => $cfg['affecte_par'],
            'date_affectation' => $jour(1),
            'date_limite' => now()->addDays(4),
            'statut' => 'AFFECTE',
        ]);
        $courrier->update(['statut_id' => StatutCourrier::idParCode('AFFECTE')]);
        $this->etape($courrier->id, $cfg['affecte_par'], 'courrier.affecte', 'Affectation',
            "Courrier {$courrier->numero} affecté au service", $jour(1));

        // 3) Prise en charge
        $affectation->update(['statut' => 'PRIS_EN_CHARGE', 'date_prise_en_charge' => $jour(2)]);
        $courrier->update(['statut_id' => StatutCourrier::idParCode('EN_COURS')]);
        $this->etape($courrier->id, $cfg['agent']->id, 'courrier.affectation.statut', 'Traitement',
            'Affectation prise en charge par l’agent', $jour(2));

        // 4) Annotation
        CourrierAnnotation::create([
            'courrier_id' => $courrier->id,
            'user_id' => $cfg['directeur']->id,
            'annotation' => $cfg['annotation'],
            'date_limite' => now()->addDays(3),
            'etat' => 'EN_ATTENTE',
        ]);
        $this->etape($courrier->id, $cfg['directeur']->id, 'courrier.annote', 'Annotation',
            $cfg['annotation'], $jour(3));

        // 5) Mise en traitement
        $affectation->update(['statut' => 'EN_TRAITEMENT']);
        $this->etape($courrier->id, $cfg['agent']->id, 'courrier.affectation.statut', 'Traitement',
            'Courrier en cours de traitement', $jour(5));

        // 6) Validation / visa
        CourrierValidation::create([
            'courrier_id' => $courrier->id,
            'user_id' => $cfg['directeur']->id,
            'decision' => 'VALIDE',
            'commentaire' => $cfg['commentaire_validation'],
            'date_validation' => $jour(7),
        ]);
        $courrier->update(['statut_id' => StatutCourrier::idParCode('VALIDE')]);
        $this->etape($courrier->id, $cfg['directeur']->id, 'courrier.valide', 'Validation',
            'Courrier validé : ' . $cfg['commentaire_validation'], $jour(7));

        // 7) Traitement terminé
        $affectation->update(['statut' => 'TRAITE', 'date_traitement' => $jour(8)]);
        $courrier->update(['statut_id' => StatutCourrier::idParCode('TRAITE')]);
        $this->etape($courrier->id, $cfg['agent']->id, 'courrier.affectation.statut', 'Traitement',
            'Traitement terminé', $jour(8));

        // 8) Clôture
        $courrier->update([
            'statut_id' => StatutCourrier::idParCode('CLOTURE'),
            'date_cloture' => $jour(9),
        ]);
        $this->etape($courrier->id, $cfg['directeur']->id, 'courrier.cloture', 'Clôture',
            'Courrier clôturé', $jour(9));

        // 9) Archivage
        $archive = Archive::create([
            'courrier_id' => $courrier->id,
            'archive_category_id' => ArchiveCategory::value('id'),
            'archive_emplacement_id' => ArchiveEmplacement::value('id'),
            'archive_par' => $cfg['affecte_par'],
            'cote_archive' => Archive::genererCote(),
            'titre_dossier' => $courrier->objet,
            'producteur_service' => 'SGEC',
            'date_periode' => $courrier->date_courrier?->format('Y-m-d'),
            'duree_conservation_ans' => 5,
            'date_versement' => $jour(10)->toDateString(),
            'date_fin_conservation' => $jour(10)->addYears(5)->toDateString(),
            'statut_archive' => 'ACTIF',
        ]);

        $courrier->update(['statut_id' => StatutCourrier::idParCode('ARCHIVE')]);
        $this->etape($courrier->id, $cfg['affecte_par'], 'courrier.archive', 'Archivage',
            "Courrier archivé sous la cote {$archive->cote_archive}", $jour(10));
    }

    private function etape(
        int $courrierId,
        ?int $userId,
        string $action,
        string $etape,
        string $description,
        \DateTimeInterface $date
    ): void {
        $historique = new CourrierHistorique([
            'courrier_id' => $courrierId,
            'user_id' => $userId,
            'action' => $action,
            'etape' => $etape,
            'description' => $description,
            'adresse_ip' => '127.0.0.1',
        ]);
        $historique->created_at = $date;
        $historique->updated_at = $date;
        $historique->save();
    }
}
