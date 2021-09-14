import i18n from "../i18n";
import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';
import config from "../../package.json";

const Home = () => import('@/views/Home.vue');
const Report = () => import('@/views/Report.vue');
//const Misc      =() => import('@/components/Edit.vue');
const List = () => import('@/views/List.vue');
const Detail = () => import('@/views/Detail.vue');
const Signin = () => import('@/views/Signin.vue');
const Signup = () => import('@/views/Signup.vue');
const ForgetPassword = () => import('@/views/forgetPassword.vue');
const SignupComplete = () => import('@/views/SignupComplete.vue');
const Account = () => import('@/views/Account.vue');
const About = () => import('@/views/About.vue');
const NotFound = () => import('@/views/NotFound.vue');
const Apps = () => import('@/views/Apps.vue');
const Profile = () => import('@/views/account/profile.vue');
const Search = () => import('@/views/Search.vue');

Vue.use(VueRouter);

const isLoginBeforeEnter = function (to, from, next) {
    if (store.state.user) {
        next();
    } else {
        next({path: '/signin', query: {rurl: to.fullPath}});
    }
}

const routes = [
    {name: 'home', path: '/', component: Home},
    {name: 'about', path: '/about', component: About},
    {name: 'apps', path: '/apps', component: Apps},
    {name: 'profile', path: '/profile', component: Profile, beforeEnter: isLoginBeforeEnter},
    {name: 'profile', path: '/profile/:pagename', component: Profile, beforeEnter: isLoginBeforeEnter},

    {name: 'search', path: '/search/:conetnt', component: Search},
    {name: 'search_main', path: '/search', component: Search},
    {
        name: 'report',
        path: '/report',
        component: Report,
        beforeEnter: isLoginBeforeEnter
    },
    //  { name: 'misc', path: '/misc', component: Misc },

    {name: 'cheaters', path: '/player', component: List},
    {name: 'cheater', path: '/player/:ouid', component: Detail},
    {
        name: 'cheaters_old', path: '/cheaters/:ouid', component: Detail,
        beforeEnter (to, from, next) {
            next({path: '/player/' + to.params.ouid, query: { oldUrl: true }});
        }
    },
    {
        name: 'shorten', path: '/preview.svg/:hexnum', redirect: to => {
            try {
                const ouid = parseInt(to.params.hexnum, 16);
                if (isNaN(ouid))
                    return '/404';
                return '/cheaters/' + ouid;
            } catch {
                return '/404';
            }
        }
    },

    {name: 'signin', path: '/signin', component: Signin},
    {name: 'signup', path: '/signup', component: Signup},
    {
        name: 'bindOrigin',
        path: '/bindOrigin',
        component: Signup,
        beforeEnter: isLoginBeforeEnter
    },
    {name: 'bindOriginVerify', path: '/bindOriginVerify', component: Signup},

    {name: 'forgetPassword', path: '/forgetPassword', component: ForgetPassword},
    {name: 'forgetPasswordVerify', path: '/forgetPasswordVerify/:code', component: ForgetPassword,},
    {name: 'bindOrigin', path: '/bindOrigin', component: Signup},
    {name: 'signupComplete', path: '/signupComplete/:code', component: SignupComplete},
    //  { name: 'signup', path: '/reset', component: Reset },

    {name: 'account', path: '/account/:uId', component: Account},
    //  { name: 'dashboard', path: '/dashboard', component: Dashboard },

    {name: 'notFound', path: '/404', component: NotFound, meta: {title: '🦖'}},

    // otherwise redirect to home
    {path: '*', redirect: '/404'},

];
const RouterConfig = {
    mode: 'history',
    routes,
    scrollBehavior(to, from, savedPosition) {
        return {x: 0, y: 0};
    },
};
const originalPush = VueRouter.prototype.push;
const router = new VueRouter(RouterConfig);

VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
}

router.beforeEach((to, from, next) => {
    store.commit('syncLoginState');

    document.title = `${config.name} | ${to.meta.title || i18n.t(`${to.name}.title`) || config.name} `;

    next();
});

export default router;
