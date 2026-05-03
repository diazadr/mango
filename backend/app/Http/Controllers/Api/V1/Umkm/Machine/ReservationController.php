<?php

namespace App\Http\Controllers\Api\V1\Umkm\Machine;

use App\Http\Controllers\Controller;
use App\Http\Requests\Umkm\Machine\ApproveReservationRequest;
use App\Http\Requests\Umkm\Machine\StoreReservationRequest;
use App\Models\Machine\MachineReservation;
use App\Services\Umkm\Machine\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $service
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $reservations = $this->service->getReservations($request->all());
            return response()->json($reservations);
        } catch (Throwable $e) {
            Log::error('Machine reservation index error', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['message' => 'Failed to fetch reservations'], 500);
        }
    }

    public function show(MachineReservation $reservation): JsonResponse
    {
        try {
            return response()->json([
                'data' => $reservation->load([
                    'machine',
                    'requesterUmkm',
                    'requesterUser',
                    'approvals',
                ]),
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation show error', ['message' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to fetch reservation'], 500);
        }
    }

    public function incoming(Request $request): JsonResponse
    {
        try {
            $reservations = $this->service->getIncomingReservations($request->all(), $request->user());

            return response()->json($reservations);
        } catch (Throwable $e) {
            Log::error('Machine reservation incoming error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to fetch incoming reservations',
            ], 500);
        }
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        try {
            $reservation = $this->service->storeReservation($request->user(), $request->validated());

            return response()->json([
                'message' => 'Reservation request submitted successfully',
                'data' => $reservation,
            ], 201);
        } catch (Throwable $e) {
            Log::error('Machine reservation store error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $status = $e->getCode() ?: 500;
            if ($status < 400 || $status > 599) {
                $status = 500;
            }

            return response()->json([
                'message' => $e->getMessage() ?: 'Failed to create reservation',
            ], $status);
        }
    }

    public function approve(
        ApproveReservationRequest $request,
        MachineReservation $reservation
    ): JsonResponse {
        try {
            $updated = $this->service->processApproval($reservation, $request->user(), $request->validated());

            return response()->json([
                'message' => 'Reservation processed successfully',
                'data' => $updated,
            ]);
        } catch (Throwable $e) {
            Log::error('Machine reservation approve error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update reservation',
            ], 500);
        }
    }
}
