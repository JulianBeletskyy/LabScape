const addressEditModal = {

    methods: {
        showAddressEditModal: function (addressData) {

            // let data = {
            //     personId: personId,
            //     addressId: addressId,
            //     address: address
            // };

            this.$eventGlobal.$emit('showModalAddressEdit', addressData);
        }
    }

};

export default addressEditModal;