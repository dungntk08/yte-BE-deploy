<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InventorySnapshot;
use App\Models\StockVoucherDetail;
use App\Models\Product;
use App\Models\Warehouse;

class ReportController extends Controller
{
    public function getInventoryCheck(Request $request)
    {
        // Support both single 'warehouse_id' and array 'warehouse_ids'
        $warehouseIds = $request->get('warehouse_ids');
        if (!$warehouseIds) {
             $singleId = $request->get('warehouse_id');
             if ($singleId) $warehouseIds = [$singleId];
        }

        if (empty($warehouseIds)) {
            return response()->json(['message' => 'Vui lòng chọn ít nhất một kho'], 400);
        }

        // Convert to array if string (comma separated) or just ensure it is array
        if (is_string($warehouseIds)) {
            $warehouseIds = explode(',', $warehouseIds);
        }

        $date = $request->get('date', date('Y-m-d')); // The "At Date"

        $warehouses = Warehouse::whereIn('Id', $warehouseIds)->get();
        $warehouseNames = $warehouses->pluck('Name')->join(', ');

        // Logic: Calculate Stock AT $date for the GROUP of warehouses.
        
        // 1. Get Snapshots
        $snapshots = InventorySnapshot::whereIn('WarehouseId', $warehouseIds)->get();

        // 2. Get Vouchers relative to Snapshot
        // We need ALL vouchers that touch ANY of the selected warehouses
        $details = StockVoucherDetail::join('StockVouchers', 'StockVouchers.Id', '=', 'StockVoucherDetails.VoucherId')
            ->whereIn('StockVouchers.Status', ['Approved', 'Completed'])
            ->where(function($q) use ($warehouseIds) {
                $q->whereIn('StockVouchers.TargetWarehouseId', $warehouseIds)
                  ->orWhereIn('StockVouchers.SourceWarehouseId', $warehouseIds);
            })
            ->select('StockVoucherDetails.*', 'StockVouchers.VoucherType', 'StockVouchers.VoucherDate', 'StockVouchers.TargetWarehouseId', 'StockVouchers.SourceWarehouseId')
            ->get();

        // 3. Get Products (for info)
        $products = Product::where('IsActive', true)->with('unit')->get()->keyBy('Id');

        // 4. Calculate
        // Group by Batch
        $batchKeys = $snapshots->pluck('BatchNumber')
            ->merge($details->pluck('BatchNumber'))
            ->unique()
            ->filter();

        $reportData = [];

        foreach ($batchKeys as $batchNumber) {
            // Find Product ID from meaningful sources
            $s = $snapshots->where('BatchNumber', $batchNumber)->first();
            $d = $details->where('BatchNumber', $batchNumber)->first();
            $productId = $s ? $s->ProductId : ($d ? $d->ProductId : null);
            
            if (!$productId || !isset($products[$productId])) continue;

            $product = $products[$productId];

            // Snapshot for this Batch across ALL selected warehouses
            // We sum up the snapshot quantities for the selected warehouses
            // Note: Different warehouses might have snapshots at different dates, but usually it's consistent.
            // We take the latest snapshot for EACH warehouse and sum them?
            // Safer: For each warehouse in list, find its latest snapshot for this batch, then sum.
            
            $baseQty = 0;
            // $snapDate is tricky if warehouses have diff snapshot dates.
            // But usually we just care about "Stock at Snapshot" + "Delta after Snapshot".
            // Let's assume we process each warehouse's contribution or simplified:
            // Actually, we can just process Deltas based on the item's involved warehouse's snapshot date?
            // Too complex. Let's assume single global Logic:
            // Base = Sum(Snapshots of selected warehouses). 
            // Delta = Scan vouchers. If In(Group) -> +Qty. If Out(Group) -> -Qty.
            // BUT we must only count vouchers AFTER the snapshot date of the *relevant* warehouse.
            
            // Simplified approach: Iterate all snapshots for this batch
            $relevantSnapshots = $snapshots->where('BatchNumber', $batchNumber);
            foreach ($relevantSnapshots as $snap) {
                $baseQty += $snap->Quantity;
            }
            
            // For Delta, we need to be careful about "Double Counting" if we transfer A->B and both are in Group.
            // And also "Voucher < Snapshot".
            
            // Let's deduce "Snapshot Date" for this batch. 
            // Usually snapshots are generated monthly. Let's use the MAX snapshot date found as the baseline?
            // Or just filter vouchers:
            // For a voucher item:
            //    If Target in Group:
            //        Check Snapshot Date of Target Warehouse.
            //        If VoucherDate > SnapshotDateOfTarget (or No Snapshot) AND VoucherDate <= ReportDate -> Add
            //    If Source in Group:
            //        Check Snapshot Date of Source Warehouse.
            //        If VoucherDate > SnapshotDateOfSource AND VoucherDate <= ReportDate -> Subtract
            
            // We need a map of WarehouseId -> LatestSnapshotDate for this batch
            $warehouseSnapDates = [];
            foreach ($relevantSnapshots as $snap) {
                // If multiple snapshots for same warehouse (weird), take latest
                if (!isset($warehouseSnapDates[$snap->WarehouseId]) || $snap->SnapshotDate > $warehouseSnapDates[$snap->WarehouseId]) {
                    $warehouseSnapDates[$snap->WarehouseId] = $snap->SnapshotDate;
                }
            }

            $delta = $details->where('BatchNumber', $batchNumber)->reduce(function ($carry, $item) use ($warehouseIds, $warehouseSnapDates, $date) {
                if ($item->VoucherDate > $date) return $carry;

                $change = 0;
                
                // Income to Group
                if (in_array($item->TargetWarehouseId, $warehouseIds)) {
                     $snapDate = $warehouseSnapDates[$item->TargetWarehouseId] ?? '1900-01-01';
                     if ($item->VoucherDate > $snapDate) {
                         $change += $item->Quantity;
                     }
                }

                // Outcome from Group
                if (in_array($item->SourceWarehouseId, $warehouseIds)) {
                     $snapDate = $warehouseSnapDates[$item->SourceWarehouseId] ?? '1900-01-01';
                     if ($item->VoucherDate > $snapDate) {
                         $change -= $item->Quantity;
                     }
                }

                return $carry + $change;
            }, 0);

            $finalQty = $baseQty + $delta;

            if ($finalQty > 0 || $baseQty > 0) {
                 if ($finalQty <= 0) continue;

                 $expiry = $s ? $s->ExpiryDate : ($d ? $d->ExpiryDate : null);
                 $price = $s ? $s->Price : ($d ? $d->Price : 0);

                $reportData[] = [
                    'product_code' => $product->Code,
                    'product_name' => $product->Name,
                    'unit' => $product->unit->Name ?? '',
                    'country' => $product->CountryOfOrigin ?? '',
                    'batch_number' => $batchNumber,
                    'expiry_date' => $expiry,
                    'book_quantity' => $finalQty,
                    'unit_price' => $price,
                    'total_amount' => $finalQty * $price
                ];
            }
        }

        // Sort by Name
        usort($reportData, function($a, $b) {
            return strcmp($a['product_name'], $b['product_name']);
        });

        return response()->json([
            'warehouse' => ['Name' => $warehouseNames . (count($warehouseIds) > 1 ? ' (Tổng hợp)' : '')],
            'items' => $reportData,
            'date' => $date
        ]);
    }
}
