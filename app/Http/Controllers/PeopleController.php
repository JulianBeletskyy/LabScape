<?php

namespace App\Http\Controllers;

use App\Models\People;
use Illuminate\Http\Request;

class PeopleController extends Controller
{


    function show(People $person)
    {
        return response()->json($person);
    }


}
