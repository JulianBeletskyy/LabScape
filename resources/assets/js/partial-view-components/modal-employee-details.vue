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

                        <h4 class="modal-title">Dr. med. Edouard Blanc <a href="#"><i class="fa fa-pencil"></i></a></h4>

                        <p class="occupation">Laboratorien Mikrobioligie</p>

                        <p class="place-of-work">at <a href="#">Laboratorium Dr. G. Bichsel AG</a></p>

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
                                        <li>
                                            <p class="occupation">Laboratorien Microbiologie</p>
                                            <p class="work-place">Laboratoruum Dr. G. Bichshel AG</p>
                                            <p class="date">Jun 2015 - Present, 3 yr 6 mon</p>
                                        </li>
                                        <li>
                                            <p class="occupation">Microbiologist</p>
                                            <p class="work-place">Laboratoruum Dr. G. Bichshel AG</p>
                                            <p class="date">Jun 2015 - Present, 3 yr 6 mon</p>
                                        </li>
                                        <li>
                                            <p class="occupation">Radiology specialist training</p>
                                            <p class="work-place">Laboratoruum Dr. G. Bichshel AG</p>
                                            <p class="date">Dec 1999 - Mar 2009, 9 yr 4 mon</p>
                                        </li>
                                    </ul>
                                </div>

                                <div v-if="activeTab == 'news'"></div>

                                <div v-if="activeTab == 'publications'"></div>

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
                personData: {},
                activeTab: 'career'
            }
        },

        methods: {
            init: function (personId) {
                $('#personal-modal').modal('show');

                this.personId = personId;

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
            this.$eventGlobal.$on('showModalEmployeeDetails', (personId) => {
                this.init(personId);
            });
        }
    }
</script>

<style scoped>

</style>