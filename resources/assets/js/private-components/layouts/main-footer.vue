<template>
    <footer class="main-footer">
        <div class="pull-right hidden-xs">
            <b>Version</b> 2.4.0
        </div>
        <strong>Copyright &copy; {{currentYear}} PeakData GmbH.</strong> All rights reserved.
    </footer>
</template>

<script>
    export default {
        computed: {
            currentYear: function () {
                return moment().format('YYYY');
            }
        }
    }
</script>

<style scoped>

</style>