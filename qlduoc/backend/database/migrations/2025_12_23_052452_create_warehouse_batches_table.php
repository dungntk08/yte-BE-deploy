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
        Schema::create('warehouse_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('product_id')->index();
            $table->string('batch_code'); // Mã lô
            $table->date('expiry_date'); // Hạn sử dụng
            $table->integer('quantity')->default(0);
            $table->decimal('import_price', 15, 2)->default(0);
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');

            // Index for faster lookup
            $table->index(['product_id', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_batches');
    }
};
