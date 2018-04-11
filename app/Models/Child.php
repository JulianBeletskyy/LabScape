<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Child extends Model
{

    use SoftDeletes;

    protected $table = 'children';
    protected $dates = ['birth_date', 'created_at', 'updated_at', 'deleted_at'];
    protected $fillable = ['surname','name','birth_date','user_id'];


    function user()
    {
        return $this->belongsTo(User::class);
    }


}
