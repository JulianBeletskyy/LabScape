<?php

namespace App\Models;


use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements JWTSubject {

    use SoftDeletes, Notifiable;

    protected $fillable = [
        'email',
        'password',
        'is_verified',
        'remember_token',
        'surname',
        'name',
        'street',
        'number',
        'bus',
        'postalcode',
        'city',
        'social_security_number',
        'bank_account',
        'mobile',
        'gender',
        'nationality',
        'birth_date',
        'birth_place',
        'iban',
        'bic',
        'mobile_phone',
        'mobile_phone_public',
        'personal_email',
        'avatar',
        'supervisor_id',
        'active',
        'work_phone',
        'contract_type',
        'hours_week',
        'recruitment',
        'function',
        'diploma',
        'specification',
        'transport',
        'commuting',
        'marital_status',
        'marital_status_since',
        'partner_surname',
        'partner_name',
        'partner_birth_date',
        'partner_profession',
        'partner_dependant',
        'children_dependant',
        'dependant_children_count',
        'extra_info'
    ];

    protected $hidden = ['password', 'remember_token'];


    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }


    public function getAvatarAttribute($value)
    {
        return env('APP_URL').'/storage/'.$value;
    }


    function updateProfilePicture(UploadedFile $file)
    {
        $filePath = Storage::disk('public')->putFile('profile-pictures', $file);

        $this->avatar = $filePath;

        $this->save();
    }
}
