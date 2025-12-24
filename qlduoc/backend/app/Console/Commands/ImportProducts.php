<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ImportProducts extends Command
{
    protected $signature = 'import:products {file} {email=demo@qlduoc.com}';
    protected $description = 'Import products from Excel file';

    public function handle()
    {
        $file = $this->argument('file');
        $email = $this->argument('email');

        $user = \App\Models\User::where('email', $email)->first();
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return;
        }

        $account = $user->account;
        if (!$account) {
             $this->error("User has no account.");
             return;
        }

        $category = \App\Models\Category::firstOrCreate(
            ['name' => 'Dược phẩm', 'account_id' => $account->id],
            ['description' => 'Imported category']
        );

        $this->info("Importing to Account: {$account->name} ({$account->id}) | Category: {$category->name}");

        try {
            \Maatwebsite\Excel\Facades\Excel::import(
                new \App\Imports\ProductsImport($account->id, $category->id), 
                $file
            );
            $this->info('Import completed successfully.');
        } catch (\Exception $e) {
            $this->error('Import failed: ' . $e->getMessage());
        }
    }
}
