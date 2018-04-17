<?php

namespace App\Http\Controllers;

use App\Models\CustomerType;
use Illuminate\Http\Request;

class CustomerStatusesController extends Controller
{

    function show()
    {
        return response()->json(CustomerType::visible()->get());
    }

}
