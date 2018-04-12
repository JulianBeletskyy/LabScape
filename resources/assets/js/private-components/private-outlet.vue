<template>
    <div class="wrapper">

        <main-header></main-header>

        <!-- Left side column. contains the logo and sidebar -->
        <main-sidebar></main-sidebar>

        <div class="content-wrapper">
            <router-view></router-view>
        </div>

        <main-footer></main-footer>

    </div>
</template>

<script>

    require('../../../../node_modules/admin-lte/dist/js/adminlte.min');
    require('../../../../node_modules/admin-lte/dist/js/demo.js');

    export default {
        created: function (){
            this.$eventGlobal.$on('update-user-profile', loggedUserData => {
                localStorage.setItem('logged-user', JSON.stringify(loggedUserData))
            });
        },

        mounted: function () {

            this.$eventGlobal.$emit('update-user-profile', JSON.parse(localStorage.getItem('logged-user')));

        }
    }
</script>

<style scoped>

</style>