<?php

use App\Http\Controllers\Api\V1\Admin\Content\ArticleController as AdminArticleController;
use App\Http\Controllers\Api\V1\Admin\Master\DepartmentController as AdminDepartmentController;
use App\Http\Controllers\Api\V1\Admin\Master\InstitutionController as AdminInstitutionController;
use App\Http\Controllers\Api\V1\Admin\Master\InstitutionMemberController as AdminInstitutionMemberController;
use App\Http\Controllers\Api\V1\Admin\Master\OrganizationController as AdminOrganizationController;
use App\Http\Controllers\Api\V1\Admin\Master\OrganizationMemberController as AdminOrganizationMemberController;
use App\Http\Controllers\Api\V1\Admin\Master\OverviewController as AdminOverviewController;
use App\Http\Controllers\Api\V1\Admin\Master\UmkmController as AdminUmkmController;
use App\Http\Controllers\Api\V1\Admin\RBAC\PermissionController;
use App\Http\Controllers\Api\V1\Admin\RBAC\RoleController;
use App\Http\Controllers\Api\V1\Admin\RBAC\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Admin\RBAC\UserRoleController;
use App\Http\Controllers\Api\V1\Advisor\MentoringController;
use App\Http\Controllers\Api\V1\Auth\AccountSecurityController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\NotificationController;
use App\Http\Controllers\Api\V1\Auth\OrganizationController as MyOrganizationController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;
use App\Http\Controllers\Api\V1\ErpMes\DowntimeController;
use App\Http\Controllers\Api\V1\ErpMes\ManufacturingController;
use App\Http\Controllers\Api\V1\ErpMes\MaterialController;
use App\Http\Controllers\Api\V1\ErpMes\ProductController as ErpProductController;
use App\Http\Controllers\Api\V1\ErpMes\WorkOrderOperationController;
use App\Http\Controllers\Api\V1\Integration\EdgeIntegrationController;
use App\Http\Controllers\Api\V1\Integration\EdgeSiteController;
use App\Http\Controllers\Api\V1\Payment\PayoutController;
use App\Http\Controllers\Api\V1\Payment\XenditWebhookController;
use App\Http\Controllers\Api\V1\Public\ArticleController as PublicArticleController;
use App\Http\Controllers\Api\V1\Public\ProductController as PublicProductController;
use App\Http\Controllers\Api\V1\Public\UmkmController as PublicUmkmController;
use App\Http\Controllers\Api\V1\Umkm\Machine\MachineController;
use App\Http\Controllers\Api\V1\Umkm\Machine\ReservationController;
use App\Http\Controllers\Api\V1\Umkm\Operation\ProductController;
use App\Http\Controllers\Api\V1\Umkm\Project\ProjectController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\AssessmentController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\BusinessProfileController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\RecommendationController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\TechnicalProfileController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\UmkmCertificationController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\UmkmController;
use App\Http\Controllers\Api\V1\Umkm\Strategy\UmkmExportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ── Public (no auth) ──────────────────────────────────────────────────────

    Route::get('organizations', [AdminOrganizationController::class, 'index']);
    Route::get('institutions', [AdminInstitutionController::class, 'index']);

    Route::get('edge-sites/status', [EdgeSiteController::class, 'index']);

    Route::get('verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify.custom');

    Route::prefix('public')->group(function () {
        Route::prefix('articles')->group(function () {
            Route::get('/', [PublicArticleController::class, 'index']);
            Route::get('{slug}', [PublicArticleController::class, 'show']);
        });

        Route::prefix('umkms')->group(function () {
            Route::get('/', [PublicUmkmController::class, 'index']);
            Route::get('{identifier}', [PublicUmkmController::class, 'show']);
        });

        Route::prefix('products')->group(function () {
            Route::get('/', [PublicProductController::class, 'index']);
            Route::get('{identifier}', [PublicProductController::class, 'show']);
        });
    });

    // ── Payment Webhooks ──────────────────────────────────────────────────────
    Route::post('webhooks/xendit', [XenditWebhookController::class, 'handle']);

    // ── Edge Integration (API Key) ────────────────────────────────────────────

    Route::prefix('integrations/edge')
        ->middleware('edge.apikey')
        ->group(function () {
            Route::get('status', [EdgeIntegrationController::class, 'status']);
            Route::post('production-data', [EdgeIntegrationController::class, 'storeProductionData']);
            Route::post('alarms', [EdgeIntegrationController::class, 'storeAlarm']);
            Route::get('work-orders', [EdgeIntegrationController::class, 'workOrders']);
            Route::get('master-data', [EdgeIntegrationController::class, 'masterData']);
        });

    // ── Authenticated ─────────────────────────────────────────────────────────

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('me', [AuthController::class, 'me']);

        // ── Payout / Disbursement ──────────────────────────────────────────────
        
        Route::prefix('payment')->group(function () {
            Route::get('balance', [PayoutController::class, 'balance']);
            Route::get('banks', [PayoutController::class, 'banks']);
            Route::post('payout', [PayoutController::class, 'requestPayout']);
        });

        // ── Profile & Account Security ────────────────────────────────────────

        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::match(['post', 'put'], '/', [ProfileController::class, 'update']);
            Route::put('password', [ProfileController::class, 'updatePassword']);
            Route::post('resend-verification', [ProfileController::class, 'resendVerification']);
            Route::get('activity-log', [AccountSecurityController::class, 'getActivityLog']);
            Route::get('sessions', [AccountSecurityController::class, 'getSessions']);
            Route::delete('sessions/{sessionId}', [AccountSecurityController::class, 'logoutSession']);
            Route::post('logout-other-sessions', [AccountSecurityController::class, 'logoutOtherSessions']);
            Route::post('delete-account', [AccountSecurityController::class, 'deleteAccount']);
            Route::get('notifications', [AccountSecurityController::class, 'getNotificationSettings']);
            Route::put('notifications', [AccountSecurityController::class, 'updateNotificationSettings']);
        });

        // ── Notifications ─────────────────────────────────────────────────────

        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('read-all', [NotificationController::class, 'markAllAsRead']);
            Route::post('{id}/read', [NotificationController::class, 'markAsRead']);
        });

        // ── Edge Sites ────────────────────────────────────────────────────────

        Route::prefix('edge-sites')->group(function () {
            Route::get('/', [EdgeSiteController::class, 'index']);
            Route::post('/', [EdgeSiteController::class, 'store']);
            Route::get('{edgeSite}', [EdgeSiteController::class, 'show']);
            Route::put('{edgeSite}', [EdgeSiteController::class, 'update']);
            Route::delete('{edgeSite}', [EdgeSiteController::class, 'destroy']);
            Route::post('{edgeSite}/rotate-key', [EdgeSiteController::class, 'rotateKey']);
        });

        // ── My Organizations & Institutions ───────────────────────────────────

        Route::prefix('my')->group(function () {
            Route::prefix('institutions')->group(function () {
                Route::get('/', [MyOrganizationController::class, 'index']);
                Route::get('{organization}', [MyOrganizationController::class, 'show']);
                Route::put('{organization}', [MyOrganizationController::class, 'update']);
            });

            Route::prefix('organizations')->group(function () {
                Route::get('/', [MyOrganizationController::class, 'index']);
                Route::get('{organization}', [MyOrganizationController::class, 'show']);
                Route::put('{organization}', [MyOrganizationController::class, 'update']);
            });
        });

        // ── UMKM ──────────────────────────────────────────────────────────────

        Route::apiResource('umkm', UmkmController::class);

        Route::prefix('umkm/{umkm}')->group(function () {
            Route::get('progress-history', [UmkmController::class, 'progressHistory']);
            Route::get('export-resume', [UmkmExportController::class, 'exportResume']);

            Route::prefix('profile')->group(function () {
                Route::get('/', [BusinessProfileController::class, 'show']);
                Route::post('/', [BusinessProfileController::class, 'store']);
            });

            Route::prefix('certifications')->group(function () {
                Route::post('/', [UmkmCertificationController::class, 'store']);
                Route::delete('{certification}', [UmkmCertificationController::class, 'destroy']);
            });

            Route::prefix('production-capacities')->group(function () {
                Route::get('/', [TechnicalProfileController::class, 'getProductionCapacities']);
                Route::post('/', [TechnicalProfileController::class, 'storeProductionCapacity']);
            });

            Route::prefix('machine-manuals')->group(function () {
                Route::get('/', [TechnicalProfileController::class, 'getMachineManuals']);
                Route::post('/', [TechnicalProfileController::class, 'storeMachineManual']);
            });

            Route::prefix('products')->group(function () {
                Route::get('/', [ProductController::class, 'index']);
                Route::post('/', [ProductController::class, 'store']);
            });
        });

        // ── Production Capacities ─────────────────────────────────────────────

        Route::prefix('production-capacities')->group(function () {
            Route::get('/', [TechnicalProfileController::class, 'index']);
            Route::post('/', [TechnicalProfileController::class, 'store']);
            Route::put('{capacity}', [TechnicalProfileController::class, 'updateProductionCapacity']);
            Route::delete('{capacity}', [TechnicalProfileController::class, 'destroyProductionCapacity']);
        });

        // ── Machine Manuals ───────────────────────────────────────────────────

        Route::prefix('machine-manuals')->group(function () {
            Route::get('/', [TechnicalProfileController::class, 'indexMachineManuals']);
            Route::post('/', [TechnicalProfileController::class, 'storeMachineManualGlobal']);
            Route::put('{machine}', [TechnicalProfileController::class, 'updateMachineManual']);
            Route::delete('{machine}', [TechnicalProfileController::class, 'destroyMachineManual']);
        });

        // ── Products ──────────────────────────────────────────────────────────

        Route::prefix('products')->group(function () {
            Route::get('/', [ProductController::class, 'indexGlobal']);
            Route::post('/', [ProductController::class, 'storeGlobal']);
            Route::put('{product}', [ProductController::class, 'update']);
            Route::delete('{product}', [ProductController::class, 'destroy']);
        });

        // ── Assessments ───────────────────────────────────────────────────────

        Route::prefix('assessments')->group(function () {
            Route::get('questions', [AssessmentController::class, 'questions']);
            Route::get('/', [AssessmentController::class, 'index']);
            Route::post('/', [AssessmentController::class, 'store']);
            Route::get('{assessment}', [AssessmentController::class, 'show']);
            Route::get('{assessment}/pdf', [AssessmentController::class, 'downloadPdf']);
            Route::post('{assessment}/answers', [AssessmentController::class, 'submitAnswers']);
            Route::post('{assessment}/calculate', [AssessmentController::class, 'calculateScore']);
            Route::get('{assessment}/recommendations', [RecommendationController::class, 'index']);
        });

        // ── Projects ──────────────────────────────────────────────────────────

        Route::prefix('projects')->group(function () {
            Route::get('/', [ProjectController::class, 'index']);
            Route::post('/', [ProjectController::class, 'store']);
            Route::get('{project}', [ProjectController::class, 'show']);
            Route::put('{project}', [ProjectController::class, 'update']);
            Route::delete('{project}', [ProjectController::class, 'destroy']);
            Route::post('{project}/iterations', [ProjectController::class, 'storeIteration']);
            Route::post('{project}/notes', [ProjectController::class, 'storeNote']);
        });

        Route::prefix('iterations')->group(function () {
            Route::put('{iteration}', [ProjectController::class, 'updateIteration']);
            Route::delete('{iteration}', [ProjectController::class, 'destroyIteration']);
            Route::post('{iteration}/action-plans', [ProjectController::class, 'storeActionPlan']);
        });

        Route::prefix('action-plans')->group(function () {
            Route::put('{actionPlan}', [ProjectController::class, 'updateActionPlan']);
            Route::post('{actionPlan}/deliverables', [ProjectController::class, 'storeDeliverable']);
        });

        // ── ERP / MES ─────────────────────────────────────────────────────────

        Route::prefix('erp-mes')->group(function () {
            Route::get('summary', [ManufacturingController::class, 'summary']);
            Route::get('edge-production-logs', [ManufacturingController::class, 'listEdgeProductionLogs']);
            Route::get('edge-alarm-logs', [ManufacturingController::class, 'listEdgeAlarmLogs']);
            Route::get('schedule', [ManufacturingController::class, 'schedule']);

            // Work Orders
            Route::prefix('work-orders')->group(function () {
                Route::get('/', [ManufacturingController::class, 'listWorkOrders']);
                Route::post('/', [ManufacturingController::class, 'storeWorkOrder']);
                Route::get('{workOrder}', [ManufacturingController::class, 'showWorkOrder']);
                Route::put('{workOrder}', [ManufacturingController::class, 'updateWorkOrder']);

                // WO Operations
                Route::get('{workOrder}/operations', [WorkOrderOperationController::class, 'index']);
                Route::post('{workOrder}/operations', [WorkOrderOperationController::class, 'store']);
                Route::put('{workOrder}/operations/{operation}', [WorkOrderOperationController::class, 'update']);
                Route::delete('{workOrder}/operations/{operation}', [WorkOrderOperationController::class, 'destroy']);
            });

            // Production Records
            Route::prefix('production-records')->group(function () {
                Route::get('/', [ManufacturingController::class, 'listProductionRecords']);
                Route::post('/', [ManufacturingController::class, 'storeProductionRecord']);
                Route::delete('{record}', [ManufacturingController::class, 'destroyProductionRecord']);
            });

            // Alarm Events
            Route::prefix('alarm-events')->group(function () {
                Route::get('/', [ManufacturingController::class, 'listAlarmEvents']);
                Route::post('{alarm}/resolve', [ManufacturingController::class, 'resolveAlarm']);
            });

            // OEE
            Route::prefix('oee')->group(function () {
                Route::get('/', [ManufacturingController::class, 'oee']);
                Route::get('history', [ManufacturingController::class, 'oeeHistory']);
            });

            // Downtime
            Route::prefix('downtime')->group(function () {
                Route::get('/', [DowntimeController::class, 'index']);
                Route::get('summary', [DowntimeController::class, 'summary']);
                Route::post('/', [DowntimeController::class, 'store']);
                Route::patch('{downtime}/stop', [DowntimeController::class, 'stop']);
                Route::delete('{downtime}', [DowntimeController::class, 'destroy']);
            });

            // ERP Products & BOM
            Route::prefix('products')->group(function () {
                Route::get('/', [ErpProductController::class, 'index']);
                Route::post('/', [ErpProductController::class, 'store']);
                Route::put('{product}', [ErpProductController::class, 'update']);
                Route::delete('{product}', [ErpProductController::class, 'destroy']);
                Route::post('{product}/bom', [ErpProductController::class, 'updateBom']);
            });

            // Materials / Inventory
            Route::prefix('materials')->group(function () {
                Route::get('/', [MaterialController::class, 'index']);
                Route::post('/', [MaterialController::class, 'store']);
                Route::put('{material}', [MaterialController::class, 'update']);
                Route::delete('{material}', [MaterialController::class, 'destroy']);
                Route::post('{material}/movement', [MaterialController::class, 'movement']);
                Route::get('{material}/movements', [MaterialController::class, 'movements']);
            });
        });

        // ── Machines & Reservations ───────────────────────────────────────────

        Route::prefix('machines')->group(function () {
            Route::get('/', [MachineController::class, 'index']);
            Route::post('/', [MachineController::class, 'store']);

            Route::prefix('reservations')->group(function () {
                Route::get('all', [ReservationController::class, 'index']);         // Active only (excl. completed)
                Route::get('history', [ReservationController::class, 'history']);   // All statuses incl. completed
                Route::get('incoming', [ReservationController::class, 'incoming']);
                Route::post('/', [ReservationController::class, 'store']);
                Route::get('{reservation}', [ReservationController::class, 'show']);
                Route::get('{reservation}/pdf', [ReservationController::class, 'downloadPdf']);
                Route::post('{reservation}/approve', [ReservationController::class, 'approve']);
                Route::post('{reservation}/create-payment', [ReservationController::class, 'createPayment']);
                Route::post('{reservation}/payment', [ReservationController::class, 'submitPayment']);
                Route::post('{reservation}/confirm-payment', [ReservationController::class, 'confirmPayment']);
                
                // Negotiation & Cancellation
                Route::post('{reservation}/negotiate', [ReservationController::class, 'proposePrice']);
                Route::post('{reservation}/negotiate/{negotiation_id}/respond', [ReservationController::class, 'respondNegotiation']);
                Route::post('{reservation}/cancel', [ReservationController::class, 'requestCancellation']);
                Route::post('{reservation}/cancel/{cancellation_id}/respond', [ReservationController::class, 'respondCancellation']);
            });

            Route::get('{machine}', [MachineController::class, 'show']);
            Route::put('{machine}', [MachineController::class, 'update']);
            Route::delete('{machine}', [MachineController::class, 'destroy']);
            Route::get('{machine}/schedule', [MachineController::class, 'schedule']);
        });

        // ── Mentoring ─────────────────────────────────────────────────────────

        Route::prefix('mentoring')->group(function () {
            Route::get('departments', [MentoringController::class, 'departments']);
            Route::get('assessment-categories', [MentoringController::class, 'assessmentCategories']);

            Route::prefix('requests')->group(function () {
                Route::get('/', [MentoringController::class, 'requests']);
                Route::post('/', [MentoringController::class, 'createRequest']);
                Route::get('{consultation}', [MentoringController::class, 'show']);
                Route::post('{consultation}/assign-department', [MentoringController::class, 'assignDepartment']);
                Route::post('{consultation}/assign', [MentoringController::class, 'assignMentor']);
                Route::post('{consultation}/sessions', [MentoringController::class, 'createSession']);
                Route::post('{consultation}/complete', [MentoringController::class, 'complete']);
                Route::get('{consultation}/impact-summary', [MentoringController::class, 'impactSummary']);
            });

            Route::post('sessions/{session}/notes', [MentoringController::class, 'addNote']);
        });

        // ── Admin ─────────────────────────────────────────────────────────────

        Route::prefix('admin')
            ->middleware('permission:access admin panel')
            ->group(function () {

                Route::get('overview', [AdminOverviewController::class, 'index']);
                Route::get('edge/status', [AdminOverviewController::class, 'edgeStatus']);

                Route::apiResource('institutions', AdminInstitutionController::class)
                    ->middleware('permission:manage organizations');

                Route::apiResource('organizations', AdminOrganizationController::class)
                    ->middleware('permission:manage organizations');

                Route::get('organizations/{organization}/umkm', [AdminOrganizationController::class, 'umkmList'])
                    ->middleware('permission:manage organizations');

                Route::apiResource('departments', AdminDepartmentController::class)
                    ->middleware('permission:manage departments');

                Route::apiResource('users', AdminUserController::class)
                    ->middleware('permission:manage users');

                Route::apiResource('roles', RoleController::class)
                    ->middleware('permission:manage roles');

                Route::apiResource('permissions', PermissionController::class)
                    ->middleware('permission:manage permissions');

                // UMKM Moderation
                Route::prefix('umkm')
                    ->group(function () {
                        Route::get('/', [AdminUmkmController::class, 'index'])
                            ->middleware('permission:view umkm');
                        Route::post('{umkm}/approve', [AdminUmkmController::class, 'approve'])
                            ->middleware('permission:manage umkm');
                        Route::post('{umkm}/reject', [AdminUmkmController::class, 'reject'])
                            ->middleware('permission:manage umkm');
                    });

                // Institution Members
                Route::prefix('institutions/{institution}/members')
                    ->middleware('permission:manage users')
                    ->group(function () {
                        Route::get('/', [AdminInstitutionMemberController::class, 'index']);
                        Route::put('{user}/status', [AdminInstitutionMemberController::class, 'updateStatus']);
                        Route::delete('{user}', [AdminInstitutionMemberController::class, 'remove']);
                    });

                // Organization Members
                Route::prefix('organizations/{organization}/members')
                    ->middleware('permission:manage users')
                    ->group(function () {
                        Route::get('/', [AdminOrganizationMemberController::class, 'index']);
                        Route::put('{user}/status', [AdminOrganizationMemberController::class, 'updateStatus']);
                        Route::delete('{user}', [AdminOrganizationMemberController::class, 'remove']);
                    });

                // User Roles & Permissions
                Route::prefix('user-roles')
                    ->middleware('permission:view user roles')
                    ->group(function () {
                        Route::get('/', [UserRoleController::class, 'index']);
                    });

                Route::prefix('users/{user}')->group(function () {
                    Route::get('roles', [UserRoleController::class, 'show'])
                        ->middleware('permission:view user roles');
                    Route::post('roles', [UserRoleController::class, 'assignRole'])
                        ->middleware('permission:assign roles');
                    Route::post('roles/add', [UserRoleController::class, 'addRole'])
                        ->middleware('permission:assign roles');
                    Route::post('roles/remove', [UserRoleController::class, 'removeRole'])
                        ->middleware('permission:assign roles');
                    Route::post('permissions', [UserRoleController::class, 'syncPermission'])
                        ->middleware('permission:assign permissions');
                });

                // Articles
                Route::prefix('articles')->group(function () {
                    Route::get('/', [AdminArticleController::class, 'adminIndex']);
                    Route::post('upload-image', [AdminArticleController::class, 'uploadImage']);
                    Route::post('/', [AdminArticleController::class, 'store']);
                    Route::put('{article}', [AdminArticleController::class, 'update']);
                    Route::delete('{article}', [AdminArticleController::class, 'destroy']);
                });
            });
    });
});