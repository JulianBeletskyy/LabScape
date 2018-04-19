<template>
    <div>
        <div id="map-element"></div>
    </div>
</template>

<script>
    var mapboxgl = require('mapbox-gl');
    var geojsonExtent = require('@mapbox/geojson-extent');

    import http from '../mixins/http';

    export default {

        mixins: [http],

        data: function () {
            return {
                map: null,
                FeatureCollection: {},
                isFirstLoad: true,
                isGlobalSearchInitator: false
            }
        },

        methods: {

            loadAddresses: function (queryString, isGlobalSearchInitiator) {

                if ((this.isFirstLoad && this.$route.query['global-search']) || isGlobalSearchInitiator) {

                    let url = '/api/addresses?global_search=' + encodeURIComponent(this.$route.query['global-search']);

                    this.isFirstLoad = false;

                    return this.httpGet(url);
                }

                return this.httpGet('/api/addresses' + (queryString || ''));
            },

            composeMapData: function (data) {

                var mapData = [];

                for(var i = 0; i < data.length; i++){

                    var adr = data[i];

                    mapData[i] = {
                        "type": "Feature",
                        "properties": {
                            "id": adr.id,
                            "mag": 2.3,
                            "time": 1507425650893,
                            "felt": null,
                            "tsunami": 0
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [ adr.lon, adr.lat, 0.0 ]
                        }
                    };
                }

                return mapData;
            },

            provideDataToMap: function (data) {

                let mapData = this.composeMapData(data);

                this.FeatureCollection = {
                    "type": "FeatureCollection",
                    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                    "features": mapData
                };

                this.map.addSource("earthquakes", {
                    type: "geojson",
                    data: this.FeatureCollection,
                    cluster: true,
                    clusterMaxZoom: 14, // Max zoom to cluster points on
                    clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                });
            },

            addClustersLayer: function () {
                this.map.addLayer({
                    id: "clusters",
                    type: "circle",
                    source: "earthquakes",
                    filter: ["has", "point_count"],
                    paint: {
                        // Use step expressions (https://www.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                        // with three steps to implement three types of circles:
                        //   * Blue, 20px circles when point count is less than 100
                        //   * Yellow, 30px circles when point count is between 100 and 750
                        //   * Pink, 40px circles when point count is greater than or equal to 750
                        "circle-color": [
                            "step",
                            ["get", "point_count"],
                            "#51bbd6",
                            100,
                            "#f1f075",
                            750,
                            "#f28cb1"
                        ],
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            100,
                            30,
                            750,
                            40
                        ]
                    }
                });
            },

            addClustersCountLayer: function () {
                this.map.addLayer({
                    id: "cluster-count",
                    type: "symbol",
                    source: "earthquakes",
                    filter: ["has", "point_count"],
                    layout: {
                        "text-field": "{point_count_abbreviated}",
                        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                        "text-size": 12
                    }
                });
            },

            addUnclusteredPointLayer: function () {
                this.map.addLayer({
                    id: "unclustered-point",
                    type: "circle",
                    source: "earthquakes",
                    filter: ["!has", "point_count"],
                    paint: {
                        "circle-color": "#00da4d",
                        "circle-radius": 7,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff"
                    }
                });
            },

            fitMapBounds: function () {
                this.map.fitBounds(geojsonExtent(this.FeatureCollection), {maxZoom: 12, padding: 50});
            },

            initMap: function () {
                mapboxgl.accessToken = document.head.querySelector('meta[name="mapbox-key"]').content;

                this.map = new mapboxgl.Map({
                    container: 'map-element',
                    style: 'mapbox://styles/mapbox/streets-v10',
                    center: [8.553399, 46.901604],
                    zoom: 7
                });
            },

            countDisplayedMarkers: function () {

                var timeoutId;

                this.map.on('move', (e) => {

                    if (timeoutId) {
                        clearTimeout(timeoutId)
                    }

                    timeoutId = setTimeout(()=>{

                        let totalPointsDisplayed = 0;

                        let uniqueSingleFeatureIds = [];
                        let uniqueClusterIds = [];

                        let unclusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                            layers: ['unclustered-point']
                        });

                        for(let i=0; i < unclusteredFeatures.length; i++) {
                            if(uniqueSingleFeatureIds.indexOf(unclusteredFeatures[i].properties.id) === -1) {
                                totalPointsDisplayed++;
                                uniqueSingleFeatureIds.push(unclusteredFeatures[i].properties.id);
                            }
                        }

                        let clusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                            layers: ['clusters']
                        });

                        for(let i=0; i < clusteredFeatures.length; i++) {
                            if(uniqueClusterIds.indexOf(clusteredFeatures[i].properties.cluster_id) === -1) {
                                totalPointsDisplayed += clusteredFeatures[i].properties.point_count;
                                uniqueClusterIds.push(clusteredFeatures[i].properties.cluster_id);
                            }
                        }
                        
                        this.notifyTotalPointsDisplayedOnMapChanged(totalPointsDisplayed)

                    },500)

                });
            },

            notifyTotalPointsDisplayedOnMapChanged: function (totalPoints) {
                this.$eventGlobal.$emit('totalPointsDisplayedOnMapChanged', totalPoints);
            },

            initDataSource: function (addressList) {

                this.provideDataToMap(addressList);

                this.addClustersLayer();

                this.addClustersCountLayer();

                this.addUnclusteredPointLayer();

                if (addressList.length) {
                    this.fitMapBounds();

                    this.countDisplayedMarkers();
                }
                else {
                    alertify.notify('No addresses have been found', 'warning', 3);
                    this.notifyTotalPointsDisplayedOnMapChanged(0)
                }
            }
        },

        mounted: function () {

            setTimeout(()=>{
                $('#map-element').height($('.content-wrapper').height());
                this.initMap();

                this.map.on('load', () => {
                    this.loadAddresses()
                        .then(data => {

                            this.initDataSource(data);

                        });
                });

                this.$eventGlobal.$on('filtersHaveBeenApplied', (queryStr) => {

                    this.loadAddresses(queryStr)
                        .then((data) => {

                            ['clusters','cluster-count','unclustered-point'].forEach(el => {
                                if(this.map.getLayer(el)) this.map.removeLayer(el);
                            });

                            this.map.removeSource('earthquakes');

                            this.initDataSource(data);
                        })

                });

                this.$eventGlobal.$on('notifyMapMainGlobalSearchPerformed', ()=>{
                    this.loadAddresses('', true)
                        .then((data) => {

                            ['clusters','cluster-count','unclustered-point'].forEach(el => {
                                if(this.map.getLayer(el)) this.map.removeLayer(el);
                            });

                            this.map.removeSource('earthquakes');

                            this.initDataSource(data);
                        })
                });

            },1000);
        }

    }
</script>

<style scoped>

</style>