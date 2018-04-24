<template>
    <div class="slided-box-content">

        <a href="javascript:void(0)" class="close-icon-a" @click="closeSlidedBox()">
            <img src="/images/x.png" alt="">
        </a>

        <h3 class="">
            Lab Employees
            <a data-v-cd5686be="" href="#">
                <i data-v-cd5686be="" class="fa fa-pencil"></i>
            </a>
        </h3>


        <ul class="staff-list">
            <li v-for="(person, i) in people">
                <div class="image">
                    <span class="person-initials">{{getPersonInitials(person.name)}}</span>
                    <img :src="'/images/mask-'+i+'.png'" alt="">
                </div>
                <div class="personal-info">
                    <p class="name"><a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressId, address)">{{person.name}}</a></p>
                    <p class="occupation">{{person.description}}</p>
                </div>
            </li>
        </ul>

        <div class="pagination-box">
            <pagination :records="peopleTotal"  :class="'pagination pagination-sm no-margin pull-right'" :per-page="10" @paginate="pageChanged"></pagination>
        </div>
    </div>
</template>

<script>

    import http from '../mixins/http';
    import employeeModal from '../mixins/show-employee-details-modal';
    import getPersonInitials from '../mixins/get-person-initials';

    export default {
        mixins: [http, employeeModal, getPersonInitials],

        data: function () {
            return {
                people: [],
                isDataLoaded: false,
                peopleTotal: 0
            }
        },

        methods: {
            loadAddressEmployeesPaginated: function (id, page) {

                let p = page || 1;

                this.httpGet('/api/address-details/'+id+'/people?page='+p)
                    .then(data => {
                        this.people = data.data;
                        this.isDataLoaded = true;
                        this.peopleTotal = data.total;
                    })
            },

            pageChanged: function (pageNumber) {
                this.loadAddressEmployeesPaginated(this.addressId, pageNumber);
            },

            closeSlidedBox: function () {
                this.$emit('closeSlidedBox')
            }
        },

        props: ['employeeList', 'isActive', 'addressId', 'address'],

        mounted: function () {
            if(this.isActive && this.addressId && !this.isDataLoaded) {
                this.loadAddressEmployeesPaginated(this.addressId)
            }
        }
    }
</script>

<style scoped>

</style>