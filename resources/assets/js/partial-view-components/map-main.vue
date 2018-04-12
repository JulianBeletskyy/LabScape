<template>
    <div>
        <div id="map-element"></div>
    </div>
</template>

<script>
    var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
    var token = document.head.querySelector('meta[name="mapbox-key"]').content;

    export default {

        mounted: function () {
            mapboxgl.accessToken = token;
            var map = new mapboxgl.Map({
                container: 'map-element',
                style: 'mapbox://styles/mapbox/streets-v10'
            });
        }

    }
</script>

<style scoped>

</style>