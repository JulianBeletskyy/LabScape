<template>
    <aside class="main-sidebar">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">

            <div class="sidebar-form">
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <select v-model="appliedFilters.type" @change="applyFilters()" class="form-control select-filter type-filter">
                                <option selected class="hidden" value="">Type</option>
                                <option value="">All</option>
                                <option v-for="type in filterObject.customer_types" :value="type.id">
                                    {{type.name}}
                                </option>
                            </select>

                            <select v-model="appliedFilters.usedProducts" @change="applyFilters()" class="form-control select-filter used-products-filter">
                                <option selected class="hidden" value="">Used Products</option>
                                <option v-for="product in filterObject.used_product_list" :value="product.id">
                                    {{product.company}}<span v-if="product.name">: {{product.name}}</span>
                                </option>
                            </select>

                            <select v-model="appliedFilters.tag" @change="applyFilters()" class="form-control select-filter tags-filter">
                                <option selected class="hidden" value="">Tags</option>
                                <option v-for="tag in filterObject.tag_list" :value="tag.id">
                                    {{tag.name}}
                                </option>
                            </select>

                            <select class="form-control select-filter sort-by-filter">
                                <option>Sort By</option>
                                <option>option 2</option>
                                <option>option 3</option>
                                <option>option 4</option>
                                <option>option 5</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group margin-bottom-0">
                            <ul class="tab-filter">
                                <li>
                                    <a href="javascript:void(0)" @click="appliedFilters.type = ''; applyFilters()" :class="{'active': appliedFilters.type == ''}">
                                        All Labs</a>
                                </li>
                                <li class="my-customers">
                                    <a href="javascript:void(0)" @click="appliedFilters.type = 1; applyFilters()" :class="{'active': appliedFilters.type == 1}">
                                        <span class="oval"></span>
                                        My customers
                                    </a>
                                </li>
                                <li class="potential-customers">
                                    <a href="javascript:void(0)" @click="appliedFilters.type = 2; applyFilters()" :class="{'active': appliedFilters.type == 2}">
                                        <span class="oval"></span>
                                        Potential Customers
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /.search form -->

            <div class="sidebar-list-box">

                <div class="found-result-statistics">
                    Found {{addressesTotal}} labs. ---- in current map display
                </div>

                <ul class="sidebar-list">
                    <li v-for="address in addressList">
                        <div class="item potential-customers">

                            <div class="item-image">
                                <div class="main-image">
                                    <img src="/images/anonimus-person_100x100.png" alt="">
                                </div>
                                <div class="circle-1"></div>
                                <div class="circle-2"></div>
                            </div>

                            <h3>{{address.name}} <span class="oval"></span></h3>

                            <p class="address">{{address.address}}</p>

                            <p class="lab-chain-p" v-if="address.cluster">Lab Chain: <strong>{{address.cluster.name}}</strong></p>

                            <ul class="tag-list" v-if="address.tags && address.tags.length">
                                <li v-for="tag in address.tags">
                                    <a href="#">{{tag.name}}</a>
                                </li>
                            </ul>

                            <div class="info-block">
                                <div class="lightening-icon">
                                    <img src="/images/blue-lightening.png" alt="">
                                </div>

                                <div class="news-label">
                                    New employer <a href="#" class="news-link">Jina James</a> joined the lab
                                </div>

                                <a href="#" class="news-link more-news-link">
                                    +3 more news
                                </a>
                            </div>

                        </div>
                    </li>

                    <li>
                        <div class="item my-customers">

                            <div class="item-image">
                                <img src="/images/person.png" class="main-image" alt="">
                                <div class="circle-1"></div>
                                <div class="circle-2"></div>
                            </div>

                            <h3>Visp Hospital <span class="oval"></span></h3>

                            <p class="address">Route de l'Hopital 1, 1681 Billens-Hennens. Switzerland</p>

                            <p class="lab-chain-p">Lab Chain: <strong>NorthernLabs</strong></p>

                            <ul class="tag-list">
                                <li>
                                    <a href="#">Radiology</a>
                                </li>
                                <li>
                                    <a href="#">ISO</a>
                                </li>
                            </ul>

                            <div class="info-block">
                                <div class="lightening-icon">
                                    <img src="/images/blue-lightening.png" alt="">
                                </div>

                                <div class="news-label">
                                    Lab exhibited a new method of lobotomy Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus accusantium aperiam dignissimos enim eveniet
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>

                <div class="pagination-box">
                    <pagination :records="addressesTotal" :class="'pagination pagination-sm no-margin pull-right'" :per-page="20" @paginate="pageChanged"></pagination>
                </div>

            </div>

        </section>
        <!-- /.sidebar -->
    </aside>
</template>

<script>

    import http from '../../mixins/http';

    export default {

        mixins: [http],

        data: function () {
            return {
                isFirstLoad: true,
                user: {},
                addressList: [],
                addressesTotal: 0,
                filterObject: {},
                appliedFilters: {
                    usedProducts: '',
                    tag: '',
                    type: ''
                },
                pagination: {
                    currentPage: 1
                }
            }
        },

        created: function () {
            this.$eventGlobal.$on('update-user-profile', (data) => {
                this.user = data;
            });

            this.loadAddressesPaginated();

            this.loadFilterObject();
        },

        methods: {

            composeQueryUrl: function () {
                let queryStr = '';

                if (this.appliedFilters.usedProducts) {
                    queryStr += '&used_product_id=' + this.appliedFilters.usedProducts;
                }

                if (this.appliedFilters.tag) {
                    queryStr += '&tag_id=' + this.appliedFilters.tag;
                }

                if (this.appliedFilters.type) {
                    queryStr += '&type_id=' + this.appliedFilters.type;
                }

                return queryStr;
            },

            loadAddressesPaginated: function () {

                this.httpGet('/api/addresses-paginated?page=' + this.pagination.currentPage + this.composeQueryUrl())
                    .then(data => {
                        console.log('dara', data);
                        this.addressesTotal = data.total;
                        this.addressList = data.data;

                        if(!this.isFirstLoad) {
                            this.notifyAddressListUpdated();
                        }

                        this.isFirstLoad = false;
                    })

            },

            notifyAddressListUpdated: function () {
                this.$eventGlobal.$emit('addressListUpdated', JSON.parse(JSON.stringify(this.addressList)));
            },

            pageChanged: function (pageNumber) {
                this.pagination.currentPage = pageNumber;
                this.loadAddressesPaginated();
            },

            loadFilterObject: function() {
                this.httpGet('/api/addresses-load-filters')
                    .then(data => {
                        this.filterObject = data;
                    })
            },

            applyFilters: function () {
                console.log('appliedFilters', this.appliedFilters);
                this.loadAddressesPaginated();
            }
        }
    }
</script>

<style scoped>

</style>