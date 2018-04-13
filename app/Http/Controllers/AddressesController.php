<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Tag;
use Illuminate\Http\Request;

class AddressesController extends Controller
{


    function index()
    {
        $addresses = Address::all();

        return response()->json($addresses);
    }


    function loadAddressesPaginated()
    {
        $addresses = Address::with(['tags' => function ($q){
            $q->select(['id', 'name']);
        }])->paginate(20);

        return response()->json($addresses);
    }
}
