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
                                <li class="active"><a href="#tab_1" data-toggle="tab" aria-expanded="true">Career</a></li>
                                <li class=""><a href="#tab_2" data-toggle="tab" aria-expanded="false">News</a></li>
                                <li class=""><a href="#tab_3" data-toggle="tab" aria-expanded="false">Publications</a></li>
                                <li class=""><a href="#tab_3" data-toggle="tab" aria-expanded="false">Relationships</a></li>
                            </ul>
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
                personData: {}
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