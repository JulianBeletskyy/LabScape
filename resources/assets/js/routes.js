import VueRouter from 'vue-router';
import AuthService from './services/auth-service';



let publicRoutes = [
    {
        path: '/',
        redirect: to => {
            if (AuthService.isLoggedIn) {
                return '/dashboard';
            }
            else {
                return '/login';
            }
        }
    },
    {
        path: '/login',
        component: require('./public-components/pages/login')
    },
    {
        path: '/forgot-password',
        component: require('./public-components/pages/forgot-password')
    },
    {
        path: '/password/reset/:token',
        component: require('./public-components/pages/reset-password')
    },
];

let privateRoutes = [
    {
        path: '/dashboard',
        component: require('./private-components/pages/user/dashboard'),
        meta: { requiresAuth: true },
        name: 'Dashboard'
    },
    {
        path: '/user/profile',
        component: require('./private-components/pages/user/profile'),
        meta: { requiresAuth: true },
        name: 'Profile'
    },

];

const router = new VueRouter({
    routes: publicRoutes.concat(privateRoutes),
    mode: 'history',
    linkActiveClass: 'active'
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth) && !AuthService.isLoggedIn) {
        next({ path: '/login'});
    }
    else if (to.path == '/login' && AuthService.isLoggedIn){
        next({ path: '/dashboard'});
    }
    else {
        next();
    }
});


export default router;
