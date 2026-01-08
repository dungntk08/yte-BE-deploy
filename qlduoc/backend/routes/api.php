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

// Admin Auth
Route::post('/admin/login', [\App\Http\Controllers\AdminAuthController::class, 'login']);
Route::post('/admin/setup', [\App\Http\Controllers\AdminAuthController::class, 'setup']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    
    // DashboardStats
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'getStats']);
    
    // Products
    // Products
    // Products
    Route::get('/products/sample', [\App\Http\Controllers\ProductController::class, 'downloadSample']);
    Route::get('/products/export', [\App\Http\Controllers\ProductController::class, 'export']);
    Route::get('/units', [App\Http\Controllers\UnitController::class, 'index']);
    Route::resource('products', App\Http\Controllers\ProductController::class);
    Route::post('/products/import', [\App\Http\Controllers\ProductController::class, 'import']);

    // Inventory
    Route::get('/inventory/products-all', [\App\Http\Controllers\InventoryController::class, 'getAllProductsForOpeningStock']);
    Route::get('/inventory/notes', [\App\Http\Controllers\InventoryController::class, 'getNotes']);
    Route::get('/inventory/notes/{id}', [\App\Http\Controllers\InventoryController::class, 'getNoteDetail']);
    Route::get('/inventory/batches', [\App\Http\Controllers\InventoryController::class, 'getBatches']);
    Route::get('/inventory/export/preview', [\App\Http\Controllers\InventoryController::class, 'getExportPreview']);

    Route::post('/inventory/import', [\App\Http\Controllers\InventoryController::class, 'import']);
    Route::post('/inventory/opening-stock', [\App\Http\Controllers\InventoryController::class, 'importOpeningStock']);
    Route::post('/inventory/opening-stock/manual', [\App\Http\Controllers\InventoryController::class, 'createOpeningStockNote']);
    Route::post('/inventory/opening-stock/parse', [\App\Http\Controllers\InventoryController::class, 'parseOpeningStock']);
    Route::get('/inventory/opening-stock/products-all', [\App\Http\Controllers\InventoryController::class, 'getAllProductsForOpeningStock']);
    Route::get('/inventory/opening-stock/sample', [\App\Http\Controllers\InventoryController::class, 'downloadSampleOpeningStock']);
    Route::post('/inventory/supplier-import', [\App\Http\Controllers\InventoryController::class, 'createImportNote']);
    Route::post('/inventory/export', [\App\Http\Controllers\InventoryController::class, 'createExport']);
    Route::post('/inventory/notes/{id}/status', [\App\Http\Controllers\InventoryController::class, 'statusAction']);

    // Suppliers
    Route::apiResource('suppliers', \App\Http\Controllers\SupplierController::class);

    // Sub-Accounts
    Route::apiResource('sub-accounts', \App\Http\Controllers\SubAccountController::class);

    // Medical Centers & Health Posts
    Route::apiResource('medical-centers', \App\Http\Controllers\MedicalCenterController::class);
    Route::apiResource('health-posts', \App\Http\Controllers\HealthPostController::class);
    Route::apiResource('warehouses', \App\Http\Controllers\WarehouseController::class);
    Route::get('/warehouses/{id}/users', [\App\Http\Controllers\WarehouseController::class, 'getUsers']);
    Route::post('/warehouses/{id}/users', [\App\Http\Controllers\WarehouseController::class, 'assignUser']);
    Route::delete('/warehouses/{id}/users/{userId}', [\App\Http\Controllers\WarehouseController::class, 'removeUser']);

    // Inventory Requests
    Route::apiResource('inventory-requests', \App\Http\Controllers\InventoryRequestController::class);
    Route::put('/inventory-requests/{id}/status', [\App\Http\Controllers\InventoryRequestController::class, 'updateStatus']);

    // Users
    Route::get('/users', [\App\Http\Controllers\UserController::class, 'index']);

    // Units
    Route::apiResource('units', \App\Http\Controllers\UnitController::class);

    // FEFO & Stock Management
    Route::get('/inventory/fefo-batches', [\App\Http\Controllers\InventoryController::class, 'getFEFOBatches']);
    
    // Cold Chain
    Route::post('/inventory/cold-chain/record', [\App\Http\Controllers\InventoryController::class, 'recordColdChainTemperature']);
    
    // Stock Alerts
    Route::get('/inventory/alerts', [\App\Http\Controllers\InventoryController::class, 'getStockAlerts']);
    Route::post('/inventory/alerts/generate', [\App\Http\Controllers\InventoryController::class, 'generateStockAlerts']);
    Route::put('/inventory/alerts/{id}/resolve', [\App\Http\Controllers\InventoryController::class, 'resolveStockAlert']);

    // Stock Vouchers (Import/Export)
    Route::post('/stock-vouchers', [\App\Http\Controllers\StockVoucherController::class, 'store']);
    Route::get('/stock-vouchers', [\App\Http\Controllers\StockVoucherController::class, 'index']);

    Route::get('/inventory/stock', [\App\Http\Controllers\InventoryController::class, 'getRealtimeInventory']);
    Route::get('/inventory/stock/{id}/history', [\App\Http\Controllers\InventoryController::class, 'getProductHistory']);
    Route::get('/inventory/status', [\App\Http\Controllers\InventoryController::class, 'status']);
    
    // Legacy SQL Server Sync
    Route::get('/legacy/invoices', [\App\Http\Controllers\LegacySyncController::class, 'getInvoices']);

    // Reports
    Route::get('/reports/inventory-check', [\App\Http\Controllers\ReportController::class, 'getInventoryCheck']);
    Route::get('/reports/inventory-check/pdf', [\App\Http\Controllers\ReportController::class, 'exportInventoryCheckPdf']);
});
