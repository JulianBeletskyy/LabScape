<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerType extends Model
{

    protected $table = 'rl_addresses_customerstatus_types';


    function addresses()
    {
        return $this->hasMany(Address::class);
    }


    function scopeVisible($q)
    {
        return $q->where('visible' ,'>',0);
    }

}
