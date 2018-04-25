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
                isGlobalSearchInitator: false,
                cluster: {},
                popup: new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                })
            }
        },

        methods: {

            loadAddresses: function (queryString, isGlobalSearchInitiator) {

                if ((this.isFirstLoad && this.$route.query['global-search']) || isGlobalSearchInitiator) {

                    let url = '/api/addresses?global-search=' + encodeURIComponent(this.$route.query['global-search']);

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
                            "tsunami": 0,
                            "name": adr.name,
                            "customer_status_color": adr.customer_status == 2 ? '#34cc8c' : '#ff894f',
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
                        "circle-color": '#51bbd6',
                        "circle-radius": [
                            "step",
                            ["get", "point_count"],
                            20,
                            100,
                            30,
                            750,
                            40
                        ],
                        "circle-stroke-width": 2,
                        "circle-stroke-color": "#fff"
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
                        "text-size": 14,
                    },
                    paint: {
                        "text-color": "#ffffff",
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
                        'circle-color': ['get', 'customer_status_color'],
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
                    style: 'mapbox://styles/mapbox/light-v9',
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

            listenToMouseMoves: function () {
                this.map.on('mousemove', (e) => {
                    let unclusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                        layers: ['unclustered-point']
                    });

                    let clusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    });

                    if(unclusteredFeatures.length || clusteredFeatures.length) {
                        this.map.getCanvas().style.cursor = 'pointer';
                    }
                    else {
                        this.map.getCanvas().style.cursor = '';
                    }

                    this.displayTooltip(unclusteredFeatures)
                });
            },

            displayTooltip: function(unclusteredFeatures) {
                if(unclusteredFeatures.length) {
                    this.popup.setLngLat(unclusteredFeatures[0].geometry.coordinates)
                        .setHTML('<h3 class="address-name-in-map-tooltip">'+unclusteredFeatures[0].properties.name+'</h3>')
                        .addTo(this.map)
                }
                else {
                    this.popup.remove();
                }
            },

            listenToMarkerClicks: function () {
                this.map.on('click', (e) => {

                    let unclusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                        layers: ['unclustered-point']
                    });

                    let clusteredFeatures = this.map.queryRenderedFeatures(e.point, {
                        layers: ['clusters']
                    });

                    if(unclusteredFeatures.length){
                        let id = unclusteredFeatures[0].properties.id;
                        this.$router.push('/address-details/'+id);
                    }
                    else if(clusteredFeatures.length){

                        let clusterId = clusteredFeatures[0].properties.cluster_id;

                        var allFeatures = this.cluster.getLeaves(clusterId, Math.floor(this.map.getZoom()), Infinity);

                        let ids = [];

                        for(var i=0; i<allFeatures.length; ++i){
                            ids.push(allFeatures[i].properties.id);
                        }

                        if(ids.length){
                            this.$router.push('/dashboard?address-ids='+ids.toString());
                        }
                    }
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
            },

            updateMapLayers: function (data) {
                ['clusters','cluster-count','unclustered-point'].forEach(el => {
                    if(this.map.getLayer(el)) this.map.removeLayer(el);
                });

                this.map.removeSource('earthquakes');

                this.initDataSource(data);

                this.cluster.load(this.FeatureCollection.features);
            },

            initSuperCluster: function () {
                var clusterRadius = 50;
                var clusterMaxZoom = 14;

                this.cluster = supercluster({
                    radius: clusterRadius,
                    maxZoom: clusterMaxZoom
                });
            }
        },

        mounted: function () {

            setTimeout(()=>{
                $('#map-element').height(window.innerHeight - 70 - 51);
                this.initMap();

                this.initSuperCluster();

                this.map.on('load', () => {

                    let queryUrl = '';

                    if(this.$route.path == '/dashboard') {
                        queryUrl = this.$route.fullPath.replace('/dashboard', '');
                    }

                    this.loadAddresses(queryUrl)
                        .then(data => {

                            this.initDataSource(data);

                            this.cluster.load(this.FeatureCollection.features);

                            this.listenToMouseMoves();

                            this.listenToMarkerClicks();

                        });
                });

                this.$eventGlobal.$on('filtersHaveBeenApplied', (queryStr) => {

                    this.loadAddresses(queryStr)
                        .then((data) => {
                            this.updateMapLayers(data);
                        })
                });

                this.$eventGlobal.$on('showSpecificItem', (data)=>{
                    this.updateMapLayers(data);
                });

            },1000);
        }

    }
</script>

<style scoped>

</style>