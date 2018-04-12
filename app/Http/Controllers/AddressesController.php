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


}
