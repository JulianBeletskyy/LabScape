<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('rl_users', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->string('password')->after('name');
            $table->boolean('is_verified')->default(true);
            $table->rememberToken()->after('is_verified');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('rl_users', function (Blueprint $table) {
            $table->dropColumn('name');
            $table->dropColumn('password');
            $table->dropColumn('is_verified');
            $table->dropColumn('remember_token');
            $table->dropColumn('created_at');
            $table->dropColumn('updated_at');
        });
    }
}
