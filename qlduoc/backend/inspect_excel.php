<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

$file = 'database/seeders/xem-ton-kho-chi-tiet_06_01_2026_10_04.xlsx';
try {
    $spreadsheet = IOFactory::load($file);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();
    
    // Print rows 5 to 15 (indices 4 to 14)
    print_r(array_slice($rows, 4, 11));
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
