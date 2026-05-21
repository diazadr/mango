<?php

namespace App\Http\Controllers\Api\V1\Umkm\Project;

use App\Http\Controllers\Controller;
use App\Models\Project\ActionPlan;
use App\Models\Project\Deliverable;
use App\Models\Project\Iteration;
use App\Models\Project\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProjectController extends Controller
{
    // ── Helper: pastikan user berhak mengakses project ini ─────────────────
    private function authorizeProject(Project $project, Request $request): void
    {
        $user = $request->user();

        // Super admin, admin, advisor, and UPT can manage all projects
        if ($user->hasAnyRole(['super_admin', 'admin', 'advisor', 'upt'])) {
            return;
        }

        // UMKM hanya boleh akses project miliknya sendiri
        abort_unless(
            $user->umkm && (int) $project->umkm_id === (int) $user->umkm->id,
            403,
            'Anda tidak memiliki akses ke proyek ini.'
        );
    }

    // ── Helper: pastikan iteration milik UMKM yang benar ───────────────────
    private function authorizeIteration(Iteration $iteration, Request $request): void
    {
        $project = $iteration->project;
        abort_if(! $project, 404);
        $this->authorizeProject($project, $request);
    }

    // ── Helper: pastikan action plan milik UMKM yang benar ─────────────────
    private function authorizeActionPlan(ActionPlan $actionPlan, Request $request): void
    {
        $iteration = $actionPlan->iteration;
        abort_if(! $iteration, 404);
        $this->authorizeIteration($iteration, $request);
    }

    // ───────────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $user = $request->user();
        $userRoles = $user->getRoleNames()->toArray();

        try {
            $query = Project::query()->with(['umkm', 'assessmentResult']);

            // Scope data berdasarkan role user
            if (in_array('super_admin', $userRoles) || in_array('admin', $userRoles) || in_array('upt', $userRoles)) {
                // Staff privileged roles: can see all projects
            } elseif (in_array('umkm', $userRoles) && $user->umkm) {
                // UMKM only sees their own
                $query->where('umkm_id', $user->umkm->id);
            } elseif (in_array('advisor', $userRoles)) {
                // Advisor: filter by institution/organization membership OR via mentoring assignments
                $institutionIds  = $user->institutions()->pluck('institutions.id')->toArray();
                $organizationIds = $user->organizations()->pluck('organizations.id')->toArray();

                // Get UMKM IDs the advisor is assigned to via ConsultationRequest assignments
                $assignedUmkmIds = \App\Models\Mentoring\ConsultationRequest::query()
                    ->whereHas('assignments', fn ($q) => $q->where('mentor_user_id', $user->id))
                    ->pluck('umkm_id')
                    ->toArray();

                $query->where(function ($q) use ($institutionIds, $organizationIds, $assignedUmkmIds) {
                    // Option 1: UMKM belongs to advisor's institution or org
                    if (!empty($institutionIds) || !empty($organizationIds)) {
                        $q->whereHas('umkm', function ($inner) use ($institutionIds, $organizationIds) {
                            $inner->whereIn('institution_id', $institutionIds)
                                  ->orWhereIn('organization_id', $organizationIds);
                        });
                    }
                    // Option 2: Advisor has a direct assignment for the UMKM
                    if (!empty($assignedUmkmIds)) {
                        $q->orWhereIn('umkm_id', $assignedUmkmIds);
                    }
                });
            } else {
                // Fallback: see nothing
                $query->whereRaw('1 = 0');
            }

            // Explicit umkm_id filter from request (for drilling down)
            if ($umkmId = $request->get('umkm_id')) {
                if ($umkmId !== 'undefined' && $umkmId !== 'null' && $umkmId !== '') {
                    $query->where('umkm_id', $umkmId);
                }
            }

            // Status filter
            if ($status = $request->get('status')) {
                if ($status !== 'all' && $status !== 'undefined') {
                    $query->where('status', $status);
                }
            }

            $sortBy  = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);
            return $this->ok($query->paginate($perPage));
        } catch (Throwable $e) {
            Log::error('Project index error', ['message' => $e->getMessage()]);
            return $this->error('Failed to fetch projects', 500);
        }
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'umkm_id'                 => ['nullable', 'exists:umkms,id'],
            'assessment_result_id'    => ['nullable', 'exists:assessment_results,id'],
            'consultation_request_id' => ['nullable', 'exists:consultation_requests,id'],
            'name'       => ['required', 'string', 'max:255'],
            'type'       => ['required', 'in:advisory,training,pbl'],
            'status'     => ['required', 'in:draft,active,completed,cancelled'],
            'started_at' => ['nullable', 'date'],
            'ended_at'   => ['nullable', 'date'],
        ]);

        // Determine target UMKM ID
        $umkmId = $validated['umkm_id'] ?? $user->umkm?->id;

        // Validation for different roles
        if ($user->hasRole('umkm')) {
            // UMKM can only create project for themselves
            $umkmId = $user->umkm->id;
        } elseif ($user->hasAnyRole(['super_admin', 'admin', 'upt', 'advisor'])) {
            // Staff/Admin must provide umkm_id
            abort_unless($umkmId, 422, 'Target UMKM ID is required for administrative project creation.');
            
            // For UPT/Advisor, maybe check if they belong to the same institution?
            // For now, allow if they have the role, matching the index() behavior.
        } else {
            abort(403, 'Anda tidak memiliki otoritas untuk membuat proyek.');
        }

        abort_unless($umkmId, 403, 'User ini tidak terhubung dengan UMKM manapun.');

        // Jika proyek terkait pendampingan, pastikan advisor sudah ditunjuk
        if (!empty($validated['consultation_request_id'])) {
            $consultation = \App\Models\Mentoring\ConsultationRequest::find($validated['consultation_request_id']);
            abort_unless(
                $consultation && $consultation->assignments()->exists(),
                403,
                'Proyek hanya bisa dibuat jika advisor sudah ditetapkan pada pendampingan ini.'
            );
        }

        try {
            // Remove umkm_id from validated to avoid mass assignment if it's not in fillable, 
            // but we need it for creation.
            $projectData = $validated;
            $projectData['umkm_id'] = $umkmId;
            
            $project = Project::create($projectData);

            return response()->json([
                'message' => 'Project created successfully',
                'data'    => $project,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create project'], 500);
        }
    }

    public function show(Project $project, Request $request)
    {
        $this->authorizeProject($project, $request);

        try {
            return response()->json([
                'data' => $project->load([
                    'umkm',
                    'assessmentResult',
                    'iterations.actionPlans.pic',
                    'iterations.actionPlans.deliverables.completedBy',
                    'iterations.deliverables',
                    'notes.user',
                ]),
            ]);
        } catch (Throwable $e) {
            Log::error('Project show error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch project'], 500);
        }
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProject($project, $request);

        $validated = $request->validate([
            'name'       => ['sometimes', 'required', 'string', 'max:255'],
            'type'       => ['sometimes', 'required', 'in:advisory,training,pbl'],
            'status'     => ['sometimes', 'required', 'in:draft,active,completed,cancelled'],
            'started_at' => ['nullable', 'date'],
            'ended_at'   => ['nullable', 'date'],
        ]);

        try {
            $project->update($validated);
            return response()->json(['message' => 'Project updated successfully', 'data' => $project]);
        } catch (Throwable $e) {
            Log::error('Project update error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update project'], 500);
        }
    }

    public function destroy(Project $project, Request $request)
    {
        $this->authorizeProject($project, $request);

        try {
            $project->delete();
            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Project delete error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete project'], 500);
        }
    }

    public function storeIteration(Request $request, Project $project)
    {
        $this->authorizeProject($project, $request);

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'order'      => ['required', 'integer'],
            'status'     => ['required', 'in:planned,ongoing,done'],
            'started_at' => ['nullable', 'date'],
            'ended_at'   => ['nullable', 'date'],
        ]);

        try {
            $iteration = $project->iterations()->create($validated);
            return response()->json(['message' => 'Iteration created successfully', 'data' => $iteration], 201);
        } catch (Throwable $e) {
            Log::error('Project iteration store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create iteration'], 500);
        }
    }

    public function updateIteration(Request $request, Iteration $iteration)
    {
        $this->authorizeIteration($iteration, $request);

        $validated = $request->validate([
            'name'       => ['sometimes', 'required', 'string', 'max:255'],
            'order'      => ['sometimes', 'required', 'integer'],
            'status'     => ['sometimes', 'required', 'in:planned,ongoing,done'],
            'started_at' => ['nullable', 'date'],
            'ended_at'   => ['nullable', 'date'],
        ]);

        try {
            $iteration->update($validated);
            return response()->json(['message' => 'Iteration updated successfully', 'data' => $iteration]);
        } catch (Throwable $e) {
            Log::error('Project iteration update error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update iteration'], 500);
        }
    }

    public function destroyIteration(Iteration $iteration, Request $request)
    {
        $this->authorizeIteration($iteration, $request);

        try {
            $iteration->delete();
            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Project iteration delete error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to delete iteration'], 500);
        }
    }

    public function storeActionPlan(Request $request, Iteration $iteration)
    {
        $this->authorizeIteration($iteration, $request);

        Log::info('ProjectController@storeActionPlan HIT', [
            'iteration_id' => $iteration->id,
            'data'         => $request->all(),
        ]);

        try {
            $validated = $request->validate([
                'title'       => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'pic_user_id' => ['nullable', 'exists:users,id'],
                'due_date'    => ['nullable', 'date'],
                'status'      => ['required', 'in:todo,in_progress,done'],
            ]);
        } catch (ValidationException $e) {
            Log::error('ProjectController@storeActionPlan Validation Error', ['errors' => $e->errors()]);
            throw $e;
        }

        try {
            if (empty($validated['due_date'])) $validated['due_date'] = null;
            if (empty($validated['pic_user_id'])) $validated['pic_user_id'] = null;

            $actionPlan = $iteration->actionPlans()->create($validated);
            return response()->json(['message' => 'Action plan created successfully', 'data' => $actionPlan], 201);
        } catch (Throwable $e) {
            Log::error('Project action plan store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to create action plan'], 500);
        }
    }

    public function updateActionPlan(Request $request, ActionPlan $actionPlan)
    {
        $this->authorizeActionPlan($actionPlan, $request);

        $validated = $request->validate([
            'title'       => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pic_user_id' => ['nullable', 'exists:users,id'],
            'due_date'    => ['nullable', 'date'],
            'status'      => ['sometimes', 'required', 'in:todo,in_progress,done'],
        ]);

        try {
            $actionPlan->update($validated);
            return response()->json(['message' => 'Action plan updated successfully', 'data' => $actionPlan]);
        } catch (Throwable $e) {
            Log::error('Project action plan update error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update action plan'], 500);
        }
    }

    public function storeNote(Request $request, Project $project)
    {
        $this->authorizeProject($project, $request);

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        try {
            $note = $project->notes()->create([
                'user_id' => $request->user()->id,
                'content' => $validated['content'],
            ]);
            return response()->json(['message' => 'Note added successfully', 'data' => $note->load('user')], 201);
        } catch (Throwable $e) {
            Log::error('Project note store error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to add note'], 500);
        }
    }

    public function storeDeliverable(Request $request, ActionPlan $actionPlan)
    {
        $this->authorizeActionPlan($actionPlan, $request);

        $urlInput = $request->input('url');
        if (empty($urlInput) || $urlInput === 'null' || $urlInput === 'undefined') {
            $urlInput = null;
        }
        $request->merge(['url' => $urlInput]);

        // [FIX RCE] Whitelist ekstensi yang diizinkan; simpan ke disk 'local' (private)
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file'        => [
                'nullable',
                'file',
                'max:10240', // 10 MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,webp,zip,rar,7z',
            ],
            'url' => ['nullable', 'url', 'max:500'],
        ]);

        try {
            $desc = $validated['description'] ?? null;
            if ($desc === 'null' || $desc === 'undefined') $desc = null;

            $data = [
                'action_plan_id' => $actionPlan->id,
                'title'          => $validated['title'],
                'description'    => $desc,
                'url'            => $validated['url'] ?? null,
                // [FIX AUDIT TRAIL]
                'completed_by'   => $request->user()->id,
                'completed_at'   => now(),
            ];

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                // Simpan ke disk 'local' (tidak bisa diakses langsung via URL publik)
                $path = $file->store('deliverables', 'local');
                $data['file_path'] = $path;
                $data['file_disk'] = 'local';
                $data['file_mime'] = $file->getMimeType();
                $data['file_size'] = $file->getSize();
            }

            $deliverable = Deliverable::create($data);

            // Update action plan status
            if ($actionPlan->status === 'todo') {
                $actionPlan->update(['status' => 'done']);
            }

            return response()->json([
                'message' => 'Deliverable submitted successfully',
                'data'    => $deliverable,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project deliverable store error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to submit deliverable'], 500);
        }
    }
}
