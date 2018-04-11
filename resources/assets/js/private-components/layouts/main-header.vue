<template>
    <header class="main-header">
        <!-- Logo -->
        <a href="index2.html" class="logo">
            <!-- mini logo for sidebar mini 50x50 pixels -->
            <span class="logo-mini"><b>A</b>LT</span>
            <!-- logo for regular state and mobile devices -->
            <span class="logo-lg"><img src="/images/logo.png" alt=""></span>
        </a>
        <!-- Header Navbar: style can be found in header.less -->
        <nav class="navbar navbar-static-top">
            <!-- Sidebar toggle button-->
            <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
                <span class="sr-only">Toggle navigation</span>
            </a>

            <div class="navbar-custom-menu">
                <ul class="nav navbar-nav">
                    <!-- User Account: style can be found in dropdown.less -->
                    <li class="dropdown user user-menu">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                            <img :src="user.avatar" class="user-image" alt="User Image">
                            <span class="hidden-xs"> {{user.surname}} {{user.name}}</span>
                        </a>
                        <ul class="dropdown-menu">
                            <!-- User image -->
                            <li class="user-header">
                                <img :src="user.avatar" class="img-circle" alt="User Image">

                                <p>
                                    {{user.surname}} {{user.name}}
                                    <!--<small>Member since </small>-->
                                </p>
                            </li>
                            <!-- Menu Footer-->
                            <li class="user-footer">
                                <div class="pull-left">
                                    <router-link to="/user/profile" class="btn btn-default btn-flat">Profile</router-link>
                                </div>
                                <div class="pull-right">
                                    <a  class="btn btn-default btn-flat" @click="doLogOut()">Sign out</a>
                                </div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </nav>
    </header>
</template>

<script>
    export default {
        data: function () {
            return {
                user: {}
            }
        },
        created: function () {
            this.$eventGlobal.$on('update-user-profile', (data) => {
                this.user = data;
            });
        }
    }
</script>

<style scoped>

</style>