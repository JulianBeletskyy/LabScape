<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class People extends Model
{

    protected $table = 'rl_people';


    function addresses()
    {
        return $this->belongsToMany(Address::class, 'rl_address_people', 'person_id','address_id');
    }

}
