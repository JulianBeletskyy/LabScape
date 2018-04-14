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

                            <select v-model="appliedFilters.sortBy" @change="applyFilters(true)" class="form-control select-filter sort-by-filter">
                                <option selected class="hidden" value="">Sort By</option>
                                <option value="name-asc">Name ASC</option>
                                <option value="name-desc">Name DESC</option>
                                <option>option 4</option>
                                <option>option 5</option>
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
                    Found {{addressesTotal}} labs. {{totalPointsInCurrentMap}} in current map display
                </div>

                <ul class="sidebar-list">
                    <li v-for="address in addressList">
                        <div class="item" :class="{'potential-customers':address.customer_status == 2, 'my-customers': address.customer_status == 1}">

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
                    type: '',
                    sortBy: ''
                },
                pagination: {
                    currentPage: 1
                },
                totalPointsInCurrentMap: 0
            }
        },

        created: function () {
            this.$eventGlobal.$on('update-user-profile', (data) => {
                this.user = data;
            });

            this.loadAddressesPaginated();

            this.loadFilterObject();
        },

        mounted: function () {
            this.listenToTotalPointsDisplayedOnMapChanged();
        },

        methods: {

            listenToTotalPointsDisplayedOnMapChanged: function () {
                this.$eventGlobal.$on('totalPointsDisplayedOnMapChanged', (totalPoints) => {
                    this.totalPointsInCurrentMap = totalPoints
                });
            },

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

                if (this.appliedFilters.sortBy) {
                    queryStr += '&sort_by=' + this.appliedFilters.sortBy;
                }

                return queryStr;
            },

            loadAddressesPaginated: function () {

                this.httpGet('/api/addresses-paginated?page=' + this.pagination.currentPage + this.composeQueryUrl())
                    .then(data => {
                        console.log('dara', data);
                        this.addressesTotal = data.total;
                        this.addressList = data.data;

                        if(!this.isFirstLoad && this.pagination.currentPage == 1) {
                            this.notifyFiltersHaveBeenApplied();
                        }

                        this.isFirstLoad = false;
                    })

            },

            notifyFiltersHaveBeenApplied: function () {
                this.$eventGlobal.$emit('filtersHaveBeenApplied', this.composeQueryUrl().replace('&','?'));
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

            applyFilters: function (isSortingChanged) {
                console.log('appliedFilters', this.appliedFilters);

                if(!isSortingChanged) {
                    this.pagination.currentPage = 1;
                }

                this.loadAddressesPaginated();
            },

            resetFilters: function () {

                this.appliedFilters = {
                    usedProducts: '',
                    tag: '',
                    type: ''
                };

                this.applyFilters();
            }
        }
    }
</script>

<style scoped>

</style>