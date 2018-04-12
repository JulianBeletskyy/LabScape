<template>
    <div>

        <section class="content-header">
            <h1>
                Dashboard
                <small>Control panel</small>
            </h1>
            <ol class="breadcrumb">
                <li><a href="#"><i class="fa fa-dashboard"></i> Home</a></li>
                <li class="active">Dashboard</li>
            </ol>
        </section>

        <!-- Main content -->
        <section class="content">
            <!-- Small boxes (Stat box) -->

            <!-- /.row -->
            <!-- Main row -->
            <div id="map-element"></div>

            <!-- /.row (main row) -->

        </section>

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