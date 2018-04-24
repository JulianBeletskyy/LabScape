var getPersonInitials = {

    methods: {
        getPersonInitials: function (personName) {

            if(!personName) {
                return '';
            }

            var initials = '';

            let arr = personName.split(' ');

            if(arr.length) {
                initials += arr[0].charAt(0).toUpperCase();

                if(arr[1]){
                    initials += ' ' + arr[1].charAt(0).toUpperCase();
                }
            }

            return initials;

        }
    }

};


export default getPersonInitials;