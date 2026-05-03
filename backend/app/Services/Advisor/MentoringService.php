<?php

namespace App\Services\Advisor;

use App\Models\Master\Department;
use App\Models\Mentoring\ConsultationNote;
use App\Models\Mentoring\ConsultationRequest;
use App\Models\Mentoring\ConsultationSession;
use App\Models\Mentoring\MentorAssignment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class MentoringService
{
    public function getDepartments()
    {
        return Department::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getRequests(
        array $filters,
        User $user
    ) {
        $query = ConsultationRequest::query()
            ->with([
                'umkm',
                'department',
                'assignments',
                'assignments.mentor',
                'sessions',
                'sessions.notes',
            ]);

        // Admin and Super Admin can see all requests
        if (
            $user->hasRole('super_admin') ||
            $user->hasRole('admin')
        ) {
            // No extra filtering needed for admins
        } elseif ($user->hasRole('upt')) {
            // SIKIM can see requests from their own organization
            $organizationIds = $user->organizations()->pluck('organizations.id');
            $query->whereIn('organization_id', $organizationIds);
        } elseif ($user->hasRole('advisor')) {
            $query->whereHas(
                'assignments',
                function ($builder) use ($user) {
                    $builder->where(
                        'mentor_user_id',
                        $user->id
                    );
                }
            );
        } elseif ($user->hasRole('umkm')) {
            if (! $user->umkm) {
                return collect([]);
            }

            $query->where(
                'umkm_id',
                $user->umkm->id
            );
        } else {
            return collect([]);
        }

        $query->orderBy(
            $filters['sort_by'] ?? 'created_at',
            $filters['sort_dir'] ?? 'desc'
        );

        return $query->paginate(
            min((int) ($filters['per_page'] ?? 15), 100)
        );
    }

    public function createRequest(
        User $user,
        array $data
    ): ConsultationRequest {
        if (! $user->umkm) {
            throw new \Exception('Anda harus melengkapi profil UMKM terlebih dahulu.');
        }

        return ConsultationRequest::create([
            'organization_id' => $user->umkm->organization_id,
            'umkm_id' => $user->umkm->id,
            'requested_by' => $user->id,
            'topic' => $data['topic'],
            'description' => $data['description'],
            'status' => 'pending',
            'department_id' => $data['department_id'] ?? null,
        ]);
    }

    public function assignDepartment(
        ConsultationRequest $request,
        int $departmentId
    ): void {
        $request->update([
            'department_id' => $departmentId,
        ]);
    }

    public function assignMentor(
        ConsultationRequest $request,
        User $mentor,
        User $assigner
    ): MentorAssignment {
        return DB::transaction(
            function () use (
                $request,
                $mentor,
                $assigner
            ) {
                $assignment = MentorAssignment::create([
                    'consultation_request_id' => $request->id,
                    'mentor_user_id' => $mentor->id,
                    'assigned_by' => $assigner->id,
                    'assigned_at' => now(),
                ]);

                $request->update([
                    'status' => 'assigned',
                ]);

                return $assignment;
            }
        );
    }

    public function createSession(
        ConsultationRequest $request,
        array $data
    ): ConsultationSession {
        return DB::transaction(
            function () use ($request, $data) {
                $session = ConsultationSession::create([
                    'consultation_request_id' => $request->id,
                    'scheduled_at' => $data['scheduled_at'],
                    'duration_minutes' => $data['duration_minutes']
                        ?? null,
                    'medium' => $data['medium'],
                    'status' => 'scheduled',
                ]);

                if (
                    $request->status === 'assigned'
                ) {
                    $request->update([
                        'status' => 'ongoing',
                    ]);
                }

                return $session;
            }
        );
    }

    public function addNote(
        ConsultationSession $session,
        User $author,
        string $content
    ): ConsultationNote {
        return ConsultationNote::create([
            'consultation_session_id' => $session->id,
            'author_id' => $author->id,
            'content' => $content,
        ]);
    }

    public function completeRequest(
        ConsultationRequest $request
    ): void {
        $request->update([
            'status' => 'done',
        ]);
    }
}
