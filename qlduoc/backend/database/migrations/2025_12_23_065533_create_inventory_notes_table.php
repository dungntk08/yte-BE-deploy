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
        Schema::create('inventory_notes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique(); // Mã phiếu (e.g. PN001)
            $table->string('type'); // import / export
            $table->uuid('warehouse_id');
            $table->uuid('created_by');
            $table->integer('status')->default(1); // 1: Completed, 0: Draft/Cancelled
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_notes');
    }
};
