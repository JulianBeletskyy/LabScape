require('./bootstrap');
import router from './routes';
import VueRouter from 'vue-router';
import AuthService from './services/auth-service';
import {Pagination} from 'vue-pagination-2';

window.Vue = require('vue');

window.Vue.use(VueRouter);

AuthService.defineIsLoggedIn();

/* Components Registration */
Vue.component('main-component', require('./main-component'));
Vue.component('public-outlet', require('./public-components/public-outlet'));
Vue.component('private-outlet', require('./private-components/private-outlet'));
Vue.component('loader', require('./partial-view-components/loader'));
Vue.component('main-header', require('./private-components/layouts/main-header'));
Vue.component('main-sidebar', require('./private-components/layouts/main-sidebar'));
Vue.component('main-footer', require('./private-components/layouts/main-footer'));
Vue.component('map-main', require('./partial-view-components/map-main'));
Vue.component('multiple-dropdown-select', require('./partial-view-components/multiple-dropdown-select'));
Vue.component('all-employee-list', require('./partial-view-components/all-employee-list'));
Vue.component('modal-employee-details', require('./partial-view-components/modal-employee-details'));
Vue.component('pagination', Pagination);

Vue.prototype.$eventGlobal = new Vue(); // Global event bus

const app = new Vue({
    el: '#app',
    router: router
});