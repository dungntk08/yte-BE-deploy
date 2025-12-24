<?php

namespace App\Http\Controllers;

use App\Models\SubAccount;
use Illuminate\Http\Request;

class SubAccountController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        return response()->json(SubAccount::where('account_id', $user->account_id)->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'active' => 'boolean',
        ]);

        $user = $request->user();
        $validated['account_id'] = $user->account_id;

        $subAccount = SubAccount::create($validated);
        return response()->json($subAccount, 201);
    }

    public function show(SubAccount $subAccount)
    {
        if ($subAccount->account_id !== auth()->user()->account_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return response()->json($subAccount);
    }

    public function update(Request $request, SubAccount $subAccount)
    {
        if ($subAccount->account_id !== $request->user()->account_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'nullable|string|max:50',
            'active' => 'boolean',
        ]);

        $subAccount->update($validated);
        return response()->json($subAccount);
    }

    public function destroy(SubAccount $subAccount)
    {
        if ($subAccount->account_id !== auth()->user()->account_id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $subAccount->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
