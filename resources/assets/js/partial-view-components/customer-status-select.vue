<template>
    <div class="customer-status-custom-select-box" :class="{'potential': selected==1, 'customer': selected==2}">
        <select class="customer-status-select-box">
            <option v-for="cs in options" :value="cs.id" :selected="selected == cs.id">{{cs.name}}</option>
        </select>
    </div>
</template>

<script>

    require('../../../../bower_components/select2/dist/js/select2.full.js');

    export default {
        data: function () {
            return {

            }
        },

        props: ['options', 'selected'],

        mounted: function () {
            $('.customer-status-select-box').select2({
                minimumResultsForSearch: -1
            });
        }
    }
</script>

<style scoped>

</style>