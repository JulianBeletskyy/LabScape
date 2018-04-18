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


    function careers()
    {
        return $this->hasMany(Career::class, 'person_id');
    }


    function publications()
    {
        return $this->belongsToMany(Publication::class, 'rl_people_publications', 'person_id', 'publication_id');
    }


    function relationships()
    {
        return $this->belongsToMany(People::class, 'rl_address_connections', 'from_person_id', 'to_person_id')
            ->withPivot('edge_type');
    }
}
