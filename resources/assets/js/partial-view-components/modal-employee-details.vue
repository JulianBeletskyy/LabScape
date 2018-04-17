<template>
    <div>
        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="myModalLabel">Modal title</h4>
                    </div>
                    <div class="modal-body">
                        ...
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">Save changes</button>
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
                $('#myModal').modal('show');

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