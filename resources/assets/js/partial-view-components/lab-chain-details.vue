<template>
    <div class="slided-box-content">

        <a href="javascript:void(0)" class="close-icon-a" @click="closeSlidedBox()">
            <img src="/images/x.png" alt="">
        </a>

        <h3 class="">
            {{addressData.cluster.name}}
            <a data-v-cd5686be="" href="#">
                <i data-v-cd5686be="" class="fa fa-pencil"></i>
            </a>
        </h3>

        <div class="lab-chain-members-overview address-box" v-if="isShowLabChainMembersCollapsed">
            <div class="header">
                <h3>Lab Chain Members <small :title="'Addresses in chain: ' + addressData.cluster.addresses.length">({{addressData.cluster.addresses.length}})</small></h3>
            </div>

            <p v-if="addressData.cluster.addresses.length === 1" class="empty-data-p">Current address is the only member in this chain</p>

            <ul class="lab-chain-member-list">
                <li v-if="c.id != addressData.id && i < 3" v-for="(c,i) in addressData.cluster.addresses">
                    <h4><router-link :to="'/address-details/'+c.id">{{c.name}}</router-link></h4>
                    <p>{{c.address}}</p>
                </li>
            </ul>

            <a href="javascript:void(0)" @click="showLabChainMembersPaginated()" class="address-box-show-more-link">Show all lab chain members</a>
        </div>
        <div class="lab-chain-members-overview address-box" v-if="!isShowLabChainMembersCollapsed">
            <div class="header">
                <h3>Lab Chain Members <small :title="'Addresses in chain: ' + addressData.cluster.addresses.length">({{addressData.cluster.addresses.length}})</small></h3>
            </div>


            <ul class="lab-chain-member-list">
                <li v-for="(addr, i) in clusterAddresses.data">
                    <h4><router-link :to="'/address-details/'+addr.id">{{addr.name}}</router-link></h4>
                    <p>{{addr.address}}</p>
                </li>
            </ul>

            <div class="show-less-btn"><a @click="isShowLabChainMembersCollapsed = true" href="javascript:void(0)">Show Less</a></div>

            <div class="pagination-box">
                <pagination :records="clusterAddresses.total"  :class="'pagination pagination-sm no-margin pull-right'" :per-page="10" @paginate="pageChanged"></pagination>
            </div>
        </div>


        <div class="lab-chain-staff staff-overview address-box" v-if="isShowLabChainStaffCollapsed">

            <div class="header">
                <h3>Lab Chain Staff <a href="#"><i class="fa fa-pencil"></i></a></h3>
            </div>

            <ul class="staff-list">
                <li v-if="i < 3" v-for="(person, i) in addressData.people">
                    <div class="image">
                        <a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressData.id, addressData)"><img src="/images/anonimus-person_100x100.png" alt=""></a>
                    </div>
                    <div class="personal-info">
                        <p class="name"><a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressData.id, addressData)">{{person.name}}</a></p>
                        <p class="occupation">{{person.description}}</p>
                    </div>
                </li>
            </ul>

            <div style="clear: both"></div>

            <a href="javascript:void(0)" @click="showLabChainStaffPaginated()" class="address-box-show-more-link">Show all Employees</a>
        </div>

        <div class="lab-chain-staff staff-overview address-box" v-if="!isShowLabChainStaffCollapsed">

            <ul class="staff-list">
                <li v-for="person in clusterStaff.data">
                    <div class="image">
                        <img src="/images/anonimus-person_100x100.png" alt="">
                    </div>
                    <div class="personal-info">
                        <p class="name"><a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressData.id, addressData)">{{person.name}}</a></p>
                        <p class="occupation">{{person.description}}</p>
                    </div>
                </li>
            </ul>

            <div class="show-less-btn"><a @click="isShowLabChainStaffCollapsed = true" href="javascript:void(0)">Show Less</a></div>

            <div class="pagination-box">
                <pagination :records="clusterStaff.total"  :class="'pagination pagination-sm no-margin pull-right'" :per-page="10" @paginate="staffPageChanged"></pagination>
            </div>

        </div>

    </div>
</template>

<script>

    import http from '../mixins/http';
    import employeeModal from '../mixins/show-employee-details-modal';

    export default {
        mixins: [http, employeeModal],

        data: function () {
            return {
                isShowLabChainMembersCollapsed: true,
                isShowLabChainStaffCollapsed: true,
                clusterAddresses: {
                    total: 0,
                    data: []
                },
                clusterStaff: {
                    total: 0,
                    data: []
                }
            }
        },

        methods: {
            showLabChainMembersPaginated: function() {
                this.isShowLabChainMembersCollapsed = false;
                this.loadClusterDetails();
            },

            loadClusterDetails: function (page) {

                let p = page || 1;

                this.httpGet('/api/address-details/'+this.addressData.id+'/get-cluster-members-paginated?page='+p)
                    .then(data => {
                        this.clusterAddresses = data;
                    })
            },

            pageChanged: function(pageNumber) {
                this.loadClusterDetails(pageNumber);
            },

            showLabChainStaffPaginated: function() {
                this.isShowLabChainStaffCollapsed = false;
                this.loadClusterStaffPaginated();
            },

            staffPageChanged: function(pageNumber) {
                this.loadClusterStaffPaginated(pageNumber)
            },

            loadClusterStaffPaginated: function (page) {
                let p = page || 1;

                this.httpGet('/api/address-details/'+this.addressData.id+'/get-cluster-staff-paginated?page='+p)
                    .then(data => {
                        this.clusterStaff = data;
                    })
            },

            closeSlidedBox: function () {
                this.$emit('closeSlidedBox')
            }
        },

        props: ['employeeList', 'isActive', 'addressId', 'address', 'addressData'],
    }
</script>

<style scoped>

</style>