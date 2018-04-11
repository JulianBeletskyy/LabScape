<template>

    <div>
        <!-- Content Header (Page header) -->
        <section class="content-header">
            <h1>
                Profile
                <small>set you profile settings</small>
            </h1>
            <ol class="breadcrumb">
                <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
                <li><a href="#">Examples</a></li>
                <li class="active">Blank page</li>
            </ol>
        </section>

        <!-- Main content -->
        <section class="content">

            <!-- Default box -->
            <div class="box box-info">

                <form class="form-horizontal">
                    <div class="box-header with-border">
                        <h3 class="box-title">{{user.name}} {{user.surname}}</h3>

                        <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip"
                                    title="Collapse">
                                <i class="fa fa-minus"></i></button>
                            <button type="button" class="btn btn-box-tool" data-widget="remove" data-toggle="tooltip" title="Remove">
                                <i class="fa fa-times"></i></button>
                        </div>
                    </div>
                    <div class="box-body">

                        <div class="row" style="margin-bottom: 15px">

                            <div class="col-lg-4 col-md-12">

                                <img class="profile-user-img img-responsive img-circle"  :src="user.avatar" alt="User profile picture">

                                <h3 class="profile-username text-center">{{user.name}} {{user.surname}}</h3>

                                <div class="fileContainerWrapper">
                                    <div class="fileContainerBox">
                                        <label class="fileContainer">
                                            Upload New Avatar
                                            <input type="file"
                                                   id="file"
                                                   @change="handleFileInput($event.target.files)">
                                        </label>
                                    </div>
                                </div>


                            </div>

                        </div>


                        <div class="row">
                            <!--1st column-->
                            <div class="col-lg-4 col-md-6">

                                <div class="form-group">
                                    <label for="inputEmail" class="col-sm-3 control-label">Email</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.email" name="email" type="email" class="form-control" id="inputEmail" placeholder="Email">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputSurname" class="col-sm-3 control-label">Surname</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.surname" name="surname" type="text" class="form-control" id="inputSurname" placeholder="Surname">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputName" class="col-sm-3 control-label">Name</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.name" name="name" type="text" class="form-control" id="inputName" placeholder="Name">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputStreet" class="col-sm-3 control-label">Street</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.street" name="street" type="text" class="form-control" id="inputStreet" placeholder="Street">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputNumber" class="col-sm-3 control-label">Number</label>

                                    <div class="col-sm-4">
                                        <input v-model="user.street" name="number" type="text" class="form-control" id="inputNumber" placeholder="Number">
                                    </div>

                                    <label for="inputBox" class="col-sm-2 control-label">Box</label>

                                    <div class="col-sm-3">
                                        <input v-model="user.bus" name="bus" type="text" class="form-control" id="inputBox" placeholder="Box">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputPostalcode" class="col-sm-3 control-label">Postal code</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.postalcode" name="postalcode" type="text" class="form-control" id="inputPostalcode" placeholder="Postal code">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="inputCity" class="col-sm-3 control-label">City</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.city" name="city" type="text" class="form-control" id="inputCity" placeholder="Postal code">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-3 control-label">Gender</label>

                                    <div class="col-sm-9">
                                        <!--<select v-model="user.gender" name="gender" class="form-control">
                                            <option *ngFor="let gender of genders" [value]="gender">{{gender}}</option>
                                        </select>-->
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label class="col-sm-3 control-label">Nationality</label>

                                    <div class="col-sm-9">
                                        <!--<select v-model="user.nationality" name="nationality" class="form-control">
                                            <option *ngFor="let country of countries" [value]="country.code">{{country.name}}</option>
                                        </select>-->
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="birth_date" class="col-sm-3 control-label">Birth Date</label>

                                    <div class="col-sm-9">
                                        <div class="input-group">
                                            <div class="input-group-addon">
                                                <i class="fa fa-calendar"></i>
                                            </div>
                                            <input type="text" name="birth_date" id="birth_date" class="form-control" data-inputmask="'alias': 'dd/mm/yyyy'" data-mask>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="birthPlace" class="col-sm-3 control-label">Birth Place</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.birth_place" name="birth_place" type="text" class="form-control" id="birthPlace" placeholder="Birth place">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="socialSecurityNumber" style="padding-top: 0" class="col-sm-3 control-label">Social Security Number</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.social_security_number" name="social_security_number" type="text" class="form-control" id="socialSecurityNumber" placeholder="Social security number">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="iban" class="col-sm-3 control-label">IBAN</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.iban" name="iban" type="text" class="form-control" id="iban" placeholder="IBAN">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="bic" class="col-sm-3 control-label">BIC</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.bic" name="bic" type="text" class="form-control" id="bic" placeholder="BIC">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="mobile_phone" class="col-sm-3 control-label">Mobile Phone</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.mobile_phone" name="mobile_phone" type="text" class="form-control" id="mobile_phone" placeholder="Mobile phone">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="mobile_phone_public" style="padding-top: 0" class="col-sm-3 control-label">Show Mobile Phone</label>

                                    <div class="col-sm-7">
                                        <div class="grey-checkbox checkbox-margin-top">
                                            <label>
                                                <input v-model="user.mobile_phone_public" id="mobile_phone_public" type="checkbox" name="mobile_phone_public">
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="personal_email" class="col-sm-3 control-label">Personal Email</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.personal_email" name="personal_email" type="email" class="form-control" id="personal_email" placeholder="Personal Email">
                                    </div>
                                </div>


                            </div>
                            <!--END 1st column-->

                            <!--2nd column-->
                            <div class="col-lg-4 col-md-6">

                                <div class="form-group">
                                    <label for="personal_email" class="col-sm-3 control-label">Work Phone</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.work_phone" name="work_phone" type="text" class="form-control" id="work_phone" placeholder="Work phone">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="diploma" class="col-sm-3 control-label">Diploma</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.diploma" name="diploma" type="text" class="form-control" id="diploma" placeholder="Diploma">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="specification" class="col-sm-3 control-label">Specification</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.specification" name="specification" type="text" class="form-control" id="specification" placeholder="Specification">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="transport" class="col-sm-3 control-label">Transport</label>

                                    <div class="col-sm-9">
                                        <!--<select v-model="user.transport" id="transport" name="transport" class="form-control">
                                            <option *ngFor="let transport of transports" [value]="transport.code">{{transport.name}}</option>
                                        </select>-->
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="commuting" class="col-sm-3 control-label">Commuting</label>

                                    <div class="col-sm-3 col-xs-9">
                                        <input v-model="user.commuting" name="commuting" type="text" class="form-control" id="commuting" placeholder="Commuting">
                                    </div>

                                    <label for="commuting" class="col-sm-2 col-xs-3 control-label" style="font-weight: 100; text-align: left; padding-top: 7px;">km</label>
                                </div>
                            </div>
                            <!--END 2nd column-->

                            <!--3rd column-->
                            <div class="col-lg-4 col-md-12">

                                <div class="form-group">
                                    <label for="marital_status" class="col-sm-3 control-label">Marital Status</label>

                                    <!--<div class="col-sm-9">
                                        <select v-model="user.marital_status" id="marital_status" name="marital_status" class="form-control">
                                            <option *ngFor="let maritalStatu of maritalStatus" [value]="maritalStatu.code">{{maritalStatu.name}}</option>
                                        </select>
                                    </div>-->
                                </div>

                                <div class="form-group">
                                    <label for="marital_status_since" style="padding-top: 0" class="col-sm-3 control-label">Marital Status Since</label>

                                    <div class="col-sm-9">
                                        <div class="input-group">
                                            <div class="input-group-addon">
                                                <i class="fa fa-calendar"></i>
                                            </div>
                                            <input type="text" name="marital_status_since" id="marital_status_since" class="form-control">
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_surname" class="col-sm-3 control-label">Partner Surname</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.partner_surname" name="partner_surname" type="text" class="form-control" id="partner_surname" placeholder="Partner surname">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_name" class="col-sm-3 control-label">Partner Name</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.partner_name" name="partner_name" type="text" class="form-control" id="partner_name" placeholder="Partner name">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_birth_date" style="padding-top: 0" class="col-sm-3 control-label">Partner Birth Date</label>

                                    <div class="col-sm-9">
                                        <div class="input-group">
                                            <div class="input-group-addon">
                                                <i class="fa fa-calendar"></i>
                                            </div>
                                            <input type="text"  name="partner_birth_date" id="partner_birth_date" class="form-control">
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_profession" style="padding-top: 0" class="col-sm-3 control-label">Partner Profession</label>

                                    <div class="col-sm-9">
                                        <input v-model="user.partner_profession" name="partner_profession" type="text" class="form-control" id="partner_profession" placeholder="Partner profession">
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_dependant" style="padding-top: 0" class="col-sm-3 control-label">Partner Dependant</label>

                                    <div class="col-sm-7">
                                        <div class="grey-checkbox checkbox-margin-top">
                                            <label>
                                                <input v-model="user.partner_dependant" id="partner_dependant" type="checkbox" name="partner_dependant">
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="children_dependant" style="padding-top: 0" class="col-sm-3 control-label">Children Dependant</label>

                                    <div class="col-sm-7">
                                        <div class="grey-checkbox checkbox-margin-top">
                                            <label>
                                                <input v-model="user.children_dependant" id="children_dependant" type="checkbox" name="children_dependant">
                                                <span></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="partner_profession" style="padding-top: 0" class="col-sm-3 control-label">Extra Info</label>

                                    <div class="col-sm-9">
                                        <textarea v-model="user.extra_info" name="partner_profession" type="text" class="form-control" id="extra_info" placeholder="Extra Info"></textarea>
                                    </div>
                                </div>


                            </div>
                            <!--END 3rd column-->
                        </div>


                    </div>
                    <!-- /.box-body -->
                    <div class="box-footer">
                        <button :disabled="isSubmitting" class="btn btn-success pull-right"><i class="fa fa-save"></i> Save</button>
                    </div>
                    <!-- /.box-footer-->
                </form>
            </div>
            <!-- /.box -->


        </section>
        <!-- /.content -->
    </div>

</template>

<script>

    import http from '../../../mixins/http';

    export default {
        mixins: [http],
        data: function () {
            return {
                user: {},
                isSubmitting: false,

            }
        },
        created: function() {
            this.httpGet('/api/logged-user')
                .then(data => {
                    // console.log('data', data);
                    this.user = data.data;
                })
                .catch(err => {
                    console.log('err', err);
                })
        },
        methods: {
            handleFileInput: function ($files) {

                let fileToUpload = $files.item(0);

                this.httpPostFile('/api/update-user-profile-picture', fileToUpload, 'profile-picture')
                    .then(data => {
                        this.user = data.data;
                        this.$eventGlobal.$emit('update-user-profile', data.data)
                    })
                    .catch(err => {

                    })
            }
        }
    }
</script>

<style scoped>

</style>