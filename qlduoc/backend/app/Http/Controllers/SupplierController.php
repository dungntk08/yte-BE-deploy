<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Supplier::accessible($user->account_id);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string', // Unique check done manually or via rule w/ where
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'tax_code' => 'nullable|string|max:50',
        ]);

        $user = $request->user();
        
        // Check uniqueness for this account
        if (Supplier::where('account_id', $user->account_id)->where('code', $validated['code'])->exists()) {
            return response()->json(['message' => 'Mã nhà cung cấp đã tồn tại'], 422);
        }

        $validated['account_id'] = $user->account_id;
        $supplier = Supplier::create($validated);

        return response()->json($supplier, 201);
    }

    public function show(Supplier $supplier)
    {
        // Add policy check if needed
        return response()->json($supplier);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $user = $request->user();
        if ($supplier->account_id !== $user->account_id) {
             return response()->json(['message' => 'Không có quyền sửa nhà cung cấp hệ thống'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'tax_code' => 'nullable|string|max:50',
        ]);
        
        // Unique check if code changing
        if (isset($validated['code']) && $validated['code'] !== $supplier->code) {
             if (Supplier::where('account_id', $user->account_id)->where('code', $validated['code'])->exists()) {
                return response()->json(['message' => 'Mã nhà cung cấp đã tồn tại'], 422);
            }
        }

        $supplier->update($validated);

        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier)
    {
        // Check ownership
        if ($supplier->account_id !== auth()->user()->account_id) {
             return response()->json(['message' => 'Không có quyền xóa nhà cung cấp hệ thống'], 403);
        }
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
