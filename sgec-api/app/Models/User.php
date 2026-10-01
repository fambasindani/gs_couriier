<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'actif',
        'direction_id',
        'departement_id',
        'service_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'actif' => 'boolean',
        'password' => 'hashed',
    ];

    /**
     * Rôles associés à cet utilisateur.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'user_roles');
    }

    public function direction(): BelongsTo
    {
        return $this->belongsTo(Direction::class);
    }

    public function departement(): BelongsTo
    {
        return $this->belongsTo(Departement::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Vérifie si l'utilisateur est administrateur.
     */
    public function isAdmin(): bool
    {
        return $this->roles()->where('nom', 'Administrateur')->exists();
    }

    /**
     * Vérifie si l'utilisateur possède une permission via ses rôles.
     * L'administrateur a TOUJOURS accès.
     */
    public function hasPermission(string $slug): bool
    {
        // 🔓 Administrateur : accès total
        if ($this->isAdmin()) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn ($q) => $q->where('slug', $slug))
            ->exists();
    }

    /**
     * Vérifie si l'utilisateur possède un rôle donné.
     */
    public function hasRole(string $nom): bool
    {
        return $this->roles()->where('nom', $nom)->exists();
    }
}