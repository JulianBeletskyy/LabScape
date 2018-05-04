<template>
    <div>
        <div class="modal fade" id="address-edit-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <a href="javascript:void(0)" class="close-icon-a pull-right" data-dismiss="modal" aria-label="Close">
                            <img src="/images/x.png" alt="">
                        </a>
                    </div>
                    <div class="modal-body">
                        <div>

                            <div>
                                <label>Name</label>
                                <input v-model="name" type="text">
                            </div>

                            <div>
                                <label>Address</label>
                                <input v-model="address" type="text">
                            </div>

                            <div>
                                <label>Url</label>
                                <input v-model="url" type="text">
                            </div>

                            <div>
                                <label>Phone number</label>
                                <input v-model="phone" type="text">
                            </div>

                            <div>
                                <button @click="updateAddressDetails()" type="submit">Save</button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import http from '../mixins/http';

    export default {
        
        mixins: [http],

        data: function () {
            return {
                addressData: null,
                name: "",
                address: "",
                url: "",
                phone: ""
            }
        },
        methods: {
            updateAddressDetails: function () {
                this.httpPut('/api/address-details/'+this.addressData.id+'/update-details', {
                    name: this.name,
                    address: this.address,
                    url: this.url,
                    phone: this.phone
                })
                    .then(data => {
                        this.addressData = data;
                        $('#address-edit-modal').modal('hide');
                        alertify.notify('Address has been updated.', 'success', 3);
                    })
            },
            init: function (addressdata) {
                this.addressData = addressdata;

                this.name = this.addressData.name;
                this.address = this.addressData.address;
                this.url = this.addressData.url;
                this.phone = this.addressData.phone;

                $('#address-edit-modal').modal('show');
            }
        },
        mounted: function(){
            // this.httpGet('/api/connection-types')
            //     .then(data => {
            //         this.connectionTypes = data;
            //     });

            this.$eventGlobal.$on('showModalAddressEdit', (addressData) => {
                this.init(addressData);
            });
        }
    }
</script>

<style scoped>

</style>