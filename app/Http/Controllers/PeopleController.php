<?php

namespace App\Http\Controllers;

use App\Models\ConnectionTypes;
use App\Models\People;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PeopleController extends Controller
{


    function show(People $person)
    {
        $person->load(['careers' => function($q){
            return $q->orderBy('enddate', 'desc');
        }]);
        $person->load(['addresses' => function($q){
            return $q->orderBy('id', 'desc');
        }]);
        $person->load('publications','relationships');
        return response()->json($person);
    }


    function getConnectionTypes()
    {
        return response()->json(ConnectionTypes::all());
    }

    function getPersonRelationships(People $person)
    {
        $relationships = DB::table('rl_address_connections')
            ->where('rl_address_connections.from_person_id', $person->id)
            ->join('rl_people', 'rl_address_connections.to_person_id', '=', 'rl_people.id')
            ->paginate(10);

        return response()->json($relationships);
    }

}
