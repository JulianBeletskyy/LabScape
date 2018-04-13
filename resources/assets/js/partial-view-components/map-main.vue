<template>
    <div>
        <div id="map-element"></div>
    </div>
</template>

<script>
    var mapboxgl = require('mapbox-gl');

    import http from '../mixins/http';

    export default {

        mixins: [http],

        data: function () {
            return {
                map: null
            }
        },

        methods: {

            loadAddresses: function () {
                return this.httpGet('/api/addresses');
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

                this.map.addSource("earthquakes", {
                    type: "geojson",
                    data: {
                        "type": "FeatureCollection",
                        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                        "features": mapData
                    },
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
                        "circle-color": "#11b4da",
                        "circle-radius": 7,
                        "circle-stroke-width": 1,
                        "circle-stroke-color": "#fff"
                    }
                });
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

            initDataSource: function (addressList) {

                this.provideDataToMap(addressList);

                this.addClustersLayer();

                this.addClustersCountLayer();

                this.addUnclusteredPointLayer();
            }
        },

        mounted: function () {

            this.loadAddresses()
                .then(data => {
                    this.map.on('load', () => {

                        this.initDataSource(data);

                        console.log('this.map', this.map)

                    });
                });

            this.initMap();

            this.$eventGlobal.$on('addressListUpdated', (newAddressList) => {

                ['clusters','cluster-count','unclustered-point'].forEach(el => {
                    if(this.map.getLayer(el)) this.map.removeLayer(el);
                });

                this.map.removeSource('earthquakes');

                this.initDataSource(newAddressList);

            })
        }

    }
</script>

<style scoped>

</style>