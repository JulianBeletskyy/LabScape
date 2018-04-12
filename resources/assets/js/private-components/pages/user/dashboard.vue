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

    export default {

        mounted: function () {
            mapboxgl.accessToken = 'pk.eyJ1Ijoic2VyZ2V6YWsiLCJhIjoiY2pmdXNmcnpkMG01YzJxbXdteDhkcHpjcCJ9.4kSySXM2rYx9VUMkxouIpg';
            var map = new mapboxgl.Map({
                container: 'map-element',
                style: 'mapbox://styles/mapbox/streets-v10'
            });
        }

    }
</script>

<style scoped>

</style>