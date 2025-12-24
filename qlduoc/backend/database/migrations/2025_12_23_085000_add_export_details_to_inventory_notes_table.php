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
        Schema::table('inventory_notes', function (Blueprint $table) {
            $table->uuid('inventory_request_id')->nullable()->index();
            $table->uuid('destination_warehouse_id')->nullable(); // For internal transfer
            $table->uuid('receiver_id')->nullable(); // For User receiving
            $table->string('receiver_name')->nullable(); // Or text name if external person
            
            $table->foreign('inventory_request_id')->references('id')->on('inventory_requests');
            $table->foreign('destination_warehouse_id')->references('id')->on('warehouses');
            $table->foreign('receiver_id')->references('id')->on('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_notes', function (Blueprint $table) {
             $table->dropForeign(['inventory_request_id']);
             $table->dropForeign(['destination_warehouse_id']);
             $table->dropForeign(['receiver_id']);
             $table->dropColumn(['inventory_request_id', 'destination_warehouse_id', 'receiver_id', 'receiver_name']);
        });
    }
};
