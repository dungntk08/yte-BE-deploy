<?php

namespace App\Imports;

use App\Models\Product;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Carbon\Carbon;

class OpeningStockParse implements ToCollection, WithHeadingRow, SkipsEmptyRows
{
    protected $accountId;

    public function __construct(string $accountId)
    {
        $this->accountId = $accountId;
    }

    public function collection(Collection $rows)
    {
        // This will be processed in the controller or we transform it here
        // But ToCollection just returns the collection to the caller of Excel::toArray/toCollection? 
        // No, 'collection' method is called by the importer.
        
        // Actually simpler: Use Excel::toArray(), but we need the lookup logic.
        // So let's just make a method that transforms the rows.
        
        $results = [];

        foreach ($rows as $row) {
            $productCode = $row['ma_thuoc'] ?? null;
            if (!$productCode) continue;

            $product = Product::where('account_id', $this->accountId)
                          ->where('code', $productCode)
                          ->orWhere(function($q) use ($productCode) {
                              $q->where('account_id', $this->accountId)->where('dmdc_code', $productCode);
                          })
                          ->first();

            if ($product) {
                $results[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name, // Optional, for UI convenience
                    'batch_code' => $row['so_lo'] ?? '',
                    'expiry_date' => $this->transformDate($row['han_dung'] ?? null),
                    'quantity' => $row['so_luong'] ?? 0,
                    'price' => $row['don_gia'] ?? 0,
                ];
            }
        }
        
        return collect($results);
    }
    
    // We need to access this result. 
    // Typically with ToCollection, we might want to store it in a public property.
    
    public $data = [];
    
    // Re-implementing to populate $data
    // Wait, ToCollection interface requires 'collection' method which receives the collection.
    // We can process it there and assign to $this->data.
}
