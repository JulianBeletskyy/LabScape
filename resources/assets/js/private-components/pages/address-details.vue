<template>
    
</template>

<script>

    import http from '../../mixins/http';

    export default {
        mixins: [http],

        data: function () {
            return {
                addressId: null
            }
        },

        methods: {
            loadAddressDetails: function () {

            }
        },

        mounted: function () {
            this.addressId = this.$route.params.id;

            this.loadAddressDetails();
        }
    }
</script>

<style scoped>

</style>