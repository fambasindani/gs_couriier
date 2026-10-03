<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CapPerPage
{
    protected int $maxPerPage = 100;

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->query('per_page') !== null) {
            $capped = min($this->maxPerPage, max(1, (int) $request->query('per_page')));
            $request->query->set('per_page', (string) $capped);
            $request->merge(['per_page' => $capped]);
        }

        return $next($request);
    }
}