<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $fillable = [
        'name',
        'email',
        'password',
        'account_id',
        'role_id',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function hasRole($role)
    {
        return $this->role && $this->role->name === $role;
    }

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'warehouse_user');
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];
    /**
     * Check if the user has a specific permission rule.
     */
    public function hasPermission($ruleCode)
    {
        if (!$this->role) {
            return false;
        }

        // Check if role has the specific rule
        return $this->role->rules()->where('code', $ruleCode)->exists();
    }
}
