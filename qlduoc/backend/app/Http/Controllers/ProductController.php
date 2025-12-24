<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProductController extends Controller
{
    // List all products
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->hasPermission('product.view')) {
            return response()->json(['message' => 'Bạn không có quyền xem danh sách sản phẩm'], 403);
        }

        $query = Product::where('account_id', $user->account_id)->with('category');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate(10);

        // Append total stock to each product
        $products->getCollection()->transform(function ($product) {
            $product->stock = $product->total_stock;
            return $product;
        });

        return response()->json($products);
    }

    // Create a new product
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->hasPermission('product.create')) {
            return response()->json(['message' => 'Bạn không có quyền thêm mới sản phẩm'], 403);
        }
        
        $validated = $request->validate([
            'name' => 'required|string',
            'code' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit' => 'nullable|string',
            'price' => 'numeric|min:0',
            'min_stock' => 'integer|min:0',
            
            // New fields - all nullable
            'material_type' => 'nullable|string',
            'drug_type' => 'nullable|string',
            'concentration' => 'nullable|string',
            'active_ingredient' => 'nullable|string',
            'active_ingredient_code' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'usage_route' => 'nullable|string',
            'dosage' => 'nullable|string',
            'pharma_type' => 'nullable|string',
            'pharma_group' => 'nullable|string',
            'drug_group' => 'nullable|string',
            'insurance_group' => 'nullable|string',
            'dmdc_code' => 'nullable|string',
            'byt_decision_name' => 'nullable|string',
            'packaging_spec' => 'nullable|string',
            'program' => 'nullable|string',
            'indication' => 'nullable|string',
            'insurance_coverage_rate' => 'nullable|integer',
            'goods_code' => 'nullable|string',
            'prescription_unit' => 'nullable|string',
            'qd130_code' => 'nullable|string',
            'funding_source' => 'nullable|string',
        ]);

        $product = Product::create(array_merge($validated, ['account_id' => $user->account_id]));

        return response()->json($product, 201);
    }

    // Show product details with batches
    public function show($id)
    {
        $user = Auth::user();
        
        if (!$user->hasPermission('product.view')) {
            return response()->json(['message' => 'Bạn không có quyền xem chi tiết sản phẩm'], 403);
        }

        $product = Product::where('account_id', $user->account_id)
            ->where('id', $id)
            ->with(['batches' => function($query) {
                // Show batches that have quantity > 0 or recently expired
                $query->orderBy('expiry_date', 'asc');
            }])
            ->firstOrFail();

        $product->stock = $product->total_stock;

        return response()->json($product);
    }

    // Update product
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user->hasPermission('product.update')) {
            return response()->json(['message' => 'Bạn không có quyền cập nhật sản phẩm'], 403);
        }

        $product = Product::where('account_id', $user->account_id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'sometimes|required|string',
            'code' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit' => 'nullable|string',
            'price' => 'numeric|min:0',
            'min_stock' => 'integer|min:0',
            'material_type' => 'nullable|string',
            'drug_type' => 'nullable|string',
            'concentration' => 'nullable|string',
            'active_ingredient' => 'nullable|string',
            'active_ingredient_code' => 'nullable|string',
            'registration_number' => 'nullable|string',
            'usage_route' => 'nullable|string',
            'dosage' => 'nullable|string',
            'pharma_type' => 'nullable|string',
            'pharma_group' => 'nullable|string',
            'drug_group' => 'nullable|string',
            'insurance_group' => 'nullable|string',
            'dmdc_code' => 'nullable|string',
            'byt_decision_name' => 'nullable|string',
            'packaging_spec' => 'nullable|string',
            'program' => 'nullable|string',
            'indication' => 'nullable|string',
            'insurance_coverage_rate' => 'nullable|integer',
            'goods_code' => 'nullable|string',
            'prescription_unit' => 'nullable|string',
            'qd130_code' => 'nullable|string',
            'funding_source' => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    // Delete product
    public function destroy($id)
    {
        $user = Auth::user();

        if (!$user->hasPermission('product.delete')) {
            return response()->json(['message' => 'Bạn không có quyền xóa sản phẩm'], 403);
        }

        $product = Product::where('account_id', $user->account_id)->where('id', $id)->firstOrFail();
        
        $product->delete();

        return response()->json(['message' => 'Xóa sản phẩm thành công']);
    }

    public function export() 
    {
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\ProductsExport, 'products.xlsx');
    }
   
    public function import(Request $request) 
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);
        
        $user = Auth::user();
        if (!$user->hasPermission('product.create')) {
             return response()->json(['message' => 'Bạn không có quyền import sản phẩm'], 403);
        }

        \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\ProductsImport($user->account_id), $request->file('file'));
        
        return response()->json(['message' => 'Import thành công']);
    }
}
