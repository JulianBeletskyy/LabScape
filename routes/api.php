<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/test', function (){
    return response()->json(['test-data'=>'all is ok!']);
});

Route::post('login', 'AuthController@login');
//Route::post('register', 'AuthController@register');
Route::post('recover', 'AuthController@recover');

Route::post('password/reset/{token}', 'Auth\ResetPasswordController@postReset')->name('password.resetPost');


Route::group(['middleware'=>['jwt.auth']],function (){

    Route::get('/auth-test', function (){
        return response()->json(['test-data'=>'all is ok!']);
    });

    Route::get('/logged-user', 'UserController@showLoggedUserData')->name('user.showLoggedUserData');

    Route::get('/addresses', 'AddressesController@index')->name('address.index');

    Route::get('/addresses-paginated', 'AddressesController@loadAddressesPaginated')->name('address.loadAddressesPaginated');

});
