<template>
    <div>
        <div class="modal fade" id="contacts-chain" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <!--<script type="text/javascript" src="/js/graph.js"></script>-->
                    <div class="modal-body">
                        <div id="graphCanvasContainer">
                            <div id="graphCanvasMovableContainer" onclick="exitFullScreen(event)">
                                <div class="column" id="nodeInfo" style="display: none;" onclick="nodeInfoClick(event)">
                                    <div class="nodeInfoRow topRow" id="nodeTitle">

                                    </div>
                                    <div class="nodeInfoRow topRow">
                                        <img src="/images/graph/external_link.svg" class="graphIcon" id="externalLinkIcon" @click="_openNodeInfoExternalLink()"> <span id="moreDetailsLabel">More details</span>
                                    </div>
                                    <div class="nodeInfoRow" id="employeeInfo">
                                        <div id="employeeCount"></div>
                                        <div id="employeeRoles">Roles</div>
                                        <div>
                                            <select id="workerTypeSelect" onchange="updateEmployeeList()">
                                            </select>
                                        </div>
                                        <div id="employeeList">

                                        </div>
                                    </div>
                                </div>
                                <div id="graphCanvasWhiteBackground" onclick="graphCanvasWhiteBackgroundClick(event)">
                                    <div class="column" id="graphCanvas"></div>
                                    <div id="graphFunctionIcons">
                                        <div id="dataSourceSelectContainer">
                                            <select id="dataSourceSelect" multiple onchange="dataSourceSelectChange()">
                                                <option value="0" disabled selected>Data Sources</option>
                                                <option value="1" selected>Coauthors</option>
                                                <option value="2" selected>Cited By</option>
                                            </select>
                                        </div>
                                        <img src="/images/graph/undo.svg" class="graphIcon" onclick="undoAction()"/>
                                        <img src="/images/graph/fitcenter.svg" class="graphIcon" onclick="fitCamera(true)"/>
                                        <img src="/images/graph/fullscreen.svg" class="graphIcon" @click="_toggleFullScreen" id="fullScreenIcon"/>
                                        <img src="/images/graph/exit_fullscreen.svg" class="graphIcon" onclick="toggleFullScreen(event)" id="exitFullScreenIcon" style="display: none"/>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="graphFullWidthDialogx"></div>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import http from '../mixins/http';
    import employeeModal from '../mixins/show-employee-details-modal';

    export default {
        mixins: [http, employeeModal],

        data: function () {
            return {
                currentAddress: {}
            }
        },

        methods: {
            init: function (addressData) {
                this.currentAddress = addressData;

                this.loadContactsChainData();
            },

            loadContactsChainData: function () {
                this.httpGet('/api/address-details/'+this.currentAddress.id+'/load-contacts-chain-data')
                    .then(data => {
                        mainLabId = this.currentAddress.id;

                        start(data);

                        this._toggleFullScreen()
                    })
            },

            _toggleFullScreen: function ($event) {
                // $('#contacts-chain').modal('hide');
                toggleFullScreen($event);
            },

            _openNodeInfoExternalLink: function () {
                openNodeInfoExternalLink(this, this.currentAddress);
            }
        },

        mounted: function(){
            this.$eventGlobal.$on('showModalContactsChain', (addressData) => {
                // $('#contacts-chain').modal('show');
                this.init(addressData);
            });
        }
    }
</script>

<style scoped>

</style>