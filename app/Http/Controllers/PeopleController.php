<?php

namespace App\Http\Controllers;

use App\Models\People;
use Illuminate\Http\Request;

class PeopleController extends Controller
{


    function show(People $person)
    {
        $person->load(['careers' => function($q){
            return $q->orderBy('id', 'desc');
        }]);
        $person->load(['addresses' => function($q){
            return $q->orderBy('id', 'desc');
        }]);
        $person->load('publications');
        return response()->json($person);
    }


}
