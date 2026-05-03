<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\Master\OrganizationResource;
use App\Models\Master\Institution;
use App\Models\Master\Organization;
use App\Services\Admin\Master\OrganizationService;
use Illuminate\Http\Request;
use Throwable;

class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $isInstitutions = $request->is('*institutions*');
            $user = $request->user();

            $data = $isInstitutions 
                ? $user->institutions()->get()
                : $user->organizations()->get();

            return OrganizationResource::collection($data);

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to fetch data',
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $isInstitutions = $request->is('*institutions*');
        $model = $isInstitutions ? \App\Models\Master\Institution::class : Organization::class;
        $record = $model::findOrFail($id);

        $relation = $isInstitutions ? 'institutions' : 'organizations';

        if (!$request->user()->$relation()->where($isInstitutions ? 'institutions.id' : 'organizations.id', $id)->exists() && !$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return new OrganizationResource($record->load($isInstitutions ? 'departments' : []));
    }

    public function update(Request $request, $id, OrganizationService $service)
    {
        $isInstitutions = $request->is('*institutions*');
        $model = $isInstitutions ? \App\Models\Master\Institution::class : Organization::class;
        $record = $model::findOrFail($id);

        $relation = $isInstitutions ? 'institutions' : 'organizations';

        if (!$request->user()->$relation()->where($isInstitutions ? 'institutions.id' : 'organizations.id', $id)->exists() && !$request->user()->hasRole('super_admin')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $record->update($request->except('logo'));

            if ($request->hasFile('logo')) {
                $record->addMediaFromRequest('logo')->toMediaCollection('logos');
            }

            return new OrganizationResource($record->fresh());

        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Failed to update',
            ], 500);
        }
    }
}
