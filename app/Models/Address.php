<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{

    protected $table = 'rl_addresses';


    function tags()
    {
        return $this->belongsToMany(Tag::class, 'rl_address_tags', 'address_id','tag_id');
    }


    function cluster()
    {
        return $this->belongsTo(Cluster::class);
    }


    function products()
    {
        return $this->belongsToMany(Product::class, 'rl_address_products', 'address_id','product_id');
    }


    function customerType()
    {
        return $this->belongsTo(CustomerType::class, 'customer_status');
    }

    function people()
    {
        return $this->belongsToMany(People::class, 'rl_address_people', 'address_id','person_id');
    }
}
