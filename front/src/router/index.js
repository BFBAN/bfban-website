// import VueRouter from 'vue-router';

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

import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
    {
        name: 'home',
        path: '/',
        component: Home,
    },
    {name: 'about', path: '/about', component: About},
    {name: 'apps', path: '/apps', component: Apps},
    {name: 'profile', path: '/profile', component: Profile},
    {name: 'search', path: '/search/:conetnt', component: Search},
    {name: 'search_main', path: '/search', component: Search},
    // {name: 'message', path: '/profile/message', component: Profile},
    {
        name: 'report',
        path: '/report',
        component: Report,
        beforeEnter(to, from, next) {
            if (store.state.user) {
                next();
            } else {
                next({path: '/signin', query: {rurl: to.fullPath}}); // 未登录则跳转到登陆界面，query:{ Rurl: to.fullPath}表示把当前路由信息传递过去方便登录后跳转回来
            }
        },
    },
    //  { name: 'misc', path: '/misc', component: Misc },

    {name: 'cheaters', path: '/cheaters', component: List},
    {name: 'cheater', path: '/cheaters/:ouid', component: Detail},
    {
        name: 'shorten', path: '/s/:hexnum', redirect: to => {
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
    {name: 'forgetPassword', path: '/forgetPassword', component: ForgetPassword},
    {name: 'forgetPasswordVerify', path: '/forgetPasswordVerify/:code', component: ForgetPassword,},
    {name: 'bindOrigin', path: '/bindOrigin', component: Signup},
    {name: 'signupComplete', path: '/signupComplete/:code', component: SignupComplete},
    //  { name: 'signup', path: '/reset', component: Reset },

    {name: 'account', path: '/account/:uId', component: Account},
    //  { name: 'dashboard', path: '/dashboard', component: Dashboard },

    {name: 'notFound', path: '/404', component: NotFound},

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
const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    store.commit('syncLoginState');

    next();
});

export default router;
