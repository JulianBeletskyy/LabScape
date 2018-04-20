<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\CustomerType;
use App\Models\People;
use App\Models\Product;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

        if (isset($requestParams['sort_by'])) {

            $field = explode('-',$requestParams['sort_by'])[0];
            $direction = explode('-',$requestParams['sort_by'])[1];

            if($field == 'people') {
                $query->withCount('people');
                $field .= '_count';
            }
            else if($field == 'products') {
                $query->withCount('products');
                $field .= '_count';
            }

            $query->orderBy($field,$direction);
        }

        if (isset($requestParams['tag_ids'])) {
            $query->whereHas('tags', function ($q) use ($requestParams) {
                $q->whereIn('id', $requestParams['tag_ids']);
            });
        }

        if (isset($requestParams['used_product_ids'])) {
            $query->whereHas('products', function ($q) use ($requestParams) {
                $q->whereIn('id', $requestParams['used_product_ids']);
            });
        }

        if (isset($requestParams['type_id'])) {
            $query->whereHas('customerType', function ($q) use ($requestParams) {
                $q->where('id', $requestParams['type_id']);
            });
        }

        if (isset($requestParams['global_search'])) {
            $query->where('rl_addresses.name', 'LIKE', '%'.$requestParams['global_search'].'%');
        }

        if (isset($requestParams['address_ids'])) {
            $query->whereIn('rl_addresses.id', explode(',',$requestParams['address_ids']));
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


    function show(Address $address)
    {
        $address->load('tags');
        $address->load('cluster');
        $address->load('cluster.addresses');
        $address->load('people');
        $address->load('products');
        return response()->json($address);
    }


    function updateCustomerStatus(Address $address)
    {
        $address->customer_status = request()->get('status');
        $address->save();

        return response()->json($address);
    }


    function loadPeopleByAddressId (Address $address)
    {
        $people = People::with('addresses')
                        ->whereHas('addresses', function ($q) use ($address){
                            return $q->where('id', $address->id);
                        })
                        ->paginate(10);

        return response()->json($people);
    }


    function getContactsChain(Address $address)
    {

        $mainLabId = $address->id;

        $sql = "SELECT * from
                (SELECT a2.id, a2.name, a2.cluster_id FROM rl_addresses a  
                JOIN rl_address_people ap ON a.id = ap.address_id -- workers of main hospital
                JOIN rl_address_connections ac ON ac.from_person_id = ap.person_id -- people who know people on main hospital
                JOIN rl_address_people ap2 ON ap2.person_id = ac.to_person_id -- workplaces of people who know people on main hospital
                JOIN rl_addresses a2 ON ap2.address_id = a2.id 
                WHERE a.id = " . $mainLabId . " 
                UNION 
                SELECT a2.id, a2.name, a2.cluster_id FROM rl_addresses a  
                JOIN rl_address_people ap ON a.id = ap.address_id -- workers of main hospital
                JOIN rl_address_connections ac ON ac.to_person_id = ap.person_id -- people who know people on main hospital 
                JOIN rl_address_people ap2 ON ap2.person_id = ac.from_person_id -- workplaces of people who know people on main hospital
                JOIN rl_addresses a2 ON ap2.address_id = a2.id 
                WHERE a.id = " . $mainLabId . "
                UNION
                SELECT a2.id, a2.name, a2.cluster_id FROM rl_addresses a JOIN rl_addresses a2 ON a.cluster_id = a2.cluster_id WHERE a.id != a2.id AND a.cluster_id IS NOT NULL AND a.id = " . $mainLabId . " 
                UNION 
                SELECT a.id, a.name, a.cluster_id FROM rl_addresses a WHERE a.id = " . $mainLabId . ") related_labs ";

        $related_labs = DB::select(DB::raw($sql));

        $related_labs_ids = "";
        $first = true;
        foreach ($related_labs as $lab){
            if ($first){
                $first = false;
            }else{
                $related_labs_ids = $related_labs_ids . ",";
            }
            $related_labs_ids = $related_labs_ids . $lab ->id;
        }

        $sql = "SELECT rl.id, rl.name, ap.address_id, pt.name as 'workerType' FROM rl_people rl  
                JOIN rl_address_people ap ON ap.person_id = rl.id JOIN rl_people_types pt ON rl.type_id = pt.id  
                WHERE ap.address_id IN (" . $related_labs_ids . ")";

        $lab_workers = DB::select(DB::raw($sql));


        $related_people = [];
        if ($related_labs_ids != ""){
            $sql = "SELECT p.id, p.name, ap.address_id FROM rl_address_people ap JOIN rl_people p ON ap.person_id = p.id  WHERE ap.address_id IN (" . $related_labs_ids . ")";

            $related_people = DB::select(DB::raw($sql));
        }

        // get the relations from related people
        $first = true;
        $related_people_ids = "";
        foreach ($related_people as $p){
            if ($first){
                $first = false;
            }else{
                $related_people_ids = $related_people_ids . ",";
            }
            $related_people_ids = $related_people_ids . $p->id;
        }

        Log::info('$related_people_ids ' . print_r($related_people_ids,1));

        // get relationships and descriptions
        $people_relationships = [];
        if ($related_people_ids != ""){
            $sql = "SELECT ac.from_person_id, ac.to_person_id, ac.edge_weight, act.id as 'connection_type' FROM rl_address_connections ac LEFT JOIN rl_address_connection_types act on ac.edge_type = act.id WHERE ac.from_person_id IN (" . $related_people_ids . ") AND ac.to_person_id IN (" . $related_people_ids . ") ";
            $people_relationships = DB::select(DB::raw($sql));
        }

        $result = [ 'related_labs' => $related_labs, 'related_people' => $related_people, 'relationships' => $people_relationships, 'workers' => $lab_workers ];

        return response()->json($result);
    }

}
