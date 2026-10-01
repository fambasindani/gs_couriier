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
        $sortant = TypeCourrier::where('code', 'SORTANT')->value('id');
        $interne = TypeCourrier::where('code', 'INTERNE')->value('id');

        $modeles = [
            [
                'nom' => 'Accusé de réception',
                'objet' => 'Accusé de réception — {{numero}}',
                'type_courrier_id' => $entrant,
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
                'nom' => 'Note de transmission',
                'objet' => 'Note de transmission — {{objet}}',
                'type_courrier_id' => $interne,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Note de transmission\n\n"
                    . "Référence : {{numero}}\n"
                    . "Objet : {{objet}}\n"
                    . "À : {{destinataire}}\n\n"
                    . "Pour traitement et suivi, veuillez trouver ci-joint le courrier référencé "
                    . "« {{reference_externe}} » reçu le {{date_reception}}.\n\n"
                    . "Le délai de traitement souhaité est fixé au {{date_limite}}.\n\n"
                    . "Le Secrétariat Général\nSGEC",
            ],
            [
                'nom' => 'Demande de complément',
                'objet' => 'Demande de complément — {{objet}}',
                'type_courrier_id' => null,
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
            [
                'nom' => "Demande d'information",
                'objet' => "Demande d'information — {{numero}}",
                'type_courrier_id' => $sortant,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Demande d'information\n\n"
                    . "À l'attention de {{destinataire}},\n\n"
                    . "Nous vous prions de bien vouloir nous communiquer les informations suivantes concernant :\n"
                    . "{{objet}}\n\n"
                    . "1. ....................................................\n"
                    . "2. ....................................................\n"
                    . "3. ....................................................\n\n"
                    . "Nous vous saurions gré de bien vouloir nous répondre au plus tard le {{date_limite}}.\n\n"
                    . "Veuillez agréer, {{destinataire}}, l'expression de nos salutations distinguées.\n\n"
                    . "SGEC",
            ],
            [
                'nom' => 'Réponse à une demande',
                'objet' => 'Réponse — {{objet}}',
                'type_courrier_id' => $sortant,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Réponse à votre correspondance du {{date_courrier}}\n"
                    . "Votre référence : {{reference_externe}}\n\n"
                    . "À l'attention de {{expediteur}},\n\n"
                    . "En réponse à votre courrier visé en objet, nous avons l'honneur de vous informer ce qui suit :\n\n"
                    . "....................................................................\n"
                    . "....................................................................\n\n"
                    . "Nous restons à votre disposition pour tout renseignement complémentaire.\n\n"
                    . "Veuillez agréer, {{expediteur}}, l'expression de nos salutations distinguées.\n\n"
                    . "SGEC",
            ],
            [
                'nom' => 'Relance — dossier en retard',
                'objet' => 'Relance — {{objet}}',
                'type_courrier_id' => null,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Relance — traitement du dossier « {{objet}} »\n\n"
                    . "À l'attention de {{destinataire}},\n\n"
                    . "Nous nous permettons d'attirer votre attention sur le dossier référencé « {{numero}} », "
                    . "dont le délai de traitement était fixé au {{date_limite}}.\n\n"
                    . "À ce jour, nous n'avons pas encore enregistré sa clôture. Nous vous prions de bien "
                    . "vouloir procéder au traitement ou de nous indiquer les raisons du retard.\n\n"
                    . "Nous vous remercions de votre diligence.\n\n"
                    . "SGEC",
            ],
            [
                'nom' => 'Invitation / Convocation',
                'objet' => 'Convocation — {{objet}}',
                'type_courrier_id' => $interne,
                'corps' => "Kinshasa, le {{date_du_jour}}\n\n"
                    . "Objet : Convocation — {{objet}}\n\n"
                    . "À l'attention de {{destinataire}},\n\n"
                    . "Vous êtes invité(e) à prendre part à une réunion portant sur le dossier « {{numero}} » :\n\n"
                    . "• Date : ...................................\n"
                    . "• Heure : ...................................\n"
                    . "• Lieu : ...................................\n\n"
                    . "Votre présence est vivement souhaitée. En cas d'empêchement, veuillez désigner un représentant.\n\n"
                    . "SGEC",
            ],
        ];

        foreach ($modeles as $modele) {
            LettreModele::updateOrCreate(
                ['nom' => $modele['nom']],
                array_merge($modele, ['actif' => true])
            );
        }

        $this->command->info('✅ ' . count($modeles) . ' modèles de lettres créés/mis à jour.');
    }
}
