<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{

    protected $table = 'rl_tags';


    function addresses ()
    {
        return $this->belongsToMany(Address::class, 'rl_address_tags', 'tag_id', 'address_id');
    }

}
