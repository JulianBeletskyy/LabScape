<template>
    <div>
        <div class="modal fade" id="personal-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">

                        <div class="person-profile-picture">
                            <img src="/images/anonimus-person_100x100.png" alt="">
                        </div>

                        <!--<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>-->

                        <h4 class="modal-title">{{personData.name}} <a href="#"><i class="fa fa-pencil"></i></a></h4>

                        <p class="occupation">{{personData.description}}</p>

                        <p class="place-of-work" v-if="personData.careers && personData.careers.length">
                            at <a href="#">{{personData.careers[0].address_name_override}}</a>
                        </p>

                        <ul class="social-icons">
                            <li><a href=""><i class="fa fa-linkedin"></i></a></li>
                            <li><a href=""><i class="fa fa-twitter"></i></a></li>
                            <li><a href=""><i class="fa fa-facebook"></i></a></li>
                            <li><a href=""><i class="fa fa-instagram"></i></a></li>
                        </ul>

                        <div class="row person-experience">
                            <div class="col-md-4">
                                <p class="number">17</p>
                                <p class="text">Years Experience</p>
                            </div>

                            <div class="col-md-4">
                                <p class="number">3.5</p>
                                <p class="text">Years at this Job</p>
                            </div>

                            <div class="col-md-4">
                                <p class="number">
                                    <img src="/images/ic-education.png" alt="">
                                </p>
                                <p class="text">Medical Doctor</p>
                            </div>
                        </div>

                        <div class="view-contacts-chain-container">
                            <a href="javascript:void(0)">View Contact Chain</a>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div>
                            <ul class="nav nav-tabs person-tabs">
                                <li :class="{'active': activeTab == 'career'}">
                                    <a href="javascript:void(0)" @click="setTabActive('career')" data-toggle="tab" aria-expanded="true">Career</a></li>
                                <li :class="{'active': activeTab == 'news'}">
                                    <a href="javascript:void(0)" @click="setTabActive('news')" data-toggle="tab" aria-expanded="false">News</a></li>
                                <li :class="{'active': activeTab == 'publications'}">
                                    <a href="javascript:void(0)" @click="setTabActive('publications')" data-toggle="tab" aria-expanded="false">Publications</a></li>
                                <li :class="{'active': activeTab == 'relationships'}">
                                    <a href="javascript:void(0)" @click="setTabActive('relationships')" data-toggle="tab" aria-expanded="false">Relationships</a></li>
                            </ul>

                            <div class="tab-content">

                                <div v-if="activeTab == 'career'">
                                    <ul class="career-list">
                                        <li v-for="career in personData.careers">
                                            <p class="occupation">{{career.role}}</p>
                                            <p class="work-place">{{workPlace(career)}}</p>
                                            <p class="date">till: {{endDate(career.enddate)}}</p>
                                        </li>
                                    </ul>
                                </div>

                                <div v-if="activeTab == 'news'">
                                    <ul class="news-list">
                                        <li>
                                            <p class="date">Feb 21, 2018</p>
                                            <div class="news-box">
                                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam itaque laborum</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p class="date">Feb 21, 2018</p>
                                            <div class="news-box">
                                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam itaque laborum</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p class="date">Feb 21, 2018</p>
                                            <div class="news-box">
                                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam itaque laborum</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p class="date">Feb 21, 2018</p>
                                            <div class="news-box">
                                                <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam itaque laborum</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                <div v-if="activeTab == 'publications'">
                                    <ul class="publication-list">
                                        <li>
                                            <p class="title">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                                <a href="#"><i class="fa fa-external-link"></i></a>
                                            </p>
                                            <p class="description">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam
                                            </p>
                                        </li>

                                        <li>
                                            <p class="title">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                                <a href="#"><i class="fa fa-external-link"></i></a>
                                            </p>
                                            <p class="description">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam
                                            </p>
                                        </li>

                                        <li>
                                            <p class="title">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                                                <a href="#"><i class="fa fa-external-link"></i></a>
                                            </p>
                                            <p class="description">
                                                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Blanditiis esse facilis ipsa ipsam
                                            </p>
                                        </li>
                                    </ul>
                                </div>

                                <div v-if="activeTab == 'relationships'"></div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import http from '../mixins/http';

    export default {
        mixins: [http],

        data: function () {
            return {
                personId: null,
                currentAddressId: null,
                personData: {
                    careers: []
                },
                activeTab: 'career'
            }
        },

        computed: {

        },

        methods: {
            endDate: function (date) {
                return moment(date).format('MMM DD, YYYY');
            },
            workPlace: function (career) {
                if (career.address_id) {
                    return (this.personData.addresses.find(addr => addr.id == career.address_id)).name;
                }
                else {
                    return career.address_name_override;
                }
            },
            init: function (personId, addressId) {
                $('#personal-modal').modal('show');

                this.personId = personId;
                this.currentAddressId = addressId;

                this.httpGet('/api/people/'+personId)
                    .then(data => {
                        this.personData = data;
                    })
            },
            setTabActive: function (tabName) {
                this.activeTab = tabName;
            }
        },

        mounted: function(){
            this.$eventGlobal.$on('showModalEmployeeDetails', (data) => {
                this.init(data.personId, data.addressId);
            });
        }
    }
</script>

<style scoped>

</style>