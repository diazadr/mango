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
                'umkm.assessmentResults',
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
            // SIKIM can see requests from their own institution
            $institutionIds = $user->institutions()->pluck('institutions.id');
            $query->whereIn('institution_id', $institutionIds);
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

        // [FIX] Validasi kuota: tolak jika UMKM masih punya request aktif
        $hasActiveRequest = ConsultationRequest::query()
            ->where('umkm_id', $user->umkm->id)
            ->whereIn('status', ['pending', 'assigned', 'ongoing'])
            ->exists();

        if ($hasActiveRequest) {
            throw new \Exception(
                'Anda masih memiliki permintaan mentoring yang sedang aktif. ' .
                'Selesaikan terlebih dahulu sebelum membuat permintaan baru.',
                422
            );
        }

        return ConsultationRequest::create([
            // [FIX BUG FATAL] Gunakan institution_id bukan organization_id
            'institution_id' => $user->umkm->institution_id,
            'umkm_id'        => $user->umkm->id,
            'requested_by'   => $user->id,
            'topic'          => $data['topic'],
            'description'    => $data['description'],
            'status'         => 'pending',
            'department_id'  => $data['department_id'] ?? null,
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
                $request->assignments()->delete();

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
                    'scheduled_at'            => $data['scheduled_at'],
                    'duration_minutes'        => $data['duration_minutes'] ?? null,
                    'medium'                  => $data['medium'],
                    'status'                  => 'scheduled',
                    // [TAMBAH] Link/lokasi pertemuan
                    'meeting_link'            => $data['meeting_link'] ?? null,
                    'location'                => $data['location'] ?? null,
                ]);

                if ($request->status === 'assigned') {
                    $request->update(['status' => 'ongoing']);
                }

                return $session;
            }
        );
    }

    public function addNote(
        ConsultationSession $session,
        User $author,
        array $data
    ): ConsultationNote {
        $note = ConsultationNote::create([
            'consultation_session_id' => $session->id,
            'author_id'               => $author->id,
            'content'                 => $data['content'],
            'improved_categories'     => $data['improved_categories'] ?? null,
            'session_output'          => $data['session_output'] ?? null,
            'has_measurable_impact'   => $data['has_measurable_impact'] ?? false,
        ]);

        // [FIX] Auto-complete session dari 'scheduled' menjadi 'completed' saat note ditambahkan
        if ($session->status === 'scheduled') {
            $session->update(['status' => 'completed']);
        }

        if (!empty($data['has_measurable_impact']) && !empty($data['improved_categories'])) {
            $session->load('consultationRequest.umkm');
            if ($session->consultationRequest && $session->consultationRequest->umkm) {
                app(\App\Services\Umkm\Strategy\AssessmentService::class)
                    ->applyMentoringImpact($session->consultationRequest->umkm, $data['improved_categories']);
            }
        }

        return $note;
    }

    public function completeRequest(
        ConsultationRequest $request
    ): void {
        $request->update([
            'status' => 'done',
        ]);

        // Kumpulkan semua kategori yang sudah diperbaiki selama pendampingan
        $request->load(['sessions.notes', 'umkm']);

        if ($request->umkm) {
            $categoryIds = [];

            foreach ($request->sessions as $session) {
                foreach ($session->notes as $note) {
                    if (!empty($note->improved_categories)) {
                        $categoryIds = array_merge($categoryIds, $note->improved_categories);
                    }
                }
            }

            $categoryIds = array_unique($categoryIds);

            if (!empty($categoryIds)) {
                app(\App\Services\Umkm\Strategy\AssessmentService::class)
                    ->applyMentoringImpact($request->umkm, $categoryIds);
            }
        }
    }
}
