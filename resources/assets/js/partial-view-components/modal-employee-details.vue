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
                            at <a href="#">{{currentAddress.name}}</a>
                        </p>

                        <ul class="social-icons">
                            <li><a href=""><i class="fa fa-linkedin"></i></a></li>
                            <li><a href=""><i class="fa fa-twitter"></i></a></li>
                            <li><a href=""><i class="fa fa-facebook"></i></a></li>
                            <li><a href=""><i class="fa fa-instagram"></i></a></li>
                        </ul>

                        <div class="row person-experience">
                            <div :class="yearsAtThisJob? 'col-md-4': 'col-md-6'">
                                <p class="number">{{experienceYears}}</p>
                                <p class="text">Years Experience</p>
                            </div>

                            <div class="col-md-4" v-if="yearsAtThisJob">
                                <p class="number">{{yearsAtThisJob}}</p>
                                <p class="text">Years at this Job</p>
                            </div>

                            <div :class="yearsAtThisJob? 'col-md-4': 'col-md-6'">
                                <p class="number">
                                    <img src="/images/ic-education.png" alt="">
                                </p>
                                <p class="text">{{personData.role}}</p>
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
                                            <p class="occupation">{{workPlace(career)}}</p>
                                            <p class="work-place">{{career.role}}</p>
                                            <p class="date">{{endDate(career.enddate)}}</p>
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

                                    <p style="text-align: center" v-if="!personData.publications.length">This person doesn't have publications yet.</p>

                                    <ul class="publication-list" v-if="personData.publications.length">
                                        <li v-for="publication in personData.publications">
                                            <p class="title">
                                                {{publication.title}}
                                                <a :href="publication.url" target="_blank"><i class="fa fa-external-link"></i></a>
                                            </p>
                                            <p class="description">
                                                {{publication.journal}}
                                            </p>
                                        </li>
                                    </ul>
                                </div>

                                <div v-if="activeTab == 'relationships'">

                                    <p style="text-align: center" v-if="!personData.relationships.length">This person doesn't have relationships yet.</p>

                                    <ul class="staff-list" v-if="personData.relationships && personData.relationships.length">

                                        <li v-for="relation in personData.relationships">
                                            <div class="image">
                                                <img src="/images/anonimus-person_100x100.png" alt="">
                                            </div>
                                            <div class="personal-info">
                                                <p class="name"><a href="javascript:void(0)">{{relation.name}}</a></p>
                                                <p class="occupation" style="text-align: left">{{relation.description}}</p>
                                                <p class="connection-type" style="text-align: left">{{connectionName(relation.pivot.edge_type)}}</p>
                                            </div>
                                        </li>
                                    </ul>

                                </div>

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
                currentAddress: {},
                personData: {
                    careers: [],
                    publications: []
                },
                activeTab: 'career',
                connectionTypes: []
            }
        },

        computed: {
            experienceYears: function() {

                if(!this.personData.careers.length) {
                    return 0;
                }

                let startDate = moment(this.personData.careers[this.personData.careers.length-1].enddate);
                let now = moment();

                return now.diff(startDate, 'years');
            },

            yearsAtThisJob: function () {
                if (!this.personData.careers.length) {
                    return 0;
                }

                let recordInCareer = this.personData.careers.find(el => el.address_id == this.currentAddressId);

                if (!recordInCareer) {
                    return 0;
                }

                let startDate = moment(recordInCareer.enddate);

                let now = moment();

                return _.round(now.diff(startDate, 'days') / 365 , 1);
            }
        },

        methods: {
            connectionName: function (id) {
                let connection = this.connectionTypes.find(el => el.id == id);

                return connection? connection.name : id;
            },
            endDate: function (date) {
                return moment(date).format('MMM YYYY');
            },
            workPlace: function (career) {
                if (career.address_id) {
                    return (this.personData.addresses.find(addr => addr.id == career.address_id)).name;
                }
                else {
                    return career.address_name_override;
                }
            },
            init: function (personId, addressId, address) {
                $('#personal-modal').modal('show');

                this.personId = personId;
                this.currentAddressId = addressId;
                this.currentAddress = address;

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
            this.httpGet('/api/connection-types')
                .then(data => {
                    this.connectionTypes = data;
                });

            this.$eventGlobal.$on('showModalEmployeeDetails', (data) => {
                this.init(data.personId, data.addressId, data.address);
            });
        }
    }
</script>

<style scoped>

</style>