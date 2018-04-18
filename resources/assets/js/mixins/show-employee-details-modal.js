const employeeModal = {

    methods: {
        showEmployeeDetailsModal: function (personId, addressId, address) {

            let data = {
                personId: personId,
                addressId: addressId,
                address: address
            };

            this.$eventGlobal.$emit('showModalEmployeeDetails', data);
        }
    }

};

export default employeeModal;