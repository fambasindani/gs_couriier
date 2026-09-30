<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogAudit
{
    public function handle(Request $request, Closure $next): Response
    {
        Log::info('🔥 LogAudit START', [
            'method' => $request->method(),
            'path' => $request->path(),
            'user_id' => $request->user()?->id,
        ]);

        $response = $next($request);

        Log::info('🔥 LogAudit AFTER', [
            'status' => $response->getStatusCode(),
            'method' => $request->method(),
        ]);

        if ($request->user() && $request->is('api/*')) {
            if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
                try {
                    AuditLog::create([
                        'user_id'    => $request->user()->id,
                        'event'      => $request->method() . ' ' . $request->path(),
                        'url'        => $request->fullUrl(),
                        'ip_address' => $request->ip(),
                        'user_agent' => $request->userAgent(),
                    ]);
                    Log::info('✅ AuditLog créé');
                } catch (\Throwable $e) {
                    Log::error('❌ AuditLog échec : ' . $e->getMessage());
                }
            }
        }

        return $response;
    }
}