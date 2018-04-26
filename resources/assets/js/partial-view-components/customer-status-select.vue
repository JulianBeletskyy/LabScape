<template>
    <div class="customer-status-custom-select-box" :class="{'potential': selectedValue==1, 'customer': selectedValue==2}">
        <select class="customer-status-select-box hidden">
            <option value="1" :selected="1 == selectedValue">Potential Customer</option>
            <option value="2" :selected="2 == selectedValue">Customer</option>
        </select>
    </div>
</template>

<script>

    require('../../../../bower_components/select2/dist/js/select2.full.js');

    export default {
        data: function () {
            return {
                selectedValue: null,
                isNotInited: true,
                isAddressChanged1stTime: true,
            }
        },

        watch: {
            selected: function (newVal) {
                this.selectedValue = newVal;

                if(this.isNotInited){

                    this.initSelect2Js();

                    this.isNotInited = false;
                }
            },
            addressId: function (newVal) {

                if(!this.isAddressChanged1stTime){
                    setTimeout(()=>{
                        $(".customer-status-select-box").select2({minimumResultsForSearch: -1}).val(this.selectedValue);
                    },100);
                    return;
                }

                this.isAddressChanged1stTime = false;
            },
        },

        methods: {
            initSelect2Js: function () {
                setTimeout(()=>{
                    $('.customer-status-select-box').select2({
                        minimumResultsForSearch: -1
                    });

                    $('.customer-status-select-box').on('select2:select', (e) => {
                        this.$emit('customerStatusUpdated', e.target.value);
                    });
                },50)
            }
        },

        props: ['options', 'selected', 'addressId'],

        mounted: function () {


        }
    }
</script>

<style scoped>

</style>