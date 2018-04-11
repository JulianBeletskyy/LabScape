<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Mockery\Exception;
use Tymon\JWTAuth\Facades\JWTAuth;


class UserController extends Controller
{

    function showLoggedUserData ()
    {
        return response()->json(['success' => true, 'data'=>JWTAuth::user()]);
    }


    function updateUserProfile ()
    {
        $data = request()->all();

        $user = JWTAuth::user();

        try {
            $user->update($data);
            return response()->json(['success' => true, 'data'=>JWTAuth::user()]);
        }
        catch (Exception $e) {
            return response()->json(['success' => false, 'message'=>$e->getMessage()], 501);
        }
    }


    function updateUserProfilePicture(Request $request)
    {
        $user = JWTAuth::user();

        $this->validate($request,[
            'file'=> 'mimes:png,jpeg,jpg|max:1024'
        ]);

        if(!$request->hasFile('profile-picture'))
        {
            return response()->json(['success' => false, 'message' => 'File not provided'], 404);
        }

        try {
            $user->updateProfilePicture($request->file('profile-picture'));
        }
        catch (Exception $e) {
            return response()->json(['success' => false, 'message' => 'File not provided'], 404);
        }

        return response()->json(['success' => true, 'data' => $user]);

    }

}
