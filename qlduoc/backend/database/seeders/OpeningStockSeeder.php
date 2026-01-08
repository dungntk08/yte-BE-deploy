<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\StockVoucher;
use App\Models\StockVoucherDetail;
use App\Models\ItemBatch;
use App\Models\Warehouse;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Carbon\Carbon;

class OpeningStockSeeder extends Seeder
{
    public function run()
    {
        $file = __DIR__ . '/xem-ton-kho-chi-tiet_06_01_2026_10_04.xlsx';

        if (!file_exists($file)) {
            $this->command->error("File not found: $file");
            return;
        }

        $this->command->info('Reading Excel file...');
        
        try {
            $spreadsheet = IOFactory::load($file);
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
        } catch (\Exception $e) {
            $this->command->error("Error loading file: " . $e->getMessage());
            return;
        }

        // Configuration
        $startRowIndex = 7; // Data starts from row 8 (index 7) based on inspection
        // Indices
        $idxCode = 5;
        $idxBatch = 6;
        $idxExpiry = 7;
        $idxPrice = 8;
        $idxQty = 23; // Tồn cuối

        // Check for warehouse or create one
        $warehouse = Warehouse::first();
        if (!$warehouse) {
             $this->command->info("No warehouse found. Creating default 'Kho Tổng'...");
             
             $medCenter = \App\Models\MedicalCenter::first();
             if (!$medCenter) {
                 $medCenter = \App\Models\MedicalCenter::create([
                     'Name' => 'Trung Tâm Y Tế Demo',
                     'Code' => 'MC_DEMO',
                     'IsActive' => true
                 ]);
             }
             
             // Check for HealthPost
             $healthPost = \App\Models\HealthPost::first();
             if (!$healthPost) {
                 $healthPost = \App\Models\HealthPost::create([
                     'Name' => 'Trạm Y Tế Demo',
                     'Code' => 'HP_DEMO',
                     'MedicalCenterId' => $medCenter->Id,
                     'IsActive' => true
                 ]);
             }

             // Check if ID is int or uuid? 
             // Try creating without ID first.
             $warehouse = Warehouse::create([
                 'Name' => 'Kho Tổng',
                 'Code' => 'KHOTONG',
                 'Type' => 'Central', // Assuming string
                 'MedicalCenterId' => $medCenter->Id,
                 'HealthPostId' => $healthPost->Id,
                 'IsActive' => true
             ]);
        }
        $warehouseId = $warehouse->Id;

        DB::beginTransaction();
        try {
            // Create a single Opening Stock Voucher
            $voucher = StockVoucher::create([
                'Code' => 'KHO-DAU-' . time(),
                'VoucherDate' => now(),
                'VoucherType' => 'Import',
                'TargetWarehouseId' => $warehouseId,
                'Status' => 'Completed', // Auto-approve
                'Description' => 'Nhập tồn đầu từ file Excel',
                'CreatedBy' => 1, // System or Admin
            ]);

            $count = 0;
            $productsCache = []; // Internal cache for Code -> Id

            for ($i = $startRowIndex; $i < count($rows); $i++) {
                $row = $rows[$i];
                
                $code = $row[$idxCode] ?? null;
                if (!$code) continue; // Skip empty rows

                // Clean Code
                $code = trim($code);

                // Find Product
                if (isset($productsCache[$code])) {
                    $productId = $productsCache[$code];
                } else {
                    $product = Product::where('Code', $code)->first();
                    if (!$product) {
                        $this->command->warn("Product not found for Code: $code at row " . ($i + 1));
                        continue;
                    }
                    $productId = $product->Id;
                    $productsCache[$code] = $productId;
                }

                // Batch & Expiry
                $batchNumber = trim($row[$idxBatch] ?? '');
                if (!$batchNumber) $batchNumber = 'DEFAULT'; // Fallback
                
                $expiryRaw = $row[$idxExpiry] ?? null;
                $expiryDate = null;
                if ($expiryRaw) {
                    try {
                         if (is_numeric($expiryRaw)) {
                             $expiryDate = \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($expiryRaw)->format('Y-m-d');
                         } else {
                             // Try parsing various formats d/m/Y
                             $expiryDate = Carbon::createFromFormat('d/m/Y', $expiryRaw)->format('Y-m-d');
                         }
                    } catch (\Exception $e) {
                        // Fallback: 1 year from now? Or just null
                        $expiryDate = now()->addYear()->format('Y-m-d');
                        $this->command->warn("Invalid date '$expiryRaw' at row " . ($i+1) . ". Defaulting to +1 year.");
                    }
                } else {
                     $expiryDate = now()->addYear()->format('Y-m-d');
                }

                // Quantity & Price
                // Remove commas
                $qtyStr = str_replace(',', '', $row[$idxQty] ?? '0');
                $priceStr = str_replace(',', '', $row[$idxPrice] ?? '0');
                
                $quantity = (float)$qtyStr;
                $price = (float)$priceStr;

                if ($quantity <= 0) continue;

                // Create ItemBatch if needed
                $itemBatch = ItemBatch::firstOrCreate(
                    ['ProductId' => $productId, 'BatchNumber' => $batchNumber],
                    ['ExpiryDate' => $expiryDate] // Only sets if created
                );
                
                // Update expiry if it was null/different? No, stick to first seen or update?
                // Let's update expiry if the new one is different and valid? 
                // Usually batch is unique.
                
                // Create Detail
                StockVoucherDetail::create([
                    'VoucherId' => $voucher->Id,
                    'ProductId' => $productId,
                    'BatchNumber' => $batchNumber,
                    'ExpiryDate' => $expiryDate,
                    'Quantity' => $quantity,
                    'Price' => $price,
                    'UnitName' => $product->UnitName ?? 'Đơn vị',
                ]);
                
                // Since Voucher is Completed, we SHOULD update InventorySnapshot
                // Simple Snapshot Logic:
                $snapshot = \App\Models\InventorySnapshot::firstOrNew([
                    'WarehouseId' => $warehouseId,
                    'ProductId' => $productId,
                    'BatchNumber' => $batchNumber,
                    'SnapshotDate' => now()->format('Y-m-d')
                ]);
                $snapshot->Quantity = ($snapshot->Quantity ?? 0) + $quantity;
                // Update Average Price? 
                // If existing, weighted average. If new, just price.
                // Simple avg:
                // oldVal = oldQty * oldPrice
                // newVal = newQty * newPrice
                // totalVal = oldVal + newVal
                // totalQty = oldQty + newQty
                // avg = totalVal / totalQty
                
                $oldQty = $snapshot->Quantity - $quantity; // Because we just added qty
                $oldPrice = $snapshot->AveragePrice ?? 0;
                
                if ($snapshot->exists) {
                     // Since we acted on 'firstOrNew', exists check is valid if it came from DB.
                     // But wait, we added quantity above? No, variables.
                     // $snapshot->Quantity IS NOT SAVED YET.
                     $oldQty = $snapshot->getOriginal('Quantity') ?? 0;
                } else {
                     $oldQty = 0;
                }
                
                $totalVal = ($oldQty * $oldPrice) + ($quantity * $price);
                $totalQty = $oldQty + $quantity;
                
                $snapshot->Quantity = $totalQty;
                if ($totalQty > 0) {
                    $snapshot->AveragePrice = $totalVal / $totalQty;
                }
                // $snapshot->ExpiryDate = $expiryDate; // Removed as column doesn't exist
                $snapshot->save();

                $count++;
            }

            DB::commit();
            $this->command->info("Imported $count items into Voucher {$voucher->Code}");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Import Failed: " . $e->getMessage());
            $this->command->error($e->getTraceAsString());
        }
    }
}
