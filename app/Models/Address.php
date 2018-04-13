<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{

    protected $table = 'rl_addresses';


    function tags ()
    {
        return $this->belongsToMany(Tag::class, 'rl_address_tags', 'address_id','tag_id');
    }
}
