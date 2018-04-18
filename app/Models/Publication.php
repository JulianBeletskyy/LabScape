<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{

    protected $table = 'rl_publications';


    function people()
    {
        return $this->belongsToMany(People::class, 'rl_people_publications', 'publication_id', 'person_id');
    }

}
