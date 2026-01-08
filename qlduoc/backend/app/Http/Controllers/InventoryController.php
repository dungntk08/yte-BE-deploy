<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\InventorySnapshot;
use App\Models\ItemBatch;
use App\Models\StockVoucher;
use App\Models\StockVoucherDetail;
use App\Imports\OpeningStockImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

/**
 * Legacy InventoryController adapted for PascalCase Schema.
 * Some methods might be better moved to StockVoucherController.
 */
class InventoryController extends Controller
{
    // Replaced Batch Import with StockVoucher Import
    public function import(Request $request)
    {
        return response()->json(['message' => 'Please use /api/stock-vouchers for imports'], 400);
    }

    public function importOpeningStock(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
            'warehouse_id' => 'required|exists:Warehouses,Id',
        ]);

        try {
            Excel::import(new OpeningStockImport($request->warehouse_id), $request->file('file'));
            return response()->json(['message' => 'Nhập tồn đầu thành công']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi import: ' . $e->getMessage()], 500);
        }
    }
    
    // Manual Creation (Nhập tay) - Adapter to StockVoucher
    // Opening Stock (Nhập tồn đầu)
    // Opening Stock (Nhập tồn đầu)
    public function createOpeningStockNote(Request $request)
    {
        $request->validate([
            'TargetWarehouseId' => 'required|exists:Warehouses,Id',
            'Details' => 'required|array|min:1',
            'Details.*.ProductId' => 'required|exists:Products,Id',
            'Details.*.BatchNumber' => 'required|string',
            'Details.*.ExpiryDate' => 'required|date',
            'Details.*.Quantity' => 'required|integer|min:1',
            'Details.*.Price' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();

        $voucher = DB::transaction(function () use ($request, $user) {
            $voucher = StockVoucher::create([
                'Code' => $request->Code ?? 'KHO-DAU-' . time(),
                'VoucherDate' => $request->VoucherDate ?? now(),
                'VoucherType' => 'Import',
                'TargetWarehouseId' => $request->TargetWarehouseId,
                'Status' => 'Pending',
                'Description' => $request->Description ?? 'Nhập tồn đầu kỳ',
                'ReceiverName' => $request->ReceiverName, // Added
                'CreatedBy' => $user->Id,
            ]);

            foreach ($request->Details as $item) {
                ItemBatch::firstOrCreate(
                    ['ProductId' => $item['ProductId'], 'BatchNumber' => $item['BatchNumber']],
                    ['ExpiryDate' => $item['ExpiryDate']]
                );

                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $item['ProductId'],
                    'BatchNumber' => $item['BatchNumber'],
                    'ExpiryDate' => $item['ExpiryDate'],
                    'Quantity' => $item['Quantity'],
                    'Price' => $item['Price'] ?? 0,
                    'UnitName' => $item['UnitName'] ?? null,
                    // Bidding Info
                    'RegistrationNumber' => $item['RegistrationNumber'] ?? null,
                    'BidPackageCode' => $item['BidPackageCode'] ?? null,
                    'BidGroup' => $item['BidGroup'] ?? null,
                    'BidDecision' => $item['BidDecision'] ?? null,
                ]);
            }
            
            $this->logActivity($voucher, 'Create', 'Tạo phiếu tồn đầu kỳ');
            
            return $voucher;
        });

        return response()->json(['message' => 'Tạo phiếu nhập tồn thành công', 'voucher' => $voucher]);
    }

    // Import from Supplier (Nhập từ nhà cung cấp) - Adapter
    public function createImportNote(Request $request)
    {
        $request->validate([
            'warehouseId' => 'required|exists:Warehouses,Id',
            'supplierId' => 'required|exists:Suppliers,Id',
            'invoiceNo' => 'required|string',
            'invoiceDate' => 'required|date',
            'Details' => 'required|array|min:1',
            'Details.*.ProductId' => 'required|exists:Products,Id',
            'Details.*.BatchNumber' => 'required|string',
            'Details.*.ExpiryDate' => 'required|date',
            'Details.*.Quantity' => 'required|integer|min:1',
            'Details.*.Price' => 'nullable|numeric|min:0',
        ]);

        $user = Auth::user();

        $voucher = DB::transaction(function () use ($request, $user) {
            $voucher = StockVoucher::create([
                'Code' => $request->code ?? 'IMP-' . time(),
                'VoucherDate' => $request->voucherDate ?? now(),
                'VoucherType' => 'Import',
                'TargetWarehouseId' => $request->warehouseId,
                'PartnerId' => $request->supplierId,
                'InvoiceNo' => $request->invoiceNo,
                'SerialNo' => $request->serialNo,
                'InvoiceDate' => $request->invoiceDate,
                'FundingSource' => $request->fundingSource,
                'DelivererName' => $request->deliverer,
                'ReceiverName' => $request->receiver,
                'Status' => 'Pending',
                'Description' => $request->description ?? 'Nhập hàng từ NCC',
                'CreatedBy' => $user->Id,
                // VATRate not in header usually, strictly per item or general. If header, add column.
                // Assuming VATRate column exists or ignored for now if not critical. 
                // Model doesn't have VATRate yet in fillable? I added it to fillable.
                'VATRate' => $request->vatRate ?? 0,
            ]);

            foreach ($request->Details as $item) {
                 ItemBatch::firstOrCreate(
                    ['ProductId' => $item['ProductId'], 'BatchNumber' => $item['BatchNumber']],
                    ['ExpiryDate' => $item['ExpiryDate']]
                );

                StockVoucherDetail::create([
                'VoucherId' => $voucher->Id,
                'ProductId' => $item['ProductId'],
                'BatchNumber' => $item['BatchNumber'],
                'ExpiryDate' => $item['ExpiryDate'],
                'Quantity' => $item['Quantity'],
                'Price' => $item['Price'] ?? 0,
                'VATRate' => $item['VATRate'] ?? 0,
                // New Fields
                'RequestedQuantity' => $item['RequestedQuantity'] ?? null,
                'ConversionRate' => $item['ConversionRate'] ?? 1,
                'UnitName' => $item['UnitName'] ?? null,
                'Currency' => $item['Currency'] ?? 'VND',
                'ExchangeRate' => $item['ExchangeRate'] ?? 1,
                'SellingPrice' => $item['SellingPrice'] ?? 0,
                'VATAmount' => $item['VATAmount'] ?? 0,
                'TotalAmount' => $item['TotalAmount'] ?? 0, // Thành tiền (final or pre-vat? Usually calc from qty*price + vat + etc)
                'Discount' => $item['Discount'] ?? 0,
                'Surcharge' => $item['Surcharge'] ?? 0,
                'RegistrationNumber' => $item['RegistrationNumber'] ?? null,
                'ApprovalOrder' => $item['ApprovalOrder'] ?? null,
                'BidPackageCode' => $item['BidPackageCode'] ?? null,
                'BidGroup' => $item['BidGroup'] ?? null,
                'BidDecision' => $item['BidDecision'] ?? null,
            ]);

            }
            // Removed Snapshot Update from Creation. Only on Approve.
            
            $this->logActivity($voucher, 'Create', 'Tạo phiếu nhập mới');
            
            return $voucher;
        });

        return response()->json(['message' => 'Nhập hàng thành công', 'voucher' => $voucher]);
    }

    public function downloadSampleOpeningStock()
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="mau_nhap_ton_dau.csv"',
        ];

        $callback = function () {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM
            fputs($file, "\xEF\xBB\xBF");
            
            // Header
            fputcsv($file, ['ma_san_pham', 'ten_san_pham', 'so_lo', 'han_dung', 'so_luong', 'don_gia']);
            
            // Fetch all active products
            $products = Product::where('IsActive', true)->get();

            foreach ($products as $product) {
                 fputcsv($file, [
                    $product->Code,
                    $product->Name,
                    '', // so_lo
                    '', // han_dung
                    '', // so_luong
                    '', // don_gia
                ]);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    
    public function getExportPreview(Request $request)
    {
        // 1. Handle Request ID (Fetch items from InventoryRequest)
        if ($request->has('request_id')) {
            try {
                $reqId = $request->input('request_id');
                // Use DB to avoid Model dependency issues if file missing
                $invRequest = DB::table('InventoryRequests')->where('id', $reqId)->first();
                if (!$invRequest) {
                     return response()->json(['message' => 'Không tìm thấy phiếu đề nghị'], 404);
                }
                
                $details = DB::table('InventoryRequestDetails')
                    ->join('Products', 'InventoryRequestDetails.product_id', '=', 'Products.Id')
                    ->where('inventory_request_id', $reqId)
                    ->select(
                        'InventoryRequestDetails.*',
                        'Products.Code as product_code', 
                        'Products.Name as product_name',
                        'Products.UnitName as unit'
                    )
                    ->get();
                
                $supplyWarehouseId = $invRequest->supply_warehouse_id;
                
                $items = [];
                foreach ($details as $detail) {
                    // Auto-pick FEFO batch ?? Or just show blank?
                    // Frontend shows "Số lô" (Batch Code) in table. User might pick it?
                    // If we want to auto-suggest, we do checking.
                    // For now, return items structure expected by frontend.
                    
                    // Check stock of this product in Supply Warehouse to suggest best Batch?
                    // Simple FEFO:
                    $snapshot = InventorySnapshot::where('WarehouseId', $supplyWarehouseId)
                        ->where('ProductId', $detail->product_id)
                        ->where('Quantity', '>', 0)
                        ->join('ItemBatches', function ($join) {
                            $join->on('InventorySnapshots.ProductId', '=', 'ItemBatches.ProductId')
                                 ->on('InventorySnapshots.BatchNumber', '=', 'ItemBatches.BatchNumber');
                        })
                        ->orderBy('ItemBatches.ExpiryDate', 'asc')
                        ->first();

                    $items[] = [
                        'product_id' => $detail->product_id,
                        'product_code' => $detail->product_code,
                        'product_name' => $detail->product_name,
                        'batch_code' => $snapshot ? $snapshot->BatchNumber : '',
                        'expiry_date' => $snapshot ? $snapshot->ExpiryDate : '',
                        'quantity' => $detail->quantity,
                        'quantity_in_stock' => $snapshot ? $snapshot->Quantity : 0,
                        'price' => $snapshot ? $snapshot->AveragePrice : 0,
                        'unit' => $detail->unit
                    ];
                }
                
                return response()->json([
                    'request' => $invRequest,
                    'items' => $items
                ]);

            } catch (\Exception $e) {
                 return response()->json(['message' => 'Lỗi tải dữ liệu: ' . $e->getMessage()], 500);
            }
        }

        // 2. Normal Preview (Validation Only)
        // Map Frontend Keys to Backend
        $data = $request->all();
        if (isset($data['warehouse_id'])) $data['SourceWarehouseId'] = $data['warehouse_id'];
        if (isset($data['items'])) {
             $data['Details'] = array_map(function($item) {
                 return [
                     'ProductId' => $item['product_id'] ?? $item['ProductId'],
                     'BatchNumber' => $item['batch_code'] ?? $item['BatchNumber'],
                     'Quantity' => $item['quantity'] ?? $item['Quantity'],
                 ];
             }, $data['items']);
        }
        $request->replace($data);

        $request->validate([
            'SourceWarehouseId' => 'required|exists:Warehouses,Id',
            'Details' => 'required|array',
            'Details.*.ProductId' => 'required|exists:Products,Id',
            'Details.*.BatchNumber' => 'required|string',
            'Details.*.Quantity' => 'required|numeric|min:0.01',
        ]);

        $results = [];
        foreach ($request->Details as $item) {
             $snapshot = InventorySnapshot::where('WarehouseId', $request->SourceWarehouseId)
                 ->where('ProductId', $item['ProductId'])
                 ->where('BatchNumber', $item['BatchNumber'])
                 ->first();
             
             $available = $snapshot ? $snapshot->Quantity : 0;
             
             $results[] = [
                 'ProductId' => $item['ProductId'],
                 'BatchNumber' => $item['BatchNumber'],
                 'Requested' => $item['Quantity'],
                 'Available' => $available,
                 'IsEnough' => ($available >= $item['Quantity'])
             ];
        }

        return response()->json(['preview' => $results]);
    }

    public function createExport(Request $request)
    {
        // 1. Data Mapping (Snake -> Pascal)
        $data = $request->all();
        if (isset($data['warehouse_id'])) $data['SourceWarehouseId'] = $data['warehouse_id'];
        if (isset($data['destination_warehouse_id'])) $data['TargetWarehouseId'] = $data['destination_warehouse_id'];
        
        // Map Items
        if (isset($data['items'])) {
             $data['Details'] = array_map(function($item) {
                 return [
                     'ProductId' => $item['product_id'] ?? $item['ProductId'] ?? null,
                     'BatchNumber' => $item['batch_code'] ?? $item['BatchNumber'] ?? null,
                     'Quantity' => $item['quantity'] ?? $item['Quantity'] ?? 0,
                     'ExpiryDate' => $item['expiry_date'] ?? $item['ExpiryDate'] ?? null,
                     // Add other mappings if needed
                 ];
             }, $data['items']);
        }
        $request->replace($data);

        // 2. Validation (Vietnamese Messages)
        $messages = [
            'SourceWarehouseId.required' => 'Vui lòng chọn kho xuất.',
            'SourceWarehouseId.exists' => 'Kho xuất không tồn tại.',
            'TargetWarehouseId.required' => 'Vui lòng chọn kho nhập (đích).',
            'TargetWarehouseId.exists' => 'Kho nhập không tồn tại.',
            'Details.required' => 'Danh sách sản phẩm không được để trống.',
            'Details.array' => 'Danh sách sản phẩm không hợp lệ.',
            'Details.*.ProductId.required' => 'Sản phẩm không hợp lệ.',
            'Details.*.ProductId.exists' => 'Sản phẩm không tồn tại.',
            'Details.*.BatchNumber.required' => 'Vui lòng chọn số lô.',
            'Details.*.Quantity.required' => 'Vui lòng nhập số lượng.',
            'Details.*.Quantity.min' => 'Số lượng phải lớn hơn 0.',
        ];

        $request->validate([
            'SourceWarehouseId' => 'required|exists:Warehouses,Id',
            'TargetWarehouseId' => 'nullable|exists:Warehouses,Id',
            'Details' => 'required|array|min:1',
            'Details.*.ProductId' => 'required|exists:Products,Id',
            'Details.*.BatchNumber' => 'required|string',
            'Details.*.Quantity' => 'required|numeric|min:0.01',
        ], $messages);

        // 3. Stock Validation
        foreach ($request->Details as $item) {
             $snapshot = InventorySnapshot::where('WarehouseId', $request->SourceWarehouseId)
                 ->where('ProductId', $item['ProductId'])
                 ->where('BatchNumber', $item['BatchNumber'])
                 ->first();
             
             if (!$snapshot || $snapshot->Quantity < $item['Quantity']) {
                 return response()->json([
                     'message' => "Kho không đủ tồn cho sản phẩm {$item['ProductId']} (Lô: {$item['BatchNumber']}). Tồn hiện tại: " . ($snapshot->Quantity ?? 0),
                     'error_code' => 'OUT_OF_STOCK'
                 ], 400); 
             }
        }

        $user = Auth::user();

        $voucherType = 'Export';
        if ($request->sub_type === 'prescription') $voucherType = 'Prescription';
        if ($request->sub_type === 'retail') $voucherType = 'Retail';

        $voucher = DB::transaction(function () use ($request, $user, $voucherType) {
            $voucher = StockVoucher::create([
                'Code' => $request->Code ?? 'EXP-' . time(),
                'VoucherDate' => $request->VoucherDate ?? now(),
                'VoucherType' => $voucherType,
                'SourceWarehouseId' => $request->SourceWarehouseId,
                'TargetWarehouseId' => $request->TargetWarehouseId,
                'Status' => 'Pending',
                'Description' => $request->Description ?? 'Xuất kho',
                'ReceiverName' => $request->ReceiverName,
                'CreatedBy' => $user->Id,
            ]);

            foreach ($request->Details as $item) {
                // Try to get expiry from ItemBatch if not provided
                $expiry = $item['ExpiryDate'] ?? null;
                if (!$expiry) {
                    $batch = ItemBatch::where('ProductId', $item['ProductId'])
                                      ->where('BatchNumber', $item['BatchNumber'])
                                      ->first();
                    $expiry = $batch ? $batch->ExpiryDate : null;
                }

                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $item['ProductId'],
                    'BatchNumber' => $item['BatchNumber'],
                    'ExpiryDate' => $expiry,
                    'Quantity' => $item['Quantity'],
                    'Price' => $item['Price'] ?? 0,
                    'UnitName' => $item['UnitName'] ?? null,
                ]);
            }
            
            $this->logActivity($voucher, 'Create', 'Tạo phiếu xuất kho');
            
            return $voucher;
        });

        return response()->json(['message' => 'Tạo phiếu xuất thành công', 'voucher' => $voucher]);
    }

    public function parseOpeningStock(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $data = Excel::toArray(new \stdClass, $request->file('file'));
            // array[0] is the first sheet
            $rows = $data[0] ?? [];

            // Helper to clean keys (slugify or simple lowercase trim)
            // Maatwebsite Excel WithHeadingRow usually handles this if used with import class
            // But with toArray on basic object, we get raw rows or need to specify header usage?
            // Let's use a temporary Import class to get header processing for free or just simple array map if we assume row 1 is header.
            // Using a simple anonymous class with toArray is better.

            $importedItems = [];
            
            // Assuming first row is header if we use basic array, but let's try to be robust.
            // We'll use a specific Import class for parsing to handle headers correctly.
            // Or just manual mapping if headers are fixed.
            // The sample headers are: ma_san_pham, ten_san_pham, so_lo, han_dung, so_luong, don_gia
            
            // Let's assume the user uses the sample file. 
            // We need to map Vietnamese keys to our logic.
            
            // Let's use a simpler approach: use the OpeningStockParseImport class (we will create it inline or just use logic here if rows are simple).
            // Actually, let's just stick to the plan: use logic here.
            
            // Maatwebsite toArray returns headers as keys if we pass an object implementing WithHeadingRow?
            // Let's trying reading with WithHeadingRow on the fly? No.
            // Let's just assume row 0 is header.
            
            if (count($rows) < 2) return response()->json([]);
            
            $header = array_map(function($h) {
                return \Str::slug($h, '_');
            }, $rows[0]);
            
            // Map header index
            $map = array_flip($header);
            
            $reqKeys = ['ma_san_pham'];
            foreach ($reqKeys as $k) {
                if (!isset($map[$k])) {
                    // Try without slug?
                    return response()->json(['message' => 'File không đúng định dạng. Thiếu cột mã sản phẩm (ma_san_pham).'], 400);
                }
            }

            for ($i = 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                $code = $row[$map['ma_san_pham']] ?? null;
                if (!$code) continue;

                $product = Product::with(['unit', 'bids' => function($q) {
                    $q->orderBy('IsPriority', 'desc');
                }, 'medicine'])->where('Code', $code)->first();

                if ($product) {
                    // Extract Bidding
                    $priorityBid = $product->bids->first();
                    
                    $item = [
                        'productId' => (string)$product->Id,
                        'productName' => $product->Name,
                        'productCode' => $product->Code,
                        'unitName' => $product->unit->Name ?? $product->UnitName ?? 'Đơn vị',
                        'batchNumber' => $row[$map['so_lo'] ?? -1] ?? '',
                        'expiryDate' => $this->transformDate($row[$map['han_dung'] ?? -1] ?? null),
                        'quantity' => (int)($row[$map['so_luong'] ?? -1] ?? 1),
                        'price' => (float)($row[$map['don_gia'] ?? -1] ?? ($priorityBid->BidPrice ?? 0)),
                        // Bidding
                        'registrationNumber' => $product->medicine->RegistrationNumber ?? '',
                        'bidPackageCode' => $priorityBid->PackageCode ?? '',
                        'bidGroupCode' => $priorityBid->GroupCode ?? '',
                        'bidDecisionNumber' => $priorityBid->DecisionNumber ?? '',
                    ];
                    
                    $importedItems[] = $item;
                }
            }

            return response()->json($importedItems);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi đọc file: ' . $e->getMessage()], 500);
        }
    }

    private function transformDate($value)
    {
        if (!$value) return '';
        try {
            if (is_numeric($value)) {
                 return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
             return '';
        }
    }

    public function status(Request $request)
    {
         return response()->json(['expiring_soon' => [], 'expired' => []]);
    }

    public function getBatches(Request $request)
    {
        // Adapter for getBatches using InventorySnapshot
        $request->validate([
            'warehouse_id' => 'required|exists:Warehouses,Id',
            'product_id' => 'required|exists:Products,Id',
        ]);

        $snapshots = InventorySnapshot::where('InventorySnapshots.WarehouseId', $request->warehouse_id)
            ->where('InventorySnapshots.ProductId', $request->product_id)
            ->where('InventorySnapshots.Quantity', '>', 0)
            ->join('ItemBatches', function ($join) {
                $join->on('InventorySnapshots.ProductId', '=', 'ItemBatches.ProductId')
                     ->on('InventorySnapshots.BatchNumber', '=', 'ItemBatches.BatchNumber');
            })
            ->select(
                'InventorySnapshots.Id as id',
                'InventorySnapshots.BatchNumber as batch_code',
                'InventorySnapshots.Quantity as quantity',
                'InventorySnapshots.AveragePrice as import_price',
                'ItemBatches.ExpiryDate as expiry_date'
            )
            ->get();
            
        return response()->json($snapshots);
    }

    public function getNotes(Request $request)
    {
        $query = StockVoucher::with(['sourceWarehouse', 'targetWarehouse', 'partner', 'creator']);

        // Filter by Type
        if ($request->filled('type')) {
            if ($request->type === 'import') {
                $query->where('VoucherType', 'Import');
            } elseif ($request->type === 'export') {
                $query->whereIn('VoucherType', ['Export', 'Prescription']);
            }
        }

        // Filter by SubType
        if ($request->filled('sub_type')) {
             if ($request->sub_type === 'supplier') {
                 $query->whereNotNull('PartnerId');
             } elseif ($request->sub_type === 'opening' || $request->sub_type === 'opening_stock') {
                 $query->whereNull('PartnerId')->where('VoucherType', 'Import');
             } elseif ($request->sub_type === 'prescription') {
                 $query->where('VoucherType', 'Prescription');
             } elseif ($request->sub_type === 'retail') {
                 $query->where('VoucherType', 'Retail');
             } elseif ($request->sub_type === 'internal') {
                 // ... internal logic ...
                 $query->where(function($q) use ($request) {
                     if ($request->type === 'import') {
                         $q->whereNotNull('SourceWarehouseId');
                     } elseif ($request->type === 'export') {
                         $q->whereNotNull('TargetWarehouseId');
                     } else {
                         $q->whereNotNull('SourceWarehouseId')
                           ->whereNotNull('TargetWarehouseId');
                     }
                 });
             } elseif ($request->sub_type === 'manual' || $request->sub_type === 'consumable') {
                 // Exports that are NOT internal (No Target Warehouse) and NOT Prescription
                 $query->where('VoucherType', 'Export')
                       ->whereNull('TargetWarehouseId');
             }
        }

        // Filter by Date
        if ($request->filled('from_date')) {
            $query->whereDate('VoucherDate', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('VoucherDate', '<=', $request->to_date);
        }

        // Search
        if ($request->filled('code')) {
            $code = $request->code;
            $query->where(function($q) use ($code) {
                $q->where('Code', 'like', "%{$code}%")
                  ->orWhere('InvoiceNo', 'like', "%{$code}%");
            });
        }

        $limit = $request->input('limit', 10);
        return response()->json($query->with(['targetWarehouse', 'sourceWarehouse', 'creator', 'partner'])
            ->latest('CreatedAt')
            ->paginate($limit));
    }

    public function getNoteDetail($id)
    {
        $voucher = StockVoucher::with(['details.product', 'sourceWarehouse', 'targetWarehouse'])->findOrFail($id);
        return response()->json($voucher);
    }

    public function getFEFOBatches(Request $request)
    {
        // FEFO Logic using InventorySnapshot + ItemBatch (for expiry)
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:Warehouses,Id',
            'product_id' => 'required|exists:Products,Id',
            'quantity_needed' => 'required|numeric|min:0',
        ]);
        
        // Join Snapshot with ItemBatch to get Expiry
        $batches = InventorySnapshot::join('ItemBatches', function($join) {
                $join->on('InventorySnapshots.ProductId', '=', 'ItemBatches.ProductId')
                     ->on('InventorySnapshots.BatchNumber', '=', 'ItemBatches.BatchNumber');
            })
            ->where('InventorySnapshots.WarehouseId', $validated['warehouse_id'])
            ->where('InventorySnapshots.ProductId', $validated['product_id'])
            ->where('InventorySnapshots.Quantity', '>', 0)
            ->where('ItemBatches.ExpiryDate', '>=', now())
            ->orderBy('ItemBatches.ExpiryDate', 'asc')
            ->select('InventorySnapshots.*', 'ItemBatches.ExpiryDate')
            ->get();

        // Allocation Logic...
        // Simplified for now
         return response()->json(['batches' => $batches]);
    }

    public function recordColdChainTemperature(Request $request)
    {
         return response()->json(['message' => 'Pending implementation']);
    }

    public function getStockAlerts(Request $request)
    {
         return response()->json([]);
    }

    public function resolveStockAlert(Request $request, $id)
    {
         return response()->json(['message' => 'Pending implementation']);
    }

    public function generateStockAlerts()
    {
         return response()->json(['message' => 'Pending implementation']);
    }
    public function getAllProductsForOpeningStock()
    {
        try {
            $products = Product::where('IsActive', true)
                ->with(['unit', 'bids' => function($q) {
                    $q->orderBy('IsPriority', 'desc');
                }, 'medicine'])
                ->get();

            $items = $products->map(function ($product) {
                $priorityBid = $product->bids->first();
                return [
                    'productId' => (string)$product->Id,
                    'productName' => $product->Name,
                    'productCode' => $product->Code,
                    'unitName' => $product->unit->Name ?? $product->UnitName ?? 'Đơn vị',
                    'batchNumber' => '',
                    'expiryDate' => '',
                    'quantity' => 1,
                    'price' => (float)($priorityBid->BidPrice ?? 0),
                    // Bidding
                    'registrationNumber' => $product->medicine->RegistrationNumber ?? '',
                    'bidPackageCode' => $priorityBid->PackageCode ?? '',
                    'bidGroupCode' => $priorityBid->GroupCode ?? '',
                    'bidDecisionNumber' => $priorityBid->DecisionNumber ?? '',
                ];
            });

            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Lỗi tải danh sách sản phẩm: ' . $e->getMessage()], 500);
        }
    }

    // --- Status & Logging ---

    private function logActivity($subject, $action, $description = null, $properties = [])
    {
        \App\Models\ActivityLog::create([
            'SubjectType' => class_basename($subject),
            'SubjectId' => $subject->Id,
            'Action' => $action,
            'Description' => $description,
            'CauserId' => Auth::id(),
            'Properties' => $properties,
            'CreatedAt' => now()
        ]);
    }

    public function updateImportNote(Request $request, $id)
    {
        $voucher = StockVoucher::findOrFail($id);

        if ($voucher->Status !== 'Pending') {
            return response()->json(['message' => 'Chỉ có thể sửa phiếu khi ở trạng thái Tạm lưu'], 400);
        }

        // Validate similar to Create
        $request->validate([
            'invoiceNo' => 'required|string',
            'invoiceDate' => 'required|date',
            'Details' => 'required|array|min:1',
        ]);

        DB::transaction(function () use ($request, $voucher) {
            // Log Old Values
            $oldValues = $voucher->toArray();

            // Update Voucher
            $voucher->update([
                'VoucherDate' => $request->voucherDate ?? now(),
                'InvoiceNo' => $request->invoiceNo,
                'SerialNo' => $request->serialNo,
                'InvoiceDate' => $request->invoiceDate,
                'FundingSource' => $request->fundingSource,
                'DelivererName' => $request->deliverer,
                'ReceiverName' => $request->receiver,
                'Description' => $request->description,
                'VATRate' => $request->vatRate ?? 0,
                'PartnerId' => $request->supplierId,
                'UpdatedBy' => Auth::id(),
            ]);

            // Sync Details: Strategy -> Delete all and recreate (easiest for full sync) 
            // OR diff check. For simplicity: Delete & Recreate, but keep IDs if possible?
            // Let's go with Delete & Recreate for now as it's cleaner for complex sub-items
            StockVoucherDetail::where('VoucherId', $voucher->Id)->delete();
            
            foreach ($request->Details as $item) {
                 ItemBatch::firstOrCreate(
                    ['ProductId' => $item['ProductId'], 'BatchNumber' => $item['BatchNumber']],
                    ['ExpiryDate' => $item['ExpiryDate']]
                );

                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $item['ProductId'],
                    'BatchNumber' => $item['BatchNumber'],
                    'ExpiryDate' => $item['ExpiryDate'],
                    'Quantity' => $item['Quantity'],
                    'Price' => $item['Price'] ?? 0,
                    'VATRate' => $item['VATRate'] ?? 0,
                    'RequestedQuantity' => $item['RequestedQuantity'] ?? null,
                    'ConversionRate' => $item['ConversionRate'] ?? 1,
                    'UnitName' => $item['UnitName'] ?? null,
                    'Currency' => $item['Currency'] ?? 'VND',
                    'ExchangeRate' => $item['ExchangeRate'] ?? 1,
                    'SellingPrice' => $item['SellingPrice'] ?? 0,
                    'VATAmount' => $item['VATAmount'] ?? 0,
                    'TotalAmount' => $item['TotalAmount'] ?? 0,
                    'Discount' => $item['Discount'] ?? 0,
                    'Surcharge' => $item['Surcharge'] ?? 0,
                    'RegistrationNumber' => $item['RegistrationNumber'] ?? null,
                    'ApprovalOrder' => $item['ApprovalOrder'] ?? null,
                    'BidPackageCode' => $item['BidPackageCode'] ?? null,
                    'BidGroup' => $item['BidGroup'] ?? null,
                    'BidDecision' => $item['BidDecision'] ?? null, 
                ]);
            }

            $this->logActivity($voucher, 'Update', 'Cập nhật phiếu nhập', ['old' => $oldValues, 'new' => $request->all()]);
        });

        return response()->json(['message' => 'Cập nhật thành công']);
    }

    public function statusAction(Request $request, $id)
    {
        $voucher = StockVoucher::findOrFail($id);

        $request->validate([
            'status' => 'required|string|in:Pending,Approved,Rejected,Cancelled',
        ]);

        $newStatus = $request->input('status');
        $oldStatus = $voucher->Status;

        if ($oldStatus === $newStatus) {
            return response()->json(['message' => 'Trạng thái không thay đổi'], 200);
        }

        // Prevent modifying finalized vouchers
        if ($oldStatus === 'Approved' || $oldStatus === 'Rejected' || $oldStatus === 'Cancelled') {
            return response()->json(['message' => 'Không thể thay đổi trạng thái phiếu đã hoàn tất'], 400);
        }

        DB::transaction(function () use ($voucher, $newStatus, $oldStatus) {
            $voucher->update([
                'Status' => $newStatus, 
                'UpdatedBy' => Auth::id(),
                'ApprovedDate' => ($newStatus === 'Approved') ? now() : null
            ]);
            
            $this->logActivity($voucher, 'StatusChange', "Cập nhật trạng thái từ $oldStatus sang $newStatus");

            // Auto-create Import Voucher if Export is Approved and has TargetWarehouse
            if ($newStatus === 'Approved' && 
                $voucher->VoucherType === 'Export' && 
                $voucher->TargetWarehouseId) {
                
                $importCode = str_replace('EXP', 'IMP', $voucher->Code) . '-AUTO';
                if (StockVoucher::where('Code', $importCode)->exists()) {
                    $importCode = 'IMP-' . time() . '-AUTO';
                }

                $importVoucher = StockVoucher::create([
                    'Code' => $importCode,
                    'VoucherDate' => now(), // Import date = Approval date
                    'VoucherType' => 'Import',
                    'SourceWarehouseId' => $voucher->SourceWarehouseId, // From Source
                    'TargetWarehouseId' => $voucher->TargetWarehouseId, // To Target
                    'RelatedVoucherId' => $voucher->Id,
                    'Status' => 'Pending', // Wait for receiver confirmation
                    'Description' => 'Phiếu nhập tự động từ phiếu xuất ' . $voucher->Code,
                    'CreatedBy' => Auth::id(), // Or System?
                    'ReceiverName' => $voucher->ReceiverName,
                    'DelivererName' => $voucher->DelivererName,
                ]);

                // Clone Details
                foreach ($voucher->details as $detail) {
                    StockVoucherDetail::create([
                        'VoucherId' => $importVoucher->Id,
                        'ProductId' => $detail->ProductId,
                        'BatchNumber' => $detail->BatchNumber,
                        'ExpiryDate' => $detail->ExpiryDate,
                        'Quantity' => $detail->Quantity,
                        'Price' => $detail->Price,
                        'UnitName' => $detail->UnitName,
                        'VATRate' => $detail->VATRate,
                    ]);
                }

                $this->logActivity($importVoucher, 'AutoCreate', 'Tự động tạo từ phiếu xuất ' . $voucher->Code);
            }
        });

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);

    }

    public function getRealtimeInventory(Request $request)
    {
        $limit = $request->get('limit', 30);
        $warehouseId = $request->get('warehouse_id');
        $search = $request->get('search');

        $query = Product::where('IsActive', true)->with(['unit', 'medicine']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('Name', 'like', "%{$search}%")
                  ->orWhere('Code', 'like', "%{$search}%");
            });
        }

        $products = $query->paginate($limit);
        $productIds = $products->pluck('Id');

        // Fetch Snapshots
        $snapshotQuery = InventorySnapshot::whereIn('ProductId', $productIds);
        if ($warehouseId) {
            $snapshotQuery->where('WarehouseId', $warehouseId);
        }
        // If multiple warehouses (no ID), we sum up snapshots?
        // Logic: Group by ProductId and Sum Quantity?
        // Or just get all and sum in PHP.
        $snapshots = $snapshotQuery->get()->groupBy('ProductId');

        // Fetch Voucher Details (Approved only)
        $detailQuery = StockVoucherDetail::join('StockVouchers', 'StockVouchers.Id', '=', 'StockVoucherDetails.VoucherId')
            ->whereIn('StockVoucherDetails.ProductId', $productIds)
            ->where('StockVouchers.Status', 'Approved');
        
        if ($warehouseId) {
            $detailQuery->where(function($q) use ($warehouseId) {
                $q->where('StockVouchers.TargetWarehouseId', $warehouseId)
                  ->orWhere('StockVouchers.SourceWarehouseId', $warehouseId);
            });
        }

        $details = $detailQuery->select(
            'StockVoucherDetails.ProductId', 
            'StockVoucherDetails.Quantity', 
            'StockVouchers.VoucherType', 
            'StockVouchers.VoucherDate',
            'StockVouchers.TargetWarehouseId',
            'StockVouchers.SourceWarehouseId'
        )->get()->groupBy('ProductId');

        $result = $products->getCollection()->map(function ($product) use ($snapshots, $details, $warehouseId) {
            $pId = $product->Id;
            
            // 1. Calculate Base from Snapshot
            // Caution: If multiple warehouses, we might have multiple snapshots.
            // We need to handle "SnapshotDate" accurately. 
            // Assumption: SnapshotDate is roughly synced or we take the MAX date?
            // "Bảng InventorySnapshots chỉ tính lại vào đầu tháng". 
            // So we can assume all snapshots for a product are relevant "Checkpoints".
            // HOWEVER, if we sum across warehouses, we might have different Snapshot Dates.
            // Complex case: Warehouse A snap 01/01, Warehouse B snap 01/02.
            // Simplification: We iterate snapshots. For each snapshot, we have a Quantity and Date.
            // BUT vouchers are also per warehouse.
            // Correct Logic per Product:
            // TotalStock = 0.
            // If warehouse_id is specific:
            //    Base = Snapshot(W, P).Qty
            //    Delta = Sum(In) - Sum(Out) WHERE Date > Snapshot(W, P).Date AND (Target=W OR Source=W)
            // If warehouse_id is NULL (All):
            //    Iterate all Warehouses? No, that's too hard.
            //    Alternative: Just Sum All Snapshots + Sum All Vouchers (Time > SnapDate)?
            //    If we assume Snapshots are "Global" or "Per Warehouse", we need to align Vouchers to them.
            //    Let's do: For each Product, iterate its Snapshots (per warehouse).
            
            $productSnapshots = $snapshots->get($pId) ?? collect();
            $productDetails = $details->get($pId) ?? collect();

            $totalStock = 0;

            // We need to map details to warehouses if possible, OR just process generically if we assume snapshot is the "cut-off".
            // Problem: If we have a snapshot for W1 at T1, and W2 at T2.
            // Voucher V1 for W1 at T3 (T3 > T1) -> Include.
            // Voucher V2 for W2 at T0 (T0 < T2) -> Exclude (already in snapshot).
            
            // So we must group calculation by Warehouse.
            // If a warehouse has NO snapshot, assumed 0 and Start Date = Beginning of Time?
            
            // Get all involved Warehouse IDs from Snapshots AND Details
            $warehouseIds = $productSnapshots->pluck('WarehouseId')
                ->merge($productDetails->pluck('TargetWarehouseId'))
                ->merge($productDetails->pluck('SourceWarehouseId'))
                ->unique()
                ->filter(); // remove nulls
            
            if ($warehouseId) {
                $warehouseIds = collect([$warehouseId]);
            }

            foreach ($warehouseIds as $wId) {
                // Find Snapshot for this W
                $snap = $productSnapshots->where('WarehouseId', $wId)->sortByDesc('SnapshotDate')->first();
                $baseQty = $snap ? $snap->Quantity : 0;
                $snapDate = $snap ? $snap->SnapshotDate : '1900-01-01'; // Far past

                // Calculate Delta for this W
                $delta = $productDetails->reduce(function ($carry, $d) use ($wId, $snapDate) {
                    // Check Date
                    if ($d->VoucherDate <= $snapDate) return $carry;

                    // Check Warehouse Role
                    $isTarget = $d->TargetWarehouseId == $wId;
                    $isSource = $d->SourceWarehouseId == $wId;

                    if (!$isTarget && !$isSource) return $carry;

                    // Import to W (isTarget) -> Add
                    // Export from W (isSource) -> Subtract
                    // BUT VoucherType also matters.
                    // VoucherType=Import: usually Target=W. (Source is Partner or NULL or Other W if internal).
                    // VoucherType=Export: usually Source=W. (Target is NULL or Other W).
                    
                    // Logic:
                    // In-flow: (Type=Import AND Target=W) OR (Type=Export AND Target=W [Internal Transfer])
                    // Out-flow: (Type=Export AND Source=W) OR (Type=Import AND Source=W [Internal Transfer?? No usually Export])
                    
                    // Simplified based on StockVoucher logic:
                    // Import Voucher: Into Target.
                    // Export Voucher: Out of Source.
                    
                    if ($d->VoucherType === 'Import' && $isTarget) {
                        return $carry + $d->Quantity;
                    }
                    if ($d->VoucherType === 'Export' && $isSource) {
                        return $carry - $d->Quantity;
                    }
                    
                    // Internal Transfer cases (Active Vouchers usually have ONE type)
                    // If Voucher is "Import" but we are Source? (Return to supplier?) - Rare/Not impl.
                    // If Voucher is "Export" (Transfer) and we are Target? 
                    // Usually Internal Transer creates an Import voucher for the target (auto-generated).
                    // So we only care about the primary direction of the voucher type.
                    
                    return $carry;
                }, 0);

                $totalStock += ($baseQty + $delta);
            }

            return [
                'Id' => $product->Id,
                'Code' => $product->Code,
                'Name' => $product->Name,
                'Unit' => $product->unit->Name ?? '---',
                'ActiveIngredient' => $product->medicine->ActiveIngredientName ?? '',
                'Stock' => $totalStock
            ];
        });

        $products->setCollection($result);

        return response()->json($products);
    }

    public function getProductHistory(Request $request, $id)
    {
        $warehouseId = $request->get('warehouse_id');
        $product = Product::with('unit')->findOrFail($id);

        // 1. Calculate Realtime Stock per Batch
        // Get Snapshots
        $snapshotQuery = InventorySnapshot::where('ProductId', $id);
        if ($warehouseId) {
            $snapshotQuery->where('WarehouseId', $warehouseId);
        }
        $snapshots = $snapshotQuery->get();

        // Get Approved Voucher Details (In/Out)
        // We need details to calculate realtime stock AND to show history.
        $detailsQuery = StockVoucherDetail::join('StockVouchers', 'StockVouchers.Id', '=', 'StockVoucherDetails.VoucherId')
            ->where('StockVoucherDetails.ProductId', $id)
            ->whereIn('StockVouchers.Status', ['Approved', 'Completed']);
            
        if ($warehouseId) {
            $detailsQuery->where(function($q) use ($warehouseId) {
                $q->where('StockVouchers.TargetWarehouseId', $warehouseId)
                  ->orWhere('StockVouchers.SourceWarehouseId', $warehouseId);
            });
        }

        $allDetails = $detailsQuery->select(
            'StockVoucherDetails.*',
            'StockVouchers.VoucherType',
            'StockVouchers.VoucherDate',
            'StockVouchers.Code as VoucherCode',
            'StockVouchers.TargetWarehouseId',
            'StockVouchers.SourceWarehouseId',
            'StockVouchers.PartnerId',
            'StockVouchers.Description'
        )
        ->orderBy('StockVouchers.VoucherDate', 'desc')
        ->orderBy('StockVouchers.CreatedAt', 'desc')
        ->get();

        // A. Calculate Batches
        // Identify all batches involved
        $batchNumbers = $snapshots->pluck('BatchNumber')
            ->merge($allDetails->pluck('BatchNumber'))
            ->unique()
            ->filter()
            ->values();

        $batches = [];
        
        foreach ($batchNumbers as $batchNumber) {
            // Filter relevant data for this batch
            $batchSnapshots = $snapshots->where('BatchNumber', $batchNumber);
            $batchDetails = $allDetails->where('BatchNumber', $batchNumber);
            
            // We need to sum up across warehouses (or single if filtered)
            // Strategy: 
            // 1. Identify all warehouses involved for this batch
            $wIds = $batchSnapshots->pluck('WarehouseId')
                ->merge($batchDetails->pluck('TargetWarehouseId'))
                ->merge($batchDetails->pluck('SourceWarehouseId'))
                ->unique()
                ->filter();
            
            if ($warehouseId) $wIds = collect([$warehouseId]);

            $totalBatchStock = 0;
            $expiryDate = null; // Take from snapshot or detail

            foreach ($wIds as $wId) {
                // Latest Snapshot for this Warehouse & Batch
                $snap = $batchSnapshots->where('WarehouseId', $wId)->sortByDesc('SnapshotDate')->first();
                $baseQty = $snap ? $snap->Quantity : 0;
                $snapDate = $snap ? $snap->SnapshotDate : '1900-01-01';
                
                if ($snap && $snap->ExpiryDate) $expiryDate = $snap->ExpiryDate;

                // Calculate Delta
                $delta = $batchDetails->reduce(function ($carry, $d) use ($wId, $snapDate) {
                    if ($d->VoucherDate <= $snapDate) return $carry; // Already in snapshot

                    $isTarget = $d->TargetWarehouseId == $wId;
                    $isSource = $d->SourceWarehouseId == $wId;

                    if ($d->VoucherType === 'Import' && $isTarget) return $carry + $d->Quantity;
                    if ($d->VoucherType === 'Export' && $isSource) return $carry - $d->Quantity;
                    // Prescription/Retail are types of Export usually? 
                    // If VoucherType is Prescription/Retail, it maps to Export logic generally (Source=W).
                    if (in_array($d->VoucherType, ['Prescription', 'Retail']) && $isSource) return $carry - $d->Quantity;

                    return $carry;
                }, 0);

                $totalBatchStock += ($baseQty + $delta);
            }
            
            // Try to find expiry if not in snapshot
            if (!$expiryDate) {
                $eDetail = $batchDetails->whereNotNull('ExpiryDate')->first();
                $expiryDate = $eDetail ? $eDetail->ExpiryDate : null;
            }

            if ($totalBatchStock != 0) {
                 $batches[] = [
                    'BatchNumber' => $batchNumber,
                    'ExpiryDate' => $expiryDate,
                    'Quantity' => $totalBatchStock
                ];
            }
        }

        // B. History
        // Format $allDetails for display
        $history = $allDetails->map(function($d) {
            return [
                'Id' => $d->Id, // Voucher Detail Id? Or Voucher Id? Let's use VoucherId for link
                'VoucherId' => $d->VoucherId,
                'VoucherCode' => $d->VoucherCode,
                'VoucherDate' => $d->VoucherDate,
                'Type' => $d->VoucherType,
                'Description' => $d->Description,
                'Quantity' => $d->Quantity,
                'BatchNumber' => $d->BatchNumber,
                'PartnerName' => '', // TODO: fetch partner name or warehouse name?
                // For now, simpler is better.
            ];
        });

        return response()->json([
            'product' => $product,
            'batches' => $batches,
            'history' => $history
        ]);
    }
    
    /*
    private function updateSnapshot($voucher, $detail, $action)
    {
        // Snapshot realtime update disabled as per new logic (Monthly Snapshot + Realtime Calcs)
        // This method is deprecated but kept for reference or legacy data fixes.
        return;

        $warehouseId = ($voucher->VoucherType === 'Import') ? $voucher->TargetWarehouseId : $voucher->SourceWarehouseId;
        
        $snapshot = InventorySnapshot::firstOrCreate(
            ['WarehouseId' => $warehouseId, 'ProductId' => $detail->ProductId, 'BatchNumber' => $detail->BatchNumber],
            ['Quantity' => 0, 'AveragePrice' => $detail->Price ?? 0, 'SnapshotDate' => now()]
        );

        $isImport = $voucher->VoucherType === 'Import';
        $increment = false;

        if ($action === 'approve') {
            $increment = $isImport; 
        } elseif ($action === 'revert' || $action === 'cancel') {
             $increment = !$isImport; 
        }

        if ($increment) {
             $snapshot->increment('Quantity', $detail->Quantity);
        } else {
             $snapshot->decrement('Quantity', $detail->Quantity);
        }
    }
    */
}
