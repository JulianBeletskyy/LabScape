<template>
    <div class="wrapper">

        <main-header></main-header>


        <main-sidebar></main-sidebar>


        <div class="content-wrapper">

            <section class="content">

                <modal-employee-details></modal-employee-details>

                <modal-address-edit></modal-address-edit>

                <modal-contacts-chain></modal-contacts-chain>

                <map-main></map-main>

            </section>
        </div>


        <main-footer></main-footer>

    </div>
</template>

<script>

    import ModalAddressEdit from "../partial-view-components/modal-address-edit";

    require('../../../../node_modules/admin-lte/dist/js/adminlte.min');
    require('../../../../node_modules/admin-lte/dist/js/demo.js');

    export default {
        components: {ModalAddressEdit},
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