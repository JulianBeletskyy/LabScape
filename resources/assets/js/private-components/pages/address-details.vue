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

                    <customer-status-select
                            :options="customerStatusList"
                            :selected="addressData.customer_status"
                            :addressId="addressId"
                            @customerStatusUpdated="updateCustomerStatus"
                    ></customer-status-select>

                    <div v-if="!isEditing">
                        <h2>
                            <span>{{addressData.name}}</span>

                            <a href="javascript:void(0)" @click="toggleEditing" :class="{'active': isEditing}">
                                <i class="fa fa-pencil"></i>
                            </a>

                            <a href="javascript:void(0)" title="Show on Map" @click="showOnMap()"><i class="fa fa-map-marker"></i></a>
                        </h2>

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

                    <div v-else>
                        <h2>
                            <span class="can-edit" @click="toggleEditingInput('name')">
                                {{addressData.name}}
                            </span>

                            <a href="javascript:void(0)" @click="toggleEditing" :class="{'active': isEditing}">
                                <i class="fa fa-pencil"></i>
                            </a>

                            <a href="javascript:void(0)" title="Show on Map" @click="showOnMap()"><i class="fa fa-map-marker"></i></a>
                        </h2>

                        <div style="clear: both"></div>

                        <div v-if="editingInput === 'name'" class="edit-input-block">
                            <input v-model="addressData.name" class="form-control" type="text">
                        </div>

                        <p class="lab-chain">
                            <span class="current-chain-name">{{addressData.cluster.name}}</span>

                            <br />

                            <span class="lab-chain-text">Lab Chain:</span>
                            <a href="#" class="add-to-chain-link">Add to Chain</a>
                        </p>

                        <v-select
                                v-model="addressData.tags"
                                :options="allTags"
                                :label="'name'"
                                multiple
                                taggable
                                push-tags
                        ></v-select>

                        <p class="address-line can-edit" @click="toggleEditingInput('address')">
                            {{addressData.address}}
                        </p>

                        <div v-if="editingInput === 'address'" class="edit-input-block">
                            <input v-model="addressData.address" class="form-control" type="text">
                        </div>

                        <p class="link-and-phone">
                            <a class="can-edit" @click="toggleEditingInput('url')">
                                {{addressData.url.replace('https://', '').replace('http://', '')}}
                            </a>
                            <span class="pone-number can-edit" @click="toggleEditingInput('phone')">
                                {{addressData.phone}}
                            </span>
                        </p>

                        <div v-if="editingInput === 'url'" class="edit-input-block">
                            <input v-model="addressData.url" class="form-control" type="text">
                        </div>

                        <div v-if="editingInput === 'phone'" class="edit-input-block">
                            <input v-model="addressData.phone" class="form-control" type="text">
                        </div>

                        <div class="confirm-edit-block">
                            <button v-if="saveBtnDisabled" disabled class="btn btn-primary">Save</button>
                            <button v-else @click="updateAddress" class="btn btn-primary">Save</button>
                            <button @click="toggleEditing" class="btn btn-warning">Cancel</button>
                        </div>
                    </div>
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

                    <a href="javascript:void(0)"
                       v-if="addressData.people && addressData.people.length > 3"
                       @click="showSlidedBox('all-employee')"
                       class="address-box-show-more-link show-all-employees-link"
                    >
                        Show all Employees
                    </a>
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
                            <a href="" class="show-all-link">Show all</a>
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

                    <a href="javascript:void(0)" @click="showSlidedBox('lab-chain-details')" v-if="addressData.cluster.addresses.length > 1" class="address-box-show-more-link">Lab Chain Details</a>
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
                sideComponentToDisplay: '',
                isFirstLoad: true,

                isEditing: false,
                editingInput: null,
                saveBtnDisabled: false,
                old: {
                    name: '',
                    address: '',
                    url: '',
                    phone: '',
                    tags: []
                },
                allTags: []
            }
        },

        watch:{
            $route: function(to){
                this.addressId = this.$route.params['id'];
                this.loadAddressDetails();

                if(!this.isFirstLoad) {
                    this.showModalIfPersonHashDetected();
                }
            },
            isEditing: function () {
                if (!this.isEditing) {
                    this.editingInput = null;
                }
            },
            "addressData.name": function () {
                this.saveBtnDisabled = this.addressData.name === '' ?  true : false;
            },
            "addressData.address": function () {
                this.saveBtnDisabled = this.addressData.address === '' ?  true : false;
            },
            "addressData.url": function () {
                this.saveBtnDisabled = this.addressData.url === '' ?  true : false;
            },
            "addressData.phone": function () {
                this.saveBtnDisabled = this.addressData.phone === '' ?  true : false;
            },
            "addressData.tags": function () {
                this.saveBtnDisabled = this.addressData.tags.length < 1 ?  true : false;
            },
        },

        methods: {
            loadAddressDetails: function () {

                return this.httpGet('/api/address-details/'+this.addressId)
                    .then(data => {
                        this.addressData = data;
                        document.title = this.addressData.name;
                    })

            },
            loadCustomerStatusList: function () {
                this.httpGet('/api/customer-statuses')
                    .then(data => {
                        this.customerStatusList = data;
                    })
            },
            updateCustomerStatus: function (status) {
                this.httpPut('/api/address-details/'+this.addressId+'/update-status', {status: status})
                    .then(data => {
                        this.addressData.customer_status = data.customer_status;
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
            },

            showModalIfPersonHashDetected: function () {
                if(this.$route.hash.indexOf('#person-') !== -1) {

                    let personId = this.$route.hash.replace('#person-','');

                    this.showEmployeeDetailsModal(personId, this.addressId, this.addressData);
                }
            },

            loadAllTags: function () {
                this.httpGet('/api/address-details/'+this.addressId+'/get-all-tags')
                    .then(data => {
                        this.allTags = data;
                    })
            },
            loadSelectedTags: function () {
                this.httpGet('/api/address-details/'+this.addressId+'/load-selected-tags')
                    .then(data => {
                        this.old.tags = data;
                    })
            },
            toggleEditing: function () {

                this.isEditing = !this.isEditing;

                if (!this.isEditing) {
                    this.addressData.name = this.old.name;
                    this.addressData.address = this.old.address;
                    this.addressData.url = this.old.url;
                    this.addressData.phone = this.old.phone;
                    this.addressData.tags = this.old.tags;
                } else {
                    this.loadSelectedTags();
                }
            },
            toggleEditingInput: function (input) {
                this.editingInput = input;
            },
            updateAddress: function () {
                this.httpPut('/api/address-details/'+this.addressData.id+'/update-details', {
                    name: this.addressData.name,
                    address: this.addressData.address,
                    url: this.addressData.url,
                    phone: this.addressData.phone,
                    tags: this.addressData.tags
                })
                    .then(data => {
                        this.old.name = this.addressData.name;
                        this.old.address = this.addressData.address;
                        this.old.url = this.addressData.url;
                        this.old.phone = this.addressData.phone;
                        this.loadAllTags();
                        this.loadSelectedTags();
                        alertify.notify('Address has been updated.', 'success', 3);
                    })
            }
        },

        mounted: function () {

            $('.address-details-fixed-height').height(window.innerHeight - 70 -51);
            $('.slided-box').height(window.innerHeight - 70 -51);

            this.addressId = this.$route.params.id;

            this.loadAllTags();

            this.loadAddressDetails()
                .then(()=>{
                    this.showModalIfPersonHashDetected();
                    this.isFirstLoad = false;

                    this.old.name = this.addressData.name;
                    this.old.address = this.addressData.address;
                    this.old.url = this.addressData.url;
                    this.old.phone = this.addressData.phone;
                });

            this.loadCustomerStatusList();

            if(this.$route.query['all-employees']){
                setTimeout(()=>{
                    this.showSlidedBox('all-employee');
                },0)
            }
        },
    }
</script>

<style scoped>

</style>