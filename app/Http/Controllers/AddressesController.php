<?php

namespace App\Http\Controllers;

use App\Models\Address;
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
        $addresses = Address::paginate(20);

        return response()->json($addresses);
    }
}
