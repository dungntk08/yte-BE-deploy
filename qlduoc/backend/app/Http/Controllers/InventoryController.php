<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\WarehouseBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class InventoryController extends Controller
{
    // Import a new batch (Nhập kho)
    public function import(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_code' => 'required|string',
            'expiry_date' => 'required|date',
            'quantity' => 'required|integer|min:1',
            'import_price' => 'numeric|min:0'
        ]);

        // Verify product belongs to user's account
        $product = Product::where('id', $validated['product_id'])
            ->where('account_id', $user->account_id)
            ->firstOrFail();

        $batch = WarehouseBatch::create($validated);

        return response()->json([
            'message' => 'Nhập kho thành công',
            'batch' => $batch
        ]);
    }

    public function importOpeningStock(Request $request)
    {
        // ... previous implementation ...
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $user = Auth::user();

        // Check permission if user is assigned to this warehouse
        if (!$user->warehouses()->where('warehouses.id', $request->warehouse_id)->exists()) {
             return response()->json(['message' => 'Bạn không có quyền thao tác trên kho này'], 403);
        }

        \Maatwebsite\Excel\Facades\Excel::import(
            new \App\Imports\OpeningStockImport($request->warehouse_id, $user->account_id), 
            $request->file('file')
        );
        
        // Log Activity
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'import_opening_stock',
            'description' => 'Nhập tồn đầu từ file Excel',
            'payload' => ['warehouse_id' => $request->warehouse_id, 'file' => $request->file('file')->getClientOriginalName()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Nhập tồn đầu thành công']);
    }

    // Manual Creation (Nhập tay)
    public function createOpeningStockNote(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'code' => 'required|string|unique:inventory_notes,code',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.batch_code' => 'required|string',
            'items.*.expiry_date' => 'required|date',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();
        if (!$user->warehouses()->where('warehouses.id', $request->warehouse_id)->exists()) {
             return response()->json(['message' => 'Bạn không có quyền thao tác trên kho này'], 403);
        }

        $note = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user) {
            // 1. Create Note Header
            $note = \App\Models\InventoryNote::create([
                'code' => $request->code,
                'type' => 'import', // Opening stock is an import
                'warehouse_id' => $request->warehouse_id,
                'created_by' => $user->id,
                'status' => 1, // Completed directly
                'description' => $request->description ?? 'Nhập tồn đầu kỳ (Thủ công)',
            ]);

            // 2. Process Items
            foreach ($request->items as $item) {
                // Create Detail
                \App\Models\InventoryNoteDetail::create([
                    'inventory_note_id' => $note->id,
                    'product_id' => $item['product_id'],
                    'batch_code' => $item['batch_code'],
                    'expiry_date' => $item['expiry_date'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'] ?? 0,
                    'unit' => $item['unit'] ?? null,
                ]);

                // Create/Update Warehouse Batch
                // For opening stock, we typically Create new batch entries.
                // Or if same batch exists in same warehouse, we sum it up.
                // Let's check for existing batch first.
                
                $batch = \App\Models\WarehouseBatch::where('warehouse_id', $request->warehouse_id)
                    ->where('product_id', $item['product_id'])
                    ->where('batch_code', $item['batch_code'])
                    ->where('expiry_date', $item['expiry_date'])
                    ->first();

                if ($batch) {
                    $batch->increment('quantity', $item['quantity']);
                } else {
                    \App\Models\WarehouseBatch::create([
                        'warehouse_id' => $request->warehouse_id,
                        'product_id' => $item['product_id'],
                        'batch_code' => $item['batch_code'],
                        'expiry_date' => $item['expiry_date'],
                        'quantity' => $item['quantity'],
                        'import_price' => $item['price'] ?? 0,
                    ]);
                }
            }
            
            return $note;
        });
        
        // Log Activity
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'create_opening_stock_manual',
            'description' => 'Nhập tồn đầu thủ công',
            'model' => \App\Models\InventoryNote::class,
            'model_id' => $note->id,
            'payload' => $request->only(['warehouse_id', 'code', 'items']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Tạo phiếu nhập tồn thành công', 'note' => $note]);
    }

    // Import from Supplier (Nhập từ nhà cung cấp)
    public function createImportNote(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'code' => 'required|string|unique:inventory_notes,code',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.batch_code' => 'required|string',
            'items.*.expiry_date' => 'required|date',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
            'items.*.vat' => 'nullable|numeric|min:0|max:100',
            'items.*.discount' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();
        if (!$user->warehouses()->where('warehouses.id', $request->warehouse_id)->exists()) {
             return response()->json(['message' => 'Bạn không có quyền thao tác trên kho này'], 403);
        }

        $note = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user) {
            // 1. Create Note Header
            $note = \App\Models\InventoryNote::create([
                'code' => $request->code,
                'type' => 'import',
                'warehouse_id' => $request->warehouse_id,
                'supplier_id' => $request->supplier_id,
                'created_by' => $user->id,
                'status' => 1, // Completed
                'description' => $request->description ?? 'Nhập hàng từ nhà cung cấp',
            ]);

            // 2. Process Items
            foreach ($request->items as $item) {
                // Create Detail
                \App\Models\InventoryNoteDetail::create([
                    'inventory_note_id' => $note->id,
                    'product_id' => $item['product_id'],
                    'batch_code' => $item['batch_code'],
                    'expiry_date' => $item['expiry_date'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'] ?? 0,
                    'vat' => $item['vat'] ?? 0,
                    'discount' => $item['discount'] ?? 0,
                    'unit' => $item['unit'] ?? null,
                ]);

                // Update Batch
                // Search for existing batch
                $batch = \App\Models\WarehouseBatch::where('warehouse_id', $request->warehouse_id)
                    ->where('product_id', $item['product_id'])
                    ->where('batch_code', $item['batch_code'])
                    ->where('expiry_date', $item['expiry_date'])
                    ->first();

                if ($batch) {
                    $batch->increment('quantity', $item['quantity']);
                    // Optional: Update import price (weighted average or latest?)
                    // For now, let's keep it simple or update if 0
                    if ($batch->import_price == 0 && isset($item['price'])) {
                        $batch->update(['import_price' => $item['price']]);
                    }
                } else {
                    \App\Models\WarehouseBatch::create([
                        'warehouse_id' => $request->warehouse_id,
                        'product_id' => $item['product_id'],
                        'batch_code' => $item['batch_code'],
                        'expiry_date' => $item['expiry_date'],
                        'quantity' => $item['quantity'],
                        'import_price' => $item['price'] ?? 0,
                    ]);
                }
            }
            
            return $note;
        });

        // Log Activity
        \App\Models\ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'import_from_supplier',
            'description' => 'Nhập hàng từ NCC',
            'model' => \App\Models\InventoryNote::class,
            'model_id' => $note->id,
            'payload' => $request->only(['warehouse_id', 'supplier_id', 'code', 'items']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Nhập hàng thành công', 'note' => $note]);
    }

    public function downloadSampleOpeningStock()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\OpeningStockSampleExport, 'mau_nhap_ton_dau.xlsx');
    }

    // --- Export Logic ---

    // Preview Export based on Request (FIFO Allocation)
    public function getExportPreview(Request $request)
    {
        $requestId = $request->query('request_id');
        if (!$requestId) {
            return response()->json(['items' => []]);
        }

        $invRequest = \App\Models\InventoryRequest::with('details.product')->findOrFail($requestId);
        
        // Strategy: FIFO (First In First Out)
        // Find batches in Supplying Warehouse (Source)
        // Order by expiry_date ASC
        
        $previewItems = [];

        foreach ($invRequest->details as $detail) {
            $neededQty = $detail->quantity;
            $productId = $detail->product_id;
            
            // Get available batches for this product in supply warehouse
            $batches = WarehouseBatch::where('warehouse_id', $invRequest->supply_warehouse_id)
                ->where('product_id', $productId)
                ->where('quantity', '>', 0)
                ->orderBy('expiry_date', 'asc') // FIFO
                ->get();

            $allocated = 0;
            
            foreach ($batches as $batch) {
                if ($allocated >= $neededQty) break;

                $take = min($batch->quantity, $neededQty - $allocated);
                
                $previewItems[] = [
                    'product_id' => $productId,
                    'product_name' => $detail->product->name,
                    'product_code' => $detail->product->code,
                    'unit' => $detail->unit,
                    'batch_code' => $batch->batch_code,
                    'expiry_date' => $batch->expiry_date,
                    'quantity' => $take,
                    'quantity_in_stock' => $batch->quantity,
                    'price' => $batch->import_price, // Suggested price (cost)
                ];

                $allocated += $take;
            }

            if ($allocated < $neededQty) {
                // Warning: Not enough stock
                // Add a placeholder or handle in UI
            }
        }

        return response()->json([
            'request' => $invRequest,
            'items' => $previewItems
        ]);
    }

    // Create Export Note (Internal)
    public function createExport(Request $request)
    {
        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id', // Source Warehouse
            'destination_warehouse_id' => 'required|exists:warehouses,id|different:warehouse_id',
            'inventory_request_id' => 'nullable|exists:inventory_requests,id',
            'receiver_id' => 'nullable|exists:users,id',
            'code' => 'required|string|unique:inventory_notes,code',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.batch_code' => 'required|string',
            'items.*.expiry_date' => 'required|date',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = Auth::user();
        if (!$user->warehouses()->where('warehouses.id', $request->warehouse_id)->exists()) {
             return response()->json(['message' => 'Bạn không có quyền xuất hàng từ kho này'], 403);
        }

        $note = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user) {
            // 1. Create Note Header
            $note = \App\Models\InventoryNote::create([
                'code' => $request->code,
                'type' => 'export',
                'warehouse_id' => $request->warehouse_id, // Source
                'destination_warehouse_id' => $request->destination_warehouse_id,
                'inventory_request_id' => $request->inventory_request_id,
                'receiver_id' => $request->receiver_id,
                'created_by' => $user->id,
                'status' => 1, // Completed
                'description' => $request->description ?? 'Xuất kho nội bộ',
            ]);

            // 2. Process Items
            foreach ($request->items as $item) {
                // Check Stock
                $batch = WarehouseBatch::where('warehouse_id', $request->warehouse_id)
                    ->where('product_id', $item['product_id'])
                    ->where('batch_code', $item['batch_code'])
                    ->where('expiry_date', $item['expiry_date'])
                    ->first();

                if (!$batch || $batch->quantity < $item['quantity']) {
                    throw new \Exception("Không đủ tồn kho cho lô {$item['batch_code']} của sản phẩm ID {$item['product_id']}");
                }

                // Decrement Stock
                $batch->decrement('quantity', $item['quantity']);

                // Create Detail
                \App\Models\InventoryNoteDetail::create([
                    'inventory_note_id' => $note->id,
                    'product_id' => $item['product_id'],
                    'batch_code' => $item['batch_code'],
                    'expiry_date' => $item['expiry_date'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'] ?? 0,
                    'unit' => $item['unit'] ?? null,
                ]);

                // Increment Stock in Destination Warehouse (Internal Transfer)
                // Check if batch exists in Dest
                $destBatch = WarehouseBatch::where('warehouse_id', $request->destination_warehouse_id)
                    ->where('product_id', $item['product_id'])
                    ->where('batch_code', $item['batch_code'])
                    ->where('expiry_date', $item['expiry_date'])
                    ->first();

                if ($destBatch) {
                     $destBatch->increment('quantity', $item['quantity']);
                } else {
                     WarehouseBatch::create([
                        'warehouse_id' => $request->destination_warehouse_id,
                        'product_id' => $item['product_id'],
                        'batch_code' => $item['batch_code'],
                        'expiry_date' => $item['expiry_date'],
                        'quantity' => $item['quantity'],
                        'import_price' => $item['price'] ?? 0, // Transfer price
                     ]);
                }
            }

            // Close Request if applicable?
            if ($request->inventory_request_id) {
                \App\Models\InventoryRequest::where('id', $request->inventory_request_id)
                    ->update(['status' => 'completed']);
            }
            
            return $note;
        });

        return response()->json(['message' => 'Xuất kho thành công', 'note' => $note]);
    }

    public function parseOpeningStock(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        $user = Auth::user();
        $importer = new \App\Imports\OpeningStockParse($user->account_id);
        
        \Maatwebsite\Excel\Facades\Excel::import($importer, $request->file('file'));

        return response()->json($importer->data);
    }

    // Check inventory status (Expiring soon, Low stock)
    public function status(Request $request)
    {
        $user = Auth::user();
        
        // 1. Expiring soon (within 30 days) batches
        $expiringBatches = WarehouseBatch::whereHas('product', function($q) use ($user) {
                $q->where('account_id', $user->account_id);
            })
            ->where('quantity', '>', 0)
            ->where('expiry_date', '>', now())
            ->where('expiry_date', '<=', now()->addDays(30))
            ->with('product:id,name')
            ->get();

        // 2. Expired batches still in stock (Alert!)
        $expiredBatches = WarehouseBatch::whereHas('product', function($q) use ($user) {
                $q->where('account_id', $user->account_id);
            })
            ->where('quantity', '>', 0)
            ->where('expiry_date', '<=', now())
            ->with('product:id,name')
            ->get();

        return response()->json([
            'expiring_soon' => $expiringBatches,
            'expired' => $expiredBatches
        ]);
    }
}
