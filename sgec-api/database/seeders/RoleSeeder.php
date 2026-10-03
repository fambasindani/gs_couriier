<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Rôle Administrateur (toutes les permissions)
        $admin = Role::updateOrCreate(
            ['nom' => 'Administrateur'],
            ['description' => 'Accès complet à toutes les fonctionnalités du système']
        );
        $admin->permissions()->sync(Permission::pluck('id'));

        // Rôle Directeur
        $directeur = Role::updateOrCreate(
            ['nom' => 'Directeur'],
            ['description' => 'Directeur de direction, supervise les courriers et les agents']
        );
        $directeur->permissions()->sync(
            Permission::whereIn('slug', [
                'users.view',
                'courriers.view', 'courriers.create', 'courriers.update',
                'courriers.affecter', 'courriers.annoter', 'courriers.valider', 'courriers.annuler',
                // NB : pas de 'courriers.view.all' — le Directeur ne voit que sa propre direction.
                'courriers.confidentiel.view', 'courriers.tres_confidentiel.view',
                'projets.view', 'projets.create', 'projets.update', 'projets.valider', 'projets.signer',
                'structure.view',
                'audit.view',
            ])->pluck('id')
        );

        // Rôle Chef de service
        $chef = Role::updateOrCreate(
            ['nom' => 'Chef de service'],
            ['description' => 'Chef de service, gère les affectations et le traitement']
        );
        $chef->permissions()->sync(
            Permission::whereIn('slug', [
                'users.view',
                'courriers.view', 'courriers.create', 'courriers.update',
                'courriers.affecter', 'courriers.annoter',
                'courriers.confidentiel.view',
                'projets.view', 'projets.create', 'projets.update', 'projets.valider',
                'structure.view',
            ])->pluck('id')
        );

        // Rôle Agent
        $agent = Role::updateOrCreate(
            ['nom' => 'Agent'],
            ['description' => 'Agent de traitement, consulte et traite les courriers']
        );
        $agent->permissions()->sync(
            Permission::whereIn('slug', [
                'courriers.view',
                'courriers.annoter',
                'projets.view', 'projets.create',
            ])->pluck('id')
        );

        // Rôle Consultation (lecture seule)
        $consult = Role::updateOrCreate(
            ['nom' => 'Consultation'],
            ['description' => 'Accès en lecture seule']
        );
        $consult->permissions()->sync(
            Permission::whereIn('slug', [
                'courriers.view',
                'structure.view',
            ])->pluck('id')
        );

        $this->command->info('✅ 5 rôles créés avec leurs permissions.');
    }
}