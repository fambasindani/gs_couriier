<?php

namespace App\Helpers;

use App\Models\AuditLog;

class AuditLogger
{
    /**
     * Enregistre un événement métier dans le journal d'audit.
     *
     * @param  string  $event  Ex: "courrier.created", "courrier.validated"
     * @param  string  $url    URL ou contexte
     */
    public static function log(string $event, ?string $url = null): void
    {
        try {
            AuditLog::create([
                'user_id'    => auth()->id(),
                'event'      => $event,
                'url'        => $url ?? request()->fullUrl(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Throwable $e) {
            // Silencieux
        }
    }
}