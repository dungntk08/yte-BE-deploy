<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Warehouse;

class WarehouseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        // Return warehouses the user belongs to, OR all if admin? 
        // For strict permission as requested "Người dùng cần có phân quyền từng kho",
        // we should return only assigned warehouses.
        // But the creator needs to see them to manage?
        // Let's assume:
        // 1. If user has 'warehouse.view_all', see all.
        // 2. Otherwise see assigned warehouses.
        
        // For simplicity now: users see assigned warehouses.
        // But for the initial creation, the Admin needs to see the list.
        // If the admin creates a warehouse, they get assigned. So they see it.
        
        $warehouses = $user->warehouses()->with('subAccount')->orderBy('created_at', 'desc')->get();
        return response()->json($warehouses);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:warehouses,code',
            'name' => 'required|string',
            'type' => 'nullable|string',
            'department' => 'nullable|string',
            'is_pharmacy' => 'boolean',
            'active' => 'boolean',
            'sub_account_id' => 'nullable|exists:sub_accounts,id',
        ]);

        $user = Auth::user();

        // Verify sub_account belongs to user's account
        if ($request->has('sub_account_id') && $request->sub_account_id) {
            $subAccount = \App\Models\SubAccount::where('id', $request->sub_account_id)
                            ->where('account_id', $user->account_id)
                            ->first();
            if (!$subAccount) {
                 return response()->json(['message' => 'Invalid Sub Account'], 422);
            }
        }

        $warehouse = Warehouse::create([
            'account_id' => $user->account_id,
            'code' => $request->code,
            'name' => $request->name,
            'type' => $request->type,
            'department' => $request->department,
            'is_pharmacy' => $request->is_pharmacy ?? true,
            'active' => $request->active ?? true,
            'sub_account_id' => $request->sub_account_id,
        ]);

        // Auto-assign creator to the warehouse
        $warehouse->users()->attach($user->id);

        return response()->json($warehouse, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        return response()->json($warehouse);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);

        $request->validate([
            'code' => 'sometimes|string|unique:warehouses,code,' . $id,
            'name' => 'sometimes|string',
            'sub_account_id' => 'nullable|exists:sub_accounts,id',
        ]);
        
        // Verify sub_account belongs to user's account if changing
        if ($request->has('sub_account_id') && $request->sub_account_id) {
            $subAccount = \App\Models\SubAccount::where('id', $request->sub_account_id)
                            ->where('account_id', Auth::user()->account_id)
                            ->first();
            if (!$subAccount) {
                 return response()->json(['message' => 'Invalid Sub Account'], 422);
            }
        }

        $warehouse->update($request->all());

        return response()->json($warehouse);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        $warehouse->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }

    // Permission Management
    public function getUsers(string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        return response()->json($warehouse->users);
    }

    public function assignUser(Request $request, string $id)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        
        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);

        // Check if user belongs to same account (security check)
        $userToAdd = \App\Models\User::where('id', $request->user_id)
                        ->where('account_id', Auth::user()->account_id)
                        ->firstOrFail();

        // Attach without duplicating
        $warehouse->users()->syncWithoutDetaching([$userToAdd->id]);

        return response()->json(['message' => 'User assigned successfully']);
    }

    public function removeUser(string $id, string $userId)
    {
        $warehouse = Auth::user()->warehouses()->findOrFail($id);
        
        // Prevent removing yourself if you are the only one? Or just allow it.
        // Allow for now.
        
        $warehouse->users()->detach($userId);
        
        return response()->json(['message' => 'User removed successfully']);
    }
}
