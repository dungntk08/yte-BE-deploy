<?php

namespace App\Imports;

use App\Models\Product;
use App\Models\WarehouseBatch;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class OpeningStockImport implements ToModel, WithHeadingRow, SkipsEmptyRows
{
    protected $warehouseId;
    protected $accountId;

    public function __construct(string $warehouseId, string $accountId)
    {
        $this->warehouseId = $warehouseId;
        $this->accountId = $accountId;
    }

    public function model(array $row)
    {
        // 1. Find Product by Code
        $productCode = $row['ma_thuoc'] ?? null;
        if (!$productCode) {
            return null; // Skip if no code
        }

        $product = Product::where('account_id', $this->accountId)
                          ->where('code', $productCode)
                          ->first();

        if (!$product) {
            // Log or handle error? For now, skip or maybe try dmdc_code?
            // Let's try dmdc_code as fallback
             $product = Product::where('account_id', $this->accountId)
                          ->where('dmdc_code', $productCode)
                          ->first();
        }

        if (!$product) {
             return null; // Product not found
        }

        // 2. Parse Date
        $expiryDate = $this->transformDate($row['han_dung'] ?? null);
        if (!$expiryDate) {
            // Default to something or skip? Skip for safety
            return null; 
        }

        // 3. Create or Update Batch
        // "Opening Stock" usually means adding to existing or creating new.
        // If batch exists in this warehouse, we increase quantity? Or set it?
        // Usually "Import" adds to it.
        
        return new WarehouseBatch([
            'warehouse_id' => $this->warehouseId,
            'product_id'   => $product->id,
            'batch_code'   => $row['so_lo'] ?? 'UNKNOWN',
            'expiry_date'  => $expiryDate,
            'quantity'     => $row['so_luong'] ?? 0,
            'import_price' => $row['don_gia'] ?? 0,
        ]);
    }

    private function transformDate($value)
    {
        if (!$value) return null;
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value)->format('Y-m-d');
            }
            // Try standard formats
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }
    }
}
