let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
    .styles([
        'bower_components/bootstrap/dist/css/bootstrap.min.css',
        'bower_components/font-awesome/css/font-awesome.min.css',
        'bower_components/Ionicons/css/ionicons.min.css',
        'bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css',
        'bower_components/bootstrap-daterangepicker/daterangepicker.css',
        'resources/assets/css/font-awesome.min.css',
        'resources/assets/css/AdminLTE.min.css',
        'resources/assets/css/_all-skins.css',
        'resources/assets/css/styles.css',
        'resources/assets/css/responsive.css',
    ],
        'public/css/app.css')

    .scripts([
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/jquery-ui/jquery-ui.min.js',
            'bower_components/jquery-sparkline/dist/jquery.sparkline.min.js',
            'bower_components/jquery-knob/dist/jquery.knob.min.js',
            'bower_components/moment/min/moment.min.js',
            'bower_components/bootstrap-daterangepicker/daterangepicker.js',
            'bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
            'bower_components/jquery-slimscroll/jquery.slimscroll.min.js',
            'bower_components/fastclick/lib/fastclick.js',
            // 'node_modules/admin-lte/dist/js/adminlte.min',
            // 'node_modules/admin-lte/dist/js/pages/dashboard.js',
            // 'node_modules/admin-lte/dist/js/demo.js',
        ],
        'public/js/vendor.js')

    .js('resources/assets/js/app.js', 'public/js')

    .copyDirectory('resources/assets/fonts', 'public/fonts')
    .copyDirectory('resources/assets/images', 'public/images');
