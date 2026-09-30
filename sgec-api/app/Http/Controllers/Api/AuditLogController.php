<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        try {
            $query = AuditLog::with('user');

            if ($request->filled('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->filled('event')) {
                $query->where('event', 'like', "%{$request->event}%");
            }

            if ($request->filled('date_debut')) {
                $query->whereDate('created_at', '>=', $request->date_debut);
            }

            if ($request->filled('date_fin')) {
                $query->whereDate('created_at', '<=', $request->date_fin);
            }

            return $this->success(
                $query->orderByDesc('created_at')->paginate($request->get('per_page', 20)),
                'Journal d\'audit'
            );
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la récupération', $e->getMessage(), 500);
        }
    }

    public function show(AuditLog $auditLog)
    {
        try {
            return $this->success($auditLog->load('user'), 'Détails du log');
        } catch (\Throwable $e) {
            return $this->error('Erreur serveur', $e->getMessage(), 500);
        }
    }

    public function destroy(AuditLog $auditLog)
    {
        try {
            $auditLog->delete();
            return $this->success(null, 'Log supprimé');
        } catch (\Throwable $e) {
            return $this->error('Erreur lors de la suppression', $e->getMessage(), 500);
        }
    }
}