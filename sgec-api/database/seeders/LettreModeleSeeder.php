<?php

namespace Database\Seeders;

use App\Models\LettreModele;
use App\Models\TypeCourrier;
use Illuminate\Database\Seeder;

class LettreModeleSeeder extends Seeder
{
    public function run(): void
    {
        $entrant = TypeCourrier::where('code', 'ENTRANT')->value('id');

        $modeles = [
            [
                'nom' => 'Accusé de réception',
                'objet' => 'Accusé de réception — {{numero}}',
                'type_courrier_id' => $entrant,
                'actif' => true,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Accusé de réception — {{numero}}\n\n"
                    . "À l'attention de {{expediteur}},\n\n"
                    . "Nous accusons réception de votre correspondance référencée « {{reference_externe}} » "
                    . "du {{date_courrier}}, ayant pour objet : {{objet}}.\n\n"
                    . "Votre courrier a été enregistré sous le numéro {{numero}} (catégorie : {{categorie}}, "
                    . "priorité : {{priorite}}) et transmis au service compétent pour traitement.\n\n"
                    . "Veuillez agréer, {{expediteur}}, l'expression de nos salutations distinguées.\n\n"
                    . "Le Secrétariat Général\nSGEC",
            ],
            [
                'nom' => 'Demande de complément',
                'objet' => 'Demande de complément — {{objet}}',
                'type_courrier_id' => null,
                'actif' => true,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Demande de complément — {{objet}}\n\n"
                    . "À l'attention de {{expediteur}},\n\n"
                    . "Dans le cadre du traitement du dossier « {{objet}} » (référence {{numero}}), "
                    . "nous vous prions de bien vouloir nous transmettre les pièces complémentaires suivantes :\n"
                    . "- ....................................................\n"
                    . "- ....................................................\n\n"
                    . "Date limite de réponse suggérée : {{date_limite}}.\n\n"
                    . "Nous vous remercions par avance de votre collaboration.\n\n"
                    . "SGEC",
            ],
        ];

        foreach ($modeles as $modele) {
            LettreModele::updateOrCreate(['nom' => $modele['nom']], $modele);
        }

        $this->command->info('✅ ' . count($modeles) . ' modèles de lettres créés.');
    }
}
