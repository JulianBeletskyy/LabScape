<template>
    <aside class="main-sidebar">
        <!-- sidebar: style can be found in sidebar.less -->
        <section class="sidebar">

            <div class="sidebar-form">
                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group">
                            <select class="form-control select-filter type-filter">
                                <option>Type</option>
                                <option>option 2</option>
                                <option>option 3</option>
                                <option>option 4</option>
                                <option>option 5</option>
                            </select>
                            <select class="form-control select-filter used-products-filter">
                                <option>Used Products</option>
                                <option>Tags</option>
                                <option>option 3</option>
                                <option>option 4</option>
                                <option>option 5</option>
                            </select>
                            <select class="form-control select-filter tags-filter">
                                <option>Tags</option>
                                <option>option 2</option>
                                <option>option 3</option>
                                <option>option 4</option>
                                <option>option 5</option>
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
                                    <a href="javascript:void(0)" class="active">
                                        All Labs</a>
                                </li>
                                <li class="my-customers">
                                    <a href="javascript:void(0)">
                                        <span class="oval"></span>
                                        My customers
                                    </a>
                                </li>
                                <li class="potential-customers">
                                    <a href="javascript:void(0)">
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
                user: {},
                addressList: [],
                addressesTotal: 0
            }
        },

        created: function () {
            this.$eventGlobal.$on('update-user-profile', (data) => {
                this.user = data;
            });

            this.loadAddressesPaginated(1)
        },

        methods: {

            loadAddressesPaginated: function (page) {

                this.httpGet('/api/addresses-paginated?page='+page)
                    .then(data => {
                        console.log('dara', data);
                        this.addressesTotal = data.total;
                        this.addressList = data.data;
                    })

            },

            pageChanged: function (pageNumber) {
                this.loadAddressesPaginated(pageNumber)
            }
        }
    }
</script>

<style scoped>

</style>