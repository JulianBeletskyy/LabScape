<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\CustomerType;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressesController extends Controller
{


    function index()
    {
        $addresses = $this->prepareAddressesQuery()->get();

        return response()->json($addresses);
    }


    function loadAddressesPaginated()
    {
        $query = $this->prepareAddressesQuery();

        $addresses = $query->paginate(20);

        return response()->json($addresses);
    }


    function prepareAddressesQuery()
    {
        $query = Address::with('tags')
            ->with('cluster')
            ->with(['products' => function($q){
                $q->select('id');
            }]);

        $query = $this->composeConditions($query, request()->all());

        return $query;
    }


    function composeConditions($query, $requestParams)
    {
        if (isset($requestParams['tag_id'])) {
            $query->whereHas('tags', function ($q) use ($requestParams) {
                $q->where('id', $requestParams['tag_id']);
            });
        }

        if (isset($requestParams['used_product_id'])) {
            $query->whereHas('products', function ($q) use ($requestParams) {
                $q->where('id', $requestParams['used_product_id']);
            });
        }

        if (isset($requestParams['type_id'])) {
            $query->whereHas('customerType', function ($q) use ($requestParams) {
                $q->where('id', $requestParams['type_id']);
            });
        }

        return $query;
    }


    function loadFilterValues()
    {
        $tags = Tag::get(['id', 'name']);
        $products = Product::all();
        $customerTypes = CustomerType::visible()->get();

        $filters = [
            'tag_list' => $tags,
            'used_product_list' => $products,
            'customer_types' => $customerTypes
        ];

        return response()->json($filters);
    }
}
