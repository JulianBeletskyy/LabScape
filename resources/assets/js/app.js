require('./bootstrap');
import router from './routes';
import VueRouter from 'vue-router';
import AuthService from './services/auth-service';
import {Pagination} from 'vue-pagination-2';

window.Vue = require('vue');

window.Vue.use(VueRouter);

AuthService.defineIsLoggedIn();
import vSelect from 'vue-select';

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
Vue.component('single-dropdown-select', require('./partial-view-components/single-dropdown-select'));
Vue.component('all-employee-list', require('./partial-view-components/all-employee-list'));
Vue.component('modal-employee-details', require('./partial-view-components/modal-employee-details'));
Vue.component('modal-contacts-chain', require('./partial-view-components/modal-contacts-chain'));
Vue.component('lab-chain-details', require('./partial-view-components/lab-chain-details'));
Vue.component('customer-status-select', require('./partial-view-components/customer-status-select'));
Vue.component('pagination', Pagination);
Vue.component('v-select', vSelect);

Vue.prototype.$eventGlobal = new Vue(); // Global event bus

const app = new Vue({
    el: '#app',
    router: router
});