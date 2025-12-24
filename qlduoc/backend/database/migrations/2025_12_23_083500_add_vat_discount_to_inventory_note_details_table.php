<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_note_details', function (Blueprint $table) {
            $table->decimal('vat', 5, 2)->default(0)->after('price')->comment('VAT percentage');
            $table->decimal('discount', 15, 2)->default(0)->after('vat')->comment('Discount amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_note_details', function (Blueprint $table) {
            $table->dropColumn(['vat', 'discount']);
        });
    }
};
