<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ============================================
        // Administrateur principal (votre compte)
        // ============================================
        $admin = User::updateOrCreate(
            ['email' => 'pierrepapy@gmail.com'],
            [
                'name' => 'Pierre Papy',
                'password' => Hash::make('12345678'),
                'actif' => true,
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->sync(Role::where('nom', 'Administrateur')->pluck('id'));

        // ============================================
        // Directeur exemple
        // ============================================
        $directeur = User::updateOrCreate(
            ['email' => 'directeur@sgec.cd'],
            [
                'name' => 'Robby Mukendi',
                'password' => Hash::make('Directeur@2026'),
                'actif' => true,
                'email_verified_at' => now(),
            ]
        );
        $directeur->roles()->sync(Role::where('nom', 'Directeur')->pluck('id'));

        // ============================================
        // Agent exemple
        // ============================================
        $agent = User::updateOrCreate(
            ['email' => 'agent@sgec.cd'],
            [
                'name' => 'Agent Courrier',
                'password' => Hash::make('Agent@2026'),
                'actif' => true,
                'email_verified_at' => now(),
            ]
        );
        $agent->roles()->sync(Role::where('nom', 'Agent')->pluck('id'));

        $this->command->info('✅ 3 utilisateurs créés :');
        $this->command->info('   - pierrepapy@gmail.com / 12345678       (Administrateur)');
        $this->command->info('   - directeur@sgec.cd / Directeur@2026    (Directeur)');
        $this->command->info('   - agent@sgec.cd / Agent@2026            (Agent)');
    }
}