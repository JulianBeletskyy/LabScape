const employeeModal = {

    methods: {
        showEmployeeDetailsModal: function (id) {
            this.$eventGlobal.$emit('showModalEmployeeDetails', id);
        }
    }

};

export default employeeModal;