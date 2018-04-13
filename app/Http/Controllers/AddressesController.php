<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressesController extends Controller
{


    function index()
    {
        $addresses = Address::all();

        return response()->json($addresses);
    }


    function loadAddressesPaginated()
    {
        $query = Address::with('tags')
            ->with('cluster');

        $query = $this->composeConditions($query, request()->all());

        $addresses = $query->paginate(20);

        return response()->json($addresses);
    }


    function composeConditions($query, $requestParams)
    {
        if (isset($requestParams['tag_id'])) {
            $query->whereHas('tags', function ($q) use ($requestParams) {
                $q->where('id', $requestParams['tag_id']);
            });
        }

        return $query;
    }


    function loadFilterValues()
    {
        $tags = Tag::get(['id', 'name']);
        $products = Product::all();

        $filters = [
            'tag_list' => $tags,
            'used_product_list' => $products
        ];

        return response()->json($filters);
    }
}
