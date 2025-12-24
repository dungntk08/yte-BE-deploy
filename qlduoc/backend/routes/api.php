<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/setup', [\App\Http\Controllers\AccountSetupController::class, 'setup']);


Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    
    // Products
    Route::get('/products/export', [\App\Http\Controllers\ProductController::class, 'export']);
    Route::post('/products/import', [\App\Http\Controllers\ProductController::class, 'import']);
    Route::apiResource('products', \App\Http\Controllers\ProductController::class);

    // Inventory
    Route::post('/inventory/import', [\App\Http\Controllers\InventoryController::class, 'import']);
    Route::post('/inventory/opening-stock', [\App\Http\Controllers\InventoryController::class, 'importOpeningStock']);
    Route::post('/inventory/opening-stock/manual', [\App\Http\Controllers\InventoryController::class, 'createOpeningStockNote']);
    Route::post('/inventory/opening-stock/parse', [\App\Http\Controllers\InventoryController::class, 'parseOpeningStock']);
    Route::post('/inventory/opening-stock/parse', [\App\Http\Controllers\InventoryController::class, 'parseOpeningStock']);
    Route::get('/inventory/opening-stock/sample', [\App\Http\Controllers\InventoryController::class, 'downloadSampleOpeningStock']);
    
    // Import from Supplier
    Route::post('/inventory/import-supplier', [\App\Http\Controllers\InventoryController::class, 'createImportNote']);

    Route::post('/inventory/export', [\App\Http\Controllers\InventoryController::class, 'createExport']);
    Route::get('/inventory/export/preview', [\App\Http\Controllers\InventoryController::class, 'getExportPreview']);

    // Suppliers
    Route::apiResource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Sub-Accounts
    Route::apiResource('sub-accounts', \App\Http\Controllers\SubAccountController::class);

    // Warehouses
    Route::apiResource('warehouses', \App\Http\Controllers\WarehouseController::class);
    Route::get('/warehouses/{id}/users', [\App\Http\Controllers\WarehouseController::class, 'getUsers']);
    Route::post('/warehouses/{id}/users', [\App\Http\Controllers\WarehouseController::class, 'assignUser']);
    Route::delete('/warehouses/{id}/users/{userId}', [\App\Http\Controllers\WarehouseController::class, 'removeUser']);

    // Inventory Requests
    Route::apiResource('inventory-requests', \App\Http\Controllers\InventoryRequestController::class);
    Route::put('/inventory-requests/{id}/status', [\App\Http\Controllers\InventoryRequestController::class, 'updateStatus']);

    // Users
    Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);

    Route::get('/inventory/status', [\App\Http\Controllers\InventoryController::class, 'status']);
});
