<template>
    <div>
        <div class="modal fade" id="contacts-chain" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">

                    <div class="modal-body">
                        ...
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
                currentAddress: {}
            }
        },

        methods: {
            init: function (addressData) {
                this.currentAddress = addressData;

                this.loadContactsChainData();
            },

            loadContactsChainData: function () {
                this.httpGet('/api/address-details/'+this.currentAddress.id+'/load-contacts-chain-data')
                    .then(data => {
                        console.log('loadContactsChainData - ',data)
                    })
            }
        },

        mounted: function(){
            this.$eventGlobal.$on('showModalContactsChain', (addressData) => {
                $('#contacts-chain').modal('show');
                this.init(addressData);
            });
        }
    }
</script>

<style scoped>

</style>