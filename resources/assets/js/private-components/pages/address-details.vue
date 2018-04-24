<template>
    <section class="sidebar">
        <div class="address-details-container slider-container" :class="{expanded: isExpanded}">

            <div class="slided-box">

                <div v-if="sideComponentToDisplay == 'all-employee'">
                    <all-employee-list
                            :addressId="addressId"
                            :isActive="isExpanded && sideComponentToDisplay == 'all-employee'"
                            :employeeList="addressData.people"
                            :address="addressData"
                            @closeSlidedBox="isExpanded = false"
                    ></all-employee-list>
                </div>

                <div v-if="sideComponentToDisplay == 'lab-chain-details'">
                    <lab-chain-details
                            :isActive="isExpanded && sideComponentToDisplay == 'lab-chain-details'"
                            :addressId="addressId"
                            :addressData="addressData"
                            @closeSlidedBox="isExpanded = false"
                    ></lab-chain-details>
                </div>

            </div>

            <div class="address-details-fixed-height">

                <router-link to="/dashboard" title="Back to dashboard" class="link-back arrow-left">
                    <i class="fa fa-angle-left"></i>
                </router-link>

                <div class="address-overview">

                    <h2>
                        <span>{{addressData.name}}</span>
                        <a href="#"><i class="fa fa-pencil"></i></a>

                        <a href="javascript:void(0)" title="Show on Map" @click="showOnMap()"><i class="fa fa-map-marker"></i></a>
                    </h2>


                    <select class="customer-status-select-box" @change="updateCustomerStatus()" v-model="addressData.customer_status">
                        <option :value="null" hidden disabled="disabled" class="hidden">Customer Status</option>
                        <option v-for="cs in customerStatusList" :value="cs.id">{{cs.name}}</option>
                    </select>

                    <div style="clear: both"></div>

                    <p class="lab-chain">
                        <span class="current-chain-name">{{addressData.cluster.name}}</span>

                        <br />

                        <span class="lab-chain-text">Lab Chain:</span>
                        <a href="#" class="add-to-chain-link">Add to Chain</a>
                    </p>

                    <ul class="tag-list">
                        <li v-for="tag in addressData.tags"><a href="">{{tag.name}}</a></li>
                    </ul>

                    <p class="address-line">
                        {{addressData.address}}
                    </p>

                    <p class="link-and-phone">
                        <a :href="addressData.url" target="_blank">{{addressData.url.replace('https://', '').replace('http://', '')}}</a>
                        <span class="pone-number">{{addressData.phone}}</span>
                    </p>
                </div>

                <div class="staff-overview address-box">
                    <div class="header">
                        <h3>Staff <a href="#"><i class="fa fa-pencil"></i></a></h3>
                        <a href="javascript:void(0)" @click="showContactsChain(addressData)" class="view-contacts-chain">View Relationship Graph</a>
                    </div>

                    <p v-if="!addressData.people.length" class="empty-data-p">There are no employees yet.</p>

                    <ul class="staff-list">
                        <li v-if="i < 3" v-for="(person, i) in addressData.people">
                            <div class="image">
                                <a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressData.id, addressData)">
                                    <span class="person-initials">{{getPersonInitials(person.name)}}</span>
                                    <img :src="'/images/mask-'+i+'.png'" alt="">
                                </a>
                            </div>
                            <div class="personal-info">
                                <p class="name"><a href="javascript:void(0)" @click="showEmployeeDetailsModal(person.id, addressData.id, addressData)">{{person.name}}</a></p>
                                <p class="occupation">{{person.description}}</p>
                            </div>
                        </li>
                    </ul>

                    <div style="clear: both"></div>

                    <a href="javascript:void(0)" @click="showSlidedBox('all-employee')" class="address-box-show-more-link">Show all Employees</a>
                </div>

                <div class="used-products-overview address-box">
                    <div class="header">
                        <h3>Used Products <a href="#"><i class="fa fa-pencil"></i></a></h3>
                    </div>

                    <p v-if="!addressData.products.length" class="empty-data-p">There are no used products</p>

                    <ul class="used-products-list" v-if="addressData.products.length">
                        <li v-if="i < 3" v-for="(product, i) in addressData.products" :title="product.name? product.company + ': ' + product.name : product.company">
                            <span class="image"></span>
                            <span class="prod-name">
                            {{product.name? product.company + ': ' + product.name : product.company}}
                        </span>
                        </li>
                        <li>
                            <a href="" class="show-all-link">Show all products</a>
                        </li>
                    </ul>
                </div>

                <div class="lab-chain-members-overview address-box">
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

                    <a href="javascript:void(0)" @click="showSlidedBox('lab-chain-details')" v-if="addressData.cluster.addresses.length > 1" class="address-box-show-more-link">Show all lab chain members</a>
                </div>

                <div class="lab-news-overview address-box">
                    <div class="header">
                        <h3>Lab News <a href="#"><i class="fa fa-plus"></i></a></h3>
                    </div>

                    <ul class="lab-news-list">
                        <li>
                            <p class="date">Feb 21, 2018</p>
                            <h4>New employee <a href="#">Jina James</a> joined the lab</h4>
                        </li>
                        <li>
                            <p class="date">Feb 21, 2018</p>
                            <h4>High-precision analysis of DNA is now provided by lab</h4>
                        </li>
                    </ul>

                    <a href="#" class="address-box-show-more-link">Go to Lab News</a>
                </div>
            </div>

        </div>
    </section>
</template>

<script>

    import http from '../../mixins/http';
    import employeeModal from '../../mixins/show-employee-details-modal';
    import getPersonInitials from '../../mixins/get-person-initials';

    export default {
        mixins: [http, employeeModal, getPersonInitials],

        data: function () {
            return {
                addressId: null,
                addressData: {
                    tags: [],
                    url: '',
                    cluster: {
                        addresses: []
                    },
                    people: [],
                    products: []
                },
                customerStatusList: [],
                isExpanded: false,
                sideComponentToDisplay: ''
            }
        },

        watch:{
            $route: function(to){
                this.addressId = this.$route.params['id'];
                this.loadAddressDetails();
            }
        },

        methods: {
            loadAddressDetails: function () {

                this.httpGet('/api/address-details/'+this.addressId)
                    .then(data => {
                        this.addressData = data;
                    })

            },
            loadCustomerStatusList: function () {
                this.httpGet('/api/customer-statuses')
                    .then(data => {
                        this.customerStatusList = data;
                    })
            },
            updateCustomerStatus: function () {
                this.httpPut('/api/address-details/'+this.addressId+'/update-status', {status: this.addressData.customer_status})
                    .then(data => {
                        alertify.notify('Status has been updated.', 'success', 3);
                    })
            },
            showSlidedBox: function (componentToDisplay) {

                if(this.sideComponentToDisplay == componentToDisplay){
                    this.isExpanded = !this.isExpanded;
                }
                else {
                    this.isExpanded = true;
                }

                this.sideComponentToDisplay = componentToDisplay;
            },
            showContactsChain: function (addressData) {
                this.$eventGlobal.$emit('showModalContactsChain', addressData)
            },

            showOnMap: function () {
                this.$eventGlobal.$emit('showSpecificItem', [this.addressData])
            }
        },

        mounted: function () {

            $('.address-details-fixed-height').height(window.innerHeight - 70 -51);
            $('.slided-box').height(window.innerHeight - 70 -51);

            this.addressId = this.$route.params.id;

            this.loadAddressDetails();
            this.loadCustomerStatusList();
        }
    }
</script>

<style scoped>

</style>