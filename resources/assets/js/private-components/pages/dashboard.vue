<template>
    <div>

        <!-- Main content -->
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

                            <multiple-dropdown-select
                                    class="form-control select-filter used-products-filter"
                                    :name="'Used Products'"
                                    :options="usedProductOptionsForDropDown"
                                    @changed="applyUsedProductsFilter"
                                    ref="productsMultipleDropdownSelect"
                            ></multiple-dropdown-select>

                            <multiple-dropdown-select
                                    class="form-control select-filter tags-filter"
                                    :name="'Tags'"
                                    :options="tagOptionsForDropDown"
                                    @changed="applyTagsFilter"
                                    ref="tagMultipleDropdownSelect"
                            ></multiple-dropdown-select>

                            <select v-model="appliedFilters.sortBy" @change="applyFilters(true)" class="form-control select-filter sort-by-filter">
                                <option selected class="hidden" value="">Sort By</option>
                                <option value="name-asc">Name &uarr;</option>
                                <option value="name-desc">Name &darr;</option>
                                <option value="people-asc">Employee &uarr;</option>
                                <option value="people-desc">Employee &darr;</option>
                                <option value="products-asc">Products &uarr;</option>
                                <option value="products-desc">Products &darr;</option>
                            </select>

                            <a href="javascript:void(0)" class="btn btn-default reset-filters" title="Reset Filters" @click="resetFilters()">
                                <i class="fa fa-remove"></i>
                            </a>
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
                                    <a href="javascript:void(0)" @click="appliedFilters.type = 2; applyFilters()" :class="{'active': appliedFilters.type == 2}">
                                        <span class="oval"></span>
                                        My customers
                                    </a>
                                </li>
                                <li class="potential-customers">
                                    <a href="javascript:void(0)" @click="appliedFilters.type = 1; applyFilters()" :class="{'active': appliedFilters.type == 1}">
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
                    Found {{addressesTotal}} labs. {{totalPointsInCurrentMap}} in current map display
                </div>

                <ul class="sidebar-list">
                    <li v-for="(address, i) in addressList">
                        <div class="item" :class="{'potential-customers':address.customer_status == 1, 'my-customers': address.customer_status == 2}">

                            <div class="item-image">
                                <div class="main-image">
                                    <router-link :to="'/address-details/'+address.id+ (address.people_count? '?all-employees=1' : '')">
                                        <div class="box-p">
                                            <span class="people-count" v-if="address.people_count">See {{address.people_count}} employee{{address.people_count > 1? 's': ''}}</span>

                                            <img class="addr-img" :src="'/images/mask-'+i+'.png'" alt="">
                                        </div>
                                    </router-link>
                                </div>
                                <div class="circle-1"></div>
                                <div class="circle-2"></div>
                            </div>

                            <h3>
                                <router-link :to="'/address-details/'+address.id">{{address.name}}</router-link>

                                <span class="oval"></span>
                            </h3>

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
                </ul>

                <div class="pagination-box">
                    <pagination :records="addressesTotal" ref="paginationDirective" :class="'pagination pagination-sm no-margin pull-right'" :per-page="20" @paginate="pageChanged"></pagination>
                </div>

            </div>

        </section>

    </div>
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
                filterObject: {
                    used_product_list: [],
                    tag_list: []
                },
                appliedFilters: {
                    usedProducts: this.$route.query['used-product-ids[]'] || [],
                    tags: this.$route.query['tag-ids[]'] || [],
                    type:  this.$route.query['type-id'] || '',
                    sortBy: this.$route.query['sort-by'] || '',
                    isOnlySortingChanged: false,
                    globalSearch: this.$route.query['global-search'] || '',
                    addressIds: this.$route.query['address-ids'] || ''
                },
                pagination: {
                    currentPage: 1
                },
                totalPointsInCurrentMap: 0,
                multipleDropdownSelects: [],
                queryUrl: ''
            }
        },

        watch: {
            $route: function (to) {
                // if(this.$route.query['address-ids']){
                //     this.loadAddressesPaginated(true);
                // }

                console.log('this.$route.query', this.$route.query);

                this.initFilters();

                this.composeQueryUrl();

                this.$refs.paginationDirective.setPage(1);

            }
        },

        computed: {
            usedProductOptionsForDropDown: function () {
                return this.filterObject.used_product_list.map(product => {
                    return {
                        label: product.company + (product.name? ': ' + product.name: ''),
                        value: product.id
                    }
                })
            },
            tagOptionsForDropDown: function () {
                return this.filterObject.tag_list.map(tag => {
                    return {
                        label: tag.name,
                        value: tag.id
                    }
                })
            }
        },

        created: function () {

            this.initFilters();

            this.composeQueryUrl();

            this.loadAddressesPaginated();

            this.loadFilterObject();
        },

        mounted: function () {

            $('ul.sidebar-list').height(window.innerHeight - 325);

            this.listenToTotalPointsDisplayedOnMapChanged();

            this.listenToGlobalSearchPerformed();
        },

        methods: {

            initFilters: function () {

                this.appliedFilters.usedProducts = this.$route.query['used-product-ids[]'] || [];

                if(typeof this.appliedFilters.usedProducts === 'string') {
                    this.appliedFilters.usedProducts = [this.appliedFilters.usedProducts ];
                }

                this.appliedFilters.tags = this.$route.query['tag-ids[]'] || [];

                if(typeof this.appliedFilters.tags === 'string') {
                    this.appliedFilters.tags = [this.appliedFilters.tags ];
                }

                this.appliedFilters.type =  this.$route.query['type-id'] || '';
                this.appliedFilters.sortBy = this.$route.query['sort-by'] || '';
                this.appliedFilters.globalSearch = this.$route.query['global-search'] || '';
                this.appliedFilters.addressIds = this.$route.query['address-ids'] || '';

            },

            listenToGlobalSearchPerformed: function () {
                this.$eventGlobal.$on('globalSearchPerformed', (globalSearchQuery) => {
                    this.appliedFilters.globalSearch = this.$route.query['global-search'] || '';
                    if(!this.isFirstLoad) {
                        this.applyFilters();
                    }
                })
            },

            applyUsedProductsFilter: function (data) {
                this.appliedFilters.usedProducts = data;
                this.applyFilters();
            },

            applyTagsFilter: function (data) {
                this.appliedFilters.tags = data;
                this.applyFilters();
            },

            listenToTotalPointsDisplayedOnMapChanged: function () {
                this.$eventGlobal.$on('totalPointsDisplayedOnMapChanged', (totalPoints) => {
                    this.totalPointsInCurrentMap = totalPoints
                });
            },

            composeQueryUrl: function () {
                let queryStr = '';

                if (this.appliedFilters.type) {
                    queryStr += '&type-id=' + this.appliedFilters.type;
                }

                if (this.appliedFilters.globalSearch) {
                    queryStr += '&global-search=' + this.appliedFilters.globalSearch;
                    this.$router.push('/dashboard?global-search=' + this.appliedFilters.globalSearch);
                }

                if (this.appliedFilters.usedProducts.length) {
                    this.appliedFilters.usedProducts.forEach(id => {
                        queryStr += '&used-product-ids[]=' + id;
                    });
                }

                if (this.appliedFilters.tags.length) {
                    this.appliedFilters.tags.forEach(id => {
                        queryStr += '&tag-ids[]=' + id;
                    });
                }

                if(this.$route.query['address-ids']){
                    queryStr += '&address-ids=' + this.$route.query['address-ids'];
                }

                if (this.appliedFilters.sortBy) {
                    queryStr += '&sort-by=' + this.appliedFilters.sortBy;
                }

                this.queryUrl = queryStr;

                return queryStr;
            },

            loadAddressesPaginated: function () {

                let url = '/api/addresses-paginated?page=' + this.pagination.currentPage + this.queryUrl;

                console.log('url',url);

                this.httpGet(url)
                    .then(data => {
                        this.addressesTotal = data.total;
                        this.addressList = data.data;

                        if(!this.appliedFilters.isOnlySortingChanged){
                            this.notifyFiltersHaveBeenApplied();
                        }

                        this.isFirstLoad = false;
                    })

            },

            notifyFiltersHaveBeenApplied: function () {
                this.$eventGlobal.$emit('filtersHaveBeenApplied', this.queryUrl.replace('&','?'));
            },

            pageChanged: function (pageNumber) {
                this.pagination.currentPage = pageNumber;
                this.loadAddressesPaginated();
            },

            loadFilterObject: function() {
                return this.httpGet('/api/addresses-load-filters')
                    .then(data => {
                        this.filterObject = data;
                    })
            },

            applyFilters: function (isOnlySortingChanged) {

                this.appliedFilters.isOnlySortingChanged = !!isOnlySortingChanged;


                this.composeQueryUrl();

                this.$router.push('/dashboard?'+this.queryUrl);
            },

            resetFilters: function () {

                this.$refs.productsMultipleDropdownSelect.resetSelectedValues();
                this.$refs.tagMultipleDropdownSelect.resetSelectedValues();

                this.appliedFilters = {
                    usedProducts: [],
                    tags: [],
                    type: '',
                    sortBy: '',
                    isOnlySortingChanged: false,
                    globalSearch: '',
                    addressIds: ''
                };

                this.$eventGlobal.$emit('resetedAllFilters');

                if(this.$route.query['global-search'] || this.$route.query['address-ids']) {
                    this.$router.push('/dashboard');
                }

                this.applyFilters();
            }
        }
    }
</script>

<style scoped>

</style>