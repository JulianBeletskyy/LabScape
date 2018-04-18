const employeeModal = {

    methods: {
        showEmployeeDetailsModal: function (personId, addressId) {
            this.$eventGlobal.$emit('showModalEmployeeDetails', {personId: personId, addressId: addressId});
        }
    }

};

export default employeeModal;