<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Rule extends Model
{
    use HasUuids;
    protected $fillable = ['code', 'description'];

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }
}
