<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Supplier;
use Ramsey\Uuid\Uuid;

class SupplierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = __DIR__ . '/DM_NhaCungCap.csv';
        
        if (!file_exists($csvFile)) {
            $this->command->error("CSV file not found at: $csvFile");
            return;
        }

        $file = fopen($csvFile, 'r');
        $header = fgetcsv($file); // Skip header

        // "NguonNhapID","Ten","DiaChi","TinhThanh","QuocGia","DienThoai","Fax","GhiChu","Email","WebSite","Loai","HienThi"
        // 0: NguonNhapID, 1: Ten, 2: DiaChi, 3: TinhThanh, 4: QuocGia, 5: DienThoai, 8: Email

        $batch = [];
        $now = now();
        
        // Use a transaction or chunk insert for speed
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                // Determine Address
                $addressParts = [];
                if (!empty($row[2])) $addressParts[] = $row[2];
                if (!empty($row[3])) $addressParts[] = $row[3];
                if (!empty($row[4])) $addressParts[] = $row[4];
                $fullAddress = implode(', ', $addressParts);

                // Prepare data
                // Limit phone length to fit DB if needed, but text is fine. Phone column is usually string.
                
                Supplier::updateOrCreate(
                    ['code' => $row[0], 'account_id' => null], // Key to check existing system supplier
                    [
                        'id' => Uuid::uuid4()->toString(),
                        'name' => $row[1] ?? 'Unknown',
                        'address' => substr($fullAddress, 0, 500),
                        'phone' => substr($row[5] ?? '', 0, 20),
                        'email' => substr($row[8] ?? '', 0, 255),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
            DB::commit();
            $this->command->info('Suppliers seeded successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Failed to seed suppliers: ' . $e->getMessage());
        }

        fclose($file);
    }
}
