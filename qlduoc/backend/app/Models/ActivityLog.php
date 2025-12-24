<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ActivityLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'action',
        'description',
        'model',
        'model_id',
        'payload',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
