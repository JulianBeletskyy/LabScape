<template>
    <div class="login-box">
        <div class="login-logo">
            <a href="#"><b>Sporta</b>Leave</a>
        </div>
        <!-- /.login-logo -->
        <div class="login-box-body">
            <div v-if="isEmailSent">
                <h1 class="text-success text-center" style="margin-top: 0"><i class="fa fa-2x fa-check-circle-o"></i></h1>
                <p>The email with reset password link has been just sent to the specified email address. Please check your email box.</p>
            </div>

            <div v-if="!isEmailSent">
                <p class="login-box-msg">Please enter your email address and we will sent you the link to reset your password</p>

                <form name="loginForm">
                    <div class="form-group has-feedback" :class="{'has-error': errorMessage !== ''}">
                        <input
                                class="form-control"
                                placeholder="Email"
                                type="email"
                                name="email"
                                required
                                v-model="email"
                                @keyup="resetErrorMessage()"
                        >
                        <span class="glyphicon glyphicon-envelope form-control-feedback"></span>
                        <span class="help-block" v-show="errorMessage !== ''">{{errorMessage}}</span>
                    </div>

                    <div class="row">
                        <!-- /.col -->
                        <div class="col-xs-12">
                            <a href="javascript:void(0)" @click="doRecoverPassword()" class="btn btn-primary btn-block btn-flat">Recover Password</a>
                        </div>
                        <!-- /.col -->
                    </div>
                </form>
            </div>

            <div class="social-auth-links"></div>

            <router-link to="/login">Back to login</router-link><br>

        </div>
        <!-- /.login-box-body -->
    </div>
</template>

<script>
    import http from '../../mixins/http';

    export default {
        mixins: [http],
        data: function () {
            return {
                email: '',
                isEmailSent: false,
                errorMessage: ''
            }
        },
        methods: {
            doRecoverPassword: function() {
                this.httpPost('/api/recover', {email: this.email})
                    .then(data => {
                        console.log('data',data);
                        this.isEmailSent = true;
                    })
                    .catch(err => {
                        this.errorMessage = err.data.message;
                    })
            },
            resetErrorMessage: function() {
                this.errorMessage = '';
            }
        }
    }
</script>

<style scoped>

</style>