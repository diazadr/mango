<?php

namespace App\Http\Controllers\Api\V1\Umkm\Project;

use App\Http\Controllers\Controller;
use App\Models\Project\ActionPlan;
use App\Models\Project\Deliverable;
use App\Models\Project\Iteration;
use App\Models\Project\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProjectController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Project::query()
                ->with([
                    'umkm',
                    'assessmentResult',
                ]);

            if ($umkmId = $request->get('umkm_id')) {
                $query->where('umkm_id', $umkmId);
            }

            if ($status = $request->get('status')) {
                $query->where('status', $status);
            }

            $sortBy = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');

            $query->orderBy($sortBy, $sortDir);

            $perPage = min((int) $request->get('per_page', 15), 100);

            return response()->json(
                $query->paginate($perPage)
            );
        } catch (Throwable $e) {
            Log::error('Project index error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch projects',
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'umkm_id' => ['required', 'exists:umkms,id'],
            'assessment_result_id' => [
                'nullable',
                'exists:assessment_results,id',
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:advisory,pbl'],
            'status' => [
                'required',
                'in:draft,active,completed,cancelled',
            ],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
        ]);

        try {
            $project = Project::create($validated);

            return response()->json([
                'message' => 'Project created successfully',
                'data' => $project,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create project',
            ], 500);
        }
    }

    public function show(Project $project)
    {
        try {
            return response()->json([
                'data' => $project->load([
                    'umkm',
                    'assessmentResult',
                    'iterations.actionPlans.pic',
                    'iterations.actionPlans.deliverables',
                    'iterations.deliverables',
                    'notes.user',
                ]),
            ]);
        } catch (Throwable $e) {
            Log::error('Project show error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch project',
            ], 500);
        }
    }

    public function update(
        Request $request,
        Project $project
    ) {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', 'in:advisory,pbl'],
            'status' => [
                'sometimes',
                'required',
                'in:draft,active,completed,cancelled',
            ],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
        ]);

        try {
            $project->update($validated);

            return response()->json([
                'message' => 'Project updated successfully',
                'data' => $project,
            ]);
        } catch (Throwable $e) {
            Log::error('Project update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update project',
            ], 500);
        }
    }

    public function destroy(Project $project)
    {
        try {
            $project->delete();

            return response()->noContent();
        } catch (Throwable $e) {
            Log::error('Project delete error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to delete project',
            ], 500);
        }
    }

    public function storeIteration(
        Request $request,
        Project $project
    ) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'order' => ['required', 'integer'],
            'status' => ['required', 'in:planned,ongoing,done'],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
        ]);

        try {
            $iteration = $project->iterations()
                ->create($validated);

            return response()->json([
                'message' => 'Iteration created successfully',
                'data' => $iteration,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project iteration store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create iteration',
            ], 500);
        }
    }

    public function updateIteration(
        Request $request,
        Iteration $iteration
    ) {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'order' => ['sometimes', 'required', 'integer'],
            'status' => [
                'sometimes',
                'required',
                'in:planned,ongoing,done',
            ],
            'started_at' => ['nullable', 'date'],
            'ended_at' => ['nullable', 'date'],
        ]);

        try {
            $iteration->update($validated);

            return response()->json([
                'message' => 'Iteration updated successfully',
                'data' => $iteration,
            ]);
        } catch (Throwable $e) {
            Log::error('Project iteration update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update iteration',
            ], 500);
        }
    }

    public function storeActionPlan(
        Request $request,
        Iteration $iteration
    ) {
        Log::info('ProjectController@storeActionPlan HIT', [
            'iteration_id' => $iteration->id,
            'data' => $request->all(),
        ]);

        try {
            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'pic_user_id' => ['nullable', 'exists:users,id'],
                'due_date' => ['nullable', 'date'],
                'status' => [
                    'required',
                    'in:todo,in_progress,done',
                ],
            ]);
        } catch (ValidationException $e) {
            Log::error('ProjectController@storeActionPlan Validation Error', [
                'errors' => $e->errors(),
            ]);
            throw $e;
        }

        try {
            // Handle empty strings for nullable date/pic
            if (empty($validated['due_date'])) {
                $validated['due_date'] = null;
            }
            if (empty($validated['pic_user_id'])) {
                $validated['pic_user_id'] = null;
            }

            $actionPlan = $iteration->actionPlans()
                ->create($validated);

            return response()->json([
                'message' => 'Action plan created successfully',
                'data' => $actionPlan,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project action plan store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create action plan',
            ], 500);
        }
    }

    public function updateActionPlan(
        Request $request,
        ActionPlan $actionPlan
    ) {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pic_user_id' => ['nullable', 'exists:users,id'],
            'due_date' => ['nullable', 'date'],
            'status' => [
                'sometimes',
                'required',
                'in:todo,in_progress,done',
            ],
        ]);

        try {
            $actionPlan->update($validated);

            return response()->json([
                'message' => 'Action plan updated successfully',
                'data' => $actionPlan,
            ]);
        } catch (Throwable $e) {
            Log::error('Project action plan update error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update action plan',
            ], 500);
        }
    }

    public function storeNote(
        Request $request,
        Project $project
    ) {
        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        try {
            $note = $project->notes()->create([
                'user_id' => $request->user()->id,
                'content' => $validated['content'],
            ]);

            return response()->json([
                'message' => 'Note added successfully',
                'data' => $note->load('user'),
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project note store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to add note',
            ], 500);
        }
    }

    public function storeDeliverable(
        Request $request,
        ActionPlan $actionPlan
    ) {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'file' => ['nullable', 'file', 'max:10240'], // 10MB
            'url' => ['nullable', 'url', 'max:500'],
        ]);

        try {
            $data = [
                'action_plan_id' => $actionPlan->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'url' => $validated['url'] ?? null,
            ];

            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('deliverables', 'public');
                $data['file_path'] = $path;
            }

            $deliverable = Deliverable::create($data);

            // Update action plan status if it was todo
            if ($actionPlan->status === 'todo') {
                $actionPlan->update(['status' => 'done']);
            }

            return response()->json([
                'message' => 'Deliverable submitted successfully',
                'data' => $deliverable,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Project deliverable store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to submit deliverable',
            ], 500);
        }
    }
}
