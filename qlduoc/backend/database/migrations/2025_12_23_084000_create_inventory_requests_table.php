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
        Schema::create('inventory_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('account_id')->index();
            $table->string('code')->unique();
            $table->uuid('request_warehouse_id'); // Warehouse requesting stock
            $table->uuid('supply_warehouse_id'); // Warehouse supplying stock
            $table->uuid('created_by');
            $table->string('status')->default('pending'); // pending, approved, rejected, completed
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('account_id')->references('id')->on('accounts')->onDelete('cascade');
            $table->foreign('request_warehouse_id')->references('id')->on('warehouses');
            $table->foreign('supply_warehouse_id')->references('id')->on('warehouses');
            $table->foreign('created_by')->references('id')->on('users');
        });

        Schema::create('inventory_request_details', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('inventory_request_id')->index();
            $table->uuid('product_id');
            $table->integer('quantity');
            $table->string('unit')->nullable();
            $table->timestamps();

            $table->foreign('inventory_request_id')->references('id')->on('inventory_requests')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_request_details');
        Schema::dropIfExists('inventory_requests');
    }
};
