<?php

namespace App\Services\Admin\Master;

use App\Models\Master\Department;

class DepartmentService
{
    public function getDepartments(array $filters)
    {
        $query = Department::query()->with('institution');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where('name', 'like', "%{$search}%");
        }

        if (isset($filters['institution_id']) || isset($filters['organization_id'])) {
            $institutionId = $filters['institution_id'] ?? $filters['organization_id'];
            $query->where('institution_id', $institutionId);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->paginate($perPage);
    }

    public function create(array $data)
    {
        return Department::create($data);
    }

    public function update(Department $department, array $data)
    {
        $department->update($data);

        return $department;
    }

    public function delete(Department $department)
    {
        return $department->delete();
    }
}
