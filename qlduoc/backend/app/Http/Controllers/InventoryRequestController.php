<?php

namespace App\Http\Controllers;

use App\Models\InventoryRequest;
use App\Models\InventoryRequestDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     * Can filter by type: 'sent' (requested by me), 'received' (requested to me)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $type = $request->query('type', 'sent'); // sent, received

        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id');

        $query = InventoryRequest::query()
            ->with(['requestWarehouse:id,name', 'supplyWarehouse:id,name', 'creator:id,name']);

        if ($type === 'sent') {
            // Requests initiated by my warehouses
            $query->whereIn('request_warehouse_id', $userWarehouseIds);
        } else {
            // Requests sent TO my warehouses
            $query->whereIn('supply_warehouse_id', $userWarehouseIds);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'request_warehouse_id' => 'required|exists:warehouses,id',
            'supply_warehouse_id' => 'required|exists:warehouses,id|different:request_warehouse_id',
            'description' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit' => 'nullable|string',
        ]);

        $user = Auth::user();

        // Check if user has permission on the REQUESTING warehouse
        if (!$user->warehouses()->where('warehouses.id', $request->request_warehouse_id)->exists()) {
             return response()->json(['message' => 'Bạn không có quyền tạo phiếu cho kho này'], 403);
        }

        // Generate Code: PR (Phieu Request) + Ymd + Random
        $code = 'PR' . date('Ymd') . rand(1000, 9999);

        $inventoryRequest = DB::transaction(function () use ($request, $user, $code) {
             $invRequest = InventoryRequest::create([
                 'account_id' => $user->account_id, // Assuming same account
                 'code' => $code,
                 'request_warehouse_id' => $request->request_warehouse_id,
                 'supply_warehouse_id' => $request->supply_warehouse_id,
                 'created_by' => $user->id,
                 'status' => 'pending',
                 'description' => $request->description,
             ]);

             foreach ($request->items as $item) {
                 InventoryRequestDetail::create([
                     'inventory_request_id' => $invRequest->id,
                     'product_id' => $item['product_id'],
                     'quantity' => $item['quantity'],
                     'unit' => $item['unit'] ?? null,
                 ]);
             }

             return $invRequest;
        });

        return response()->json($inventoryRequest, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $userWarehouseIds = $user->warehouses()->pluck('warehouses.id')->toArray();

        $inventoryRequest = InventoryRequest::with(['details.product', 'requestWarehouse', 'supplyWarehouse', 'creator'])
            ->findOrFail($id);

        // Check visibility (either sender or receiver) or Admin ??
        // For strictness:
        if (!in_array($inventoryRequest->request_warehouse_id, $userWarehouseIds) && 
            !in_array($inventoryRequest->supply_warehouse_id, $userWarehouseIds)) {
             return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($inventoryRequest);
    }

    /**
     * Update status (Approve/Reject).
     * Only Receiver (Supply Warehouse) can Approve/Reject? Or maybe Sender can Cancel?
     */
    public function updateStatus(Request $request, string $id)
    {
         $request->validate([
             'status' => 'required|in:approved,rejected,cancelled'
         ]);

         $user = Auth::user();
         $inventoryRequest = InventoryRequest::findOrFail($id);
         $userWarehouseIds = $user->warehouses()->pluck('warehouses.id')->toArray();

         if ($request->status === 'cancelled') {
             // Only Creator or Request Warehouse can cancel if pending
             if (!in_array($inventoryRequest->request_warehouse_id, $userWarehouseIds)) {
                 return response()->json(['message' => 'Unauthorized to cancel'], 403);
             }
         } else {
             // Approve/Reject: Only Supply Warehouse can do this
             if (!in_array($inventoryRequest->supply_warehouse_id, $userWarehouseIds)) {
                 return response()->json(['message' => 'Unauthorized to approve/reject'], 403);
             }
         }

         $inventoryRequest->update(['status' => $request->status]);

         return response()->json($inventoryRequest);
    }
}
