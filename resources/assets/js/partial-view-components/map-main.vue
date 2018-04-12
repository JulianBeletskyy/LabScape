<template>
    <div>
        <div id="map-element"></div>
    </div>
</template>

<script>
    var mapboxgl = require('mapbox-gl');

    export default {

        data: function () {
            return {
                map: null
            }
        },

        methods: {
            initMap: function () {
                mapboxgl.accessToken = document.head.querySelector('meta[name="mapbox-key"]').content;

                var map = new mapboxgl.Map({
                    container: 'map-element',
                    style: 'mapbox://styles/mapbox/streets-v10',
                    center: [-103.59179687498357, 40.66995747013945],
                    zoom: 3
                });

                map.on('load', function() {
                    // Add a new source from our GeoJSON data and set the
                    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
                    map.addSource("earthquakes", {
                        type: "geojson",
                        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
                        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
                        // data: "/mapbox-gl-js/assets/earthquakes.js",
                        data: {
                            "type": "FeatureCollection",
                            "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                            "features": [
                                { "type": "Feature", "properties": { "id": "ak16994521", "mag": 2.3, "time": 1507425650893, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5129, 63.1016, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994519", "mag": 1.7, "time": 1507425289659, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -150.4048, 63.1224, 105.5 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994517", "mag": 1.6, "time": 1507424832518, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.3597, 63.0781, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021336", "mag": 1.42, "time": 1507423898710, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -118.497, 34.299667, 7.64 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2nn", "mag": 4.2, "time": 1507422626990, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -87.6901, 12.0623, 46.41 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994510", "mag": 1.6, "time": 1507422449194, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5053, 63.0719, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2nb", "mag": 4.6, "time": 1507420784440, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -178.4576, -20.2873, 614.26 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994298", "mag": 2.4, "time": 1507419370097, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -148.789, 63.1725, 7.5 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905861", "mag": 1.39, "time": 1507418785100, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -120.993164, 36.421833, 6.37 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021304", "mag": 1.11, "time": 1507418426010, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -117.0155, 33.656333, 12.37 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994293", "mag": 1.5, "time": 1507417256497, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.512, 63.0879, 10.8 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994287", "mag": 2.0, "time": 1507413903714, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.4378, 63.0933, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994285", "mag": 1.5, "time": 1507413670029, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -149.6538, 63.2272, 96.8 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994283", "mag": 1.4, "time": 1507413587442, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5325, 63.0844, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994280", "mag": 1.3, "time": 1507413266231, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -149.4752, 61.8518, 54.3 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994278", "mag": 1.8, "time": 1507413195076, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -150.8597, 61.6214, 50.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994274", "mag": 1.9, "time": 1507412827617, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -149.7142, 62.9656, 93.6 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994273", "mag": 1.2, "time": 1507411925999, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.2484, 61.2705, 69.1 ] } },
                                { "type": "Feature", "properties": { "id": "ak16994270", "mag": 2.0, "time": 1507411814209, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -152.0732, 65.5942, 14.8 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2ly", "mag": 4.1, "time": 1507411448780, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -90.5445, 13.5146, 54.36 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905841", "mag": 1.38, "time": 1507411214450, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -118.819504, 37.605499, 4.14 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905836", "mag": 1.4, "time": 1507410206440, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -118.930168, 37.636833, -0.71 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021272", "mag": 1.34, "time": 1507408122250, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -117.509167, 34.1555, 16.34 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021264", "mag": 1.0, "time": 1507407938100, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -116.792167, 33.5115, 5.16 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993963", "mag": 1.4, "time": 1507407100665, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -150.9126, 63.1812, 150.4 ] } },
                                { "type": "Feature", "properties": { "id": "hv61936851", "mag": 2.55, "time": 1507406278360, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -155.078659, 19.374167, 2.15 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993960", "mag": 1.4, "time": 1507405129739, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -147.3106, 61.5726, 26.9 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993952", "mag": 1.7, "time": 1507403679922, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -150.5846, 60.2607, 34.2 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021224", "mag": 1.04, "time": 1507401391710, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -116.929, 34.254833, 18.27 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993752", "mag": 1.3, "time": 1507401212982, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5065, 63.0847, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993746", "mag": 1.3, "time": 1507399350671, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -147.8929, 63.5257, 3.3 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2jk", "mag": 4.6, "time": 1507398878400, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -175.7258, -18.9821, 195.22 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993741", "mag": 1.6, "time": 1507398797233, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.3473, 63.0775, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905766", "mag": 2.64, "time": 1507397278960, "felt": 4, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -121.137497, 36.579834, 7.72 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993738", "mag": 1.4, "time": 1507396778206, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.1075, 61.8312, 71.7 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993736", "mag": 1.2, "time": 1507396542471, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.3769, 63.0621, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2ii", "mag": 4.3, "time": 1507395765330, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -94.8319, 16.7195, 58.84 ] } },
                                { "type": "Feature", "properties": { "id": "uw61339006", "mag": 1.91, "time": 1507395622730, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -120.689833, 47.049167, 5.38 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993732", "mag": 1.7, "time": 1507395602456, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5283, 63.0785, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993720", "mag": 2.5, "time": 1507394741482, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.6683, 60.7696, 67.1 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993714", "mag": 1.6, "time": 1507394402896, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -149.7591, 61.6478, 30.6 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993710", "mag": 1.5, "time": 1507393418705, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.3458, 63.0633, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993699", "mag": 1.6, "time": 1507392875390, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.4669, 63.0675, 3.4 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993695", "mag": 1.3, "time": 1507392837463, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.5169, 63.083, 1.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993692", "mag": 2.3, "time": 1507392657193, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.4771, 63.0742, 4.3 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993486", "mag": 4.2, "time": 1507392435159, "felt": 2, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.458, 63.1276, 14.9 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2hz", "mag": 4.3, "time": 1507392287310, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -94.9686, 16.6087, 69.65 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905751", "mag": 1.21, "time": 1507391530870, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -119.023666, 37.605335, 1.97 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021056", "mag": 1.95, "time": 1507390783500, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -116.793833, 33.493, 3.65 ] } },
                                { "type": "Feature", "properties": { "id": "ci38021048", "mag": 1.02, "time": 1507388708760, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -117.225, 34.0335, 0.39 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993303", "mag": 1.9, "time": 1507385638408, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -151.0033, 63.2623, 0.9 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2hc", "mag": 4.9, "time": 1507385606770, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -177.3179, -30.4302, 10.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993301", "mag": 2.1, "time": 1507383291943, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -154.1913, 58.5727, 85.2 ] } },
                                { "type": "Feature", "properties": { "id": "uu60251607", "mag": 3.09, "time": 1507383200950, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -113.140503, 38.030666, 7.29 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905716", "mag": 1.07, "time": 1507382878240, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -122.765663, 38.789166, 2.09 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905711", "mag": 1.17, "time": 1507382428800, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -121.678001, 37.621498, 4.39 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993140", "mag": 1.9, "time": 1507381096302, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -148.8813, 63.1738, 75.2 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993128", "mag": 1.6, "time": 1507378828395, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -149.531, 61.7978, 14.8 ] } },
                                { "type": "Feature", "properties": { "id": "hv61936621", "mag": 1.98, "time": 1507378497820, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -155.423492, 19.223499, 34.62 ] } },
                                { "type": "Feature", "properties": { "id": "ak16993119", "mag": 1.5, "time": 1507378014192, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -138.8317, 59.7754, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905681", "mag": 1.39, "time": 1507377675100, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -122.793999, 38.8255, 2.24 ] } },
                                { "type": "Feature", "properties": { "id": "hv61936531", "mag": 2.66, "time": 1507377140600, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -155.32016, 19.338667, 4.3 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992960", "mag": 1.9, "time": 1507376759252, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -158.4264, 67.7636, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992953", "mag": 2.1, "time": 1507376626801, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -136.5725, 59.8372, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2fz", "mag": 4.1, "time": 1507372645200, "felt": 103, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -71.7814, -32.4981, 23.29 ] } },
                                { "type": "Feature", "properties": { "id": "nn00608370", "mag": 1.3, "time": 1507370926907, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -115.9711, 36.3094, 7.8 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992628", "mag": 1.5, "time": 1507369548317, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -163.8046, 65.9499, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992625", "mag": 1.4, "time": 1507369466929, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -147.8309, 63.376, 82.0 ] } },
                                { "type": "Feature", "properties": { "id": "nc72905641", "mag": 1.22, "time": 1507368529650, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -122.724167, 38.760334, 1.16 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2fc", "mag": 5.1, "time": 1507368374110, "felt": 13, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -77.9778, -1.6647, 147.34 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992611", "mag": 2.1, "time": 1507366872675, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -150.3324, 62.9966, 88.4 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992607", "mag": 1.8, "time": 1507366536698, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -146.4858, 64.7593, 11.3 ] } },
                                { "type": "Feature", "properties": { "id": "us2000b2et", "mag": 4.9, "time": 1507365487800, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -177.7469, -33.0092, 10.0 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992603", "mag": 2.2, "time": 1507364931625, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -136.8133, 59.8473, 0.0 ] } },
                                { "type": "Feature", "properties": { "id": "ci38020960", "mag": 1.0, "time": 1507363084310, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -116.673833, 33.904333, 35.76 ] } },
                                { "type": "Feature", "properties": { "id": "hv61936261", "mag": 1.72, "time": 1507362853030, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -155.382172, 19.23, 34.41 ] } },
                                { "type": "Feature", "properties": { "id": "ak16992451", "mag": 1.8, "time": 1507362228460, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -153.427, 66.3947, 5.8 ] } },
                                { "type": "Feature", "properties": { "id": "ci38020944", "mag": 1.0, "time": 1507362158010, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -116.457667, 34.326, 2.73 ] } },
                                { "type": "Feature", "properties": { "id": "mb80259564", "mag": 1.03, "time": 1507361004730, "felt": null, "tsunami": 0 }, "geometry": { "type": "Point", "coordinates": [ -112.529833, 46.865833, 9.91 ] } },]
                        },
                        cluster: true,
                        clusterMaxZoom: 14, // Max zoom to cluster points on
                        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
                    });

                    map.addLayer({
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

                    map.addLayer({
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

                    map.addLayer({
                        id: "unclustered-point",
                        type: "circle",
                        source: "earthquakes",
                        filter: ["!has", "point_count"],
                        paint: {
                            "circle-color": "#11b4da",
                            "circle-radius": 4,
                            "circle-stroke-width": 1,
                            "circle-stroke-color": "#fff"
                        }
                    });
                });
            }


        },

        mounted: function () {
            this.initMap();
        }

    }
</script>

<style scoped>

</style>