import i18n from "../i18n";
import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';
import config from "../../package.json";

const Home = () => import('@/views/Home.vue');
const Report = () => import('@/views/Report.vue');
const List = () => import('@/views/List.vue');
const Detail = () => import('@/views/Detail.vue');
const DetailShare = () => import('@/views/DetailShare.vue');
const DetailApp = () => import('@/views/DetailApp.vue');
const DetailCard = () => import('@/components/SharePlayerCell.vue');
const Signin = () => import('@/views/Signin.vue');
const Signup = () => import('@/views/Signup.vue');
const ForgetPassword = () => import('@/views/forgetPassword.vue');
const SignupComplete = () => import('@/views/SignupComplete.vue');
const SiteStats = () => import('@/views/SiteStats.vue');
const Account = () => import('@/views/Account.vue');
const About = () => import('@/views/About.vue');
const Link = () => import('@/views/Link.vue');
const NotFound = () => import('@/views/NotFound.vue');
const Apps = () => import('@/views/Apps.vue');
const Profile = () => import('@/views/account/profile.vue');
const Search = () => import('@/views/Search.vue');

Vue.use(VueRouter);

const isLoginBeforeEnter = function (to, from, next) {
    if (store.state.user) {
        next();
    } else {
        next({path: '/signin', query: { backurl: to.fullPath }});
    }
}

const routes = [
    // exp:
    // {name: 'test', path: '/', meta: {
    //         value: 'test.title',
    //         metaInfo : {
    //             title: 'test',
    //             description: 'test description'
    //         }
    //     }, component: test},


    // 主页
    {name: 'home', path: '/', meta: {
        value: 'home.title',
    }, component: Home},

    // 关于
    {name: 'about', path: '/about', meta: {value: 'about.title'}, component: About},

    // 友链
    {name: 'link', path: '/link', meta: {value: 'link.title'}, component: Link},

    // 应用名单
    {name: 'apps', path: '/apps',meta: {value: 'apps.title'}, component: Apps},

    // 个人中心
    {name: 'profile_home', path: '/profile', meta: {value: 'profile.title'}, component: Profile, beforeEnter: isLoginBeforeEnter},
    {name: 'profile', path: '/profile/:pagename', meta: {value: 'profile.title'}, component: Profile, beforeEnter: isLoginBeforeEnter},

    // 搜索
    {name: 'search', path: '/search/:conetnt', meta: {value: 'search.title'}, component: Search},
    {name: 'search_main', path: '/search', meta: {value: 'search.title'}, component: Search},

    // 举报
    {
        name: 'report',
        path: '/report',
        meta: { value: 'report.title'},
        component: Report,
        beforeEnter: isLoginBeforeEnter
    },

    // 作弊名单
    {name: 'player_list', path: '/player', meta: {value: 'player_list.title'}, component: List},

    // 作弊者详情
    {name: 'player', path: '/player/:ouid', meta: {value: 'detail.title'}, component: Detail},

    // 作弊者分享面板
    {name: 'cheater_share', path: '/player/:ouid/share', meta: {value: 'cheater_share.title'}, component: DetailShare},

    // 唤起应用面板
    {name: 'cheater_app', path: '/player/:ouid/app', meta:{value: 'cheater_app.title'}, component: DetailApp},

    // 作弊者卡片
    {name: 'cheater_share_card', path: '/player/:ouid/share/card', meta:{value: 'cheater_share_card.title'}, component: DetailCard},

    // 兼容旧url跳转
    {
        name: 'cheaters_old', path: '/cheaters/:ouid' ,meta: {value: 'detail.title'}, component: Detail,
        beforeEnter(to, from, next) {
            next({
                path: `/player/${to.params.ouid}`, query: {oldUrl: true}
            });
        }
    },

    // 登录
    {name: 'signin', path: '/signin', meta: {value: 'signin.title'}, component: Signin},

    // 注册
    {name: 'signup', path: '/signup',meta: {value: 'signup.title'}, component: Signup},

    // 注册验证
    {name: 'registerVerification', path: '/registerVerification', meta: {value: 'registerVerification.title'}, component: SignupComplete},

    // 旧账户换绑 需登录
    {
        name: 'bindOrigin',
        path: '/bindOrigin',
        meta: { value: 'bindOrigin.title'},
        component: Signup,
        beforeEnter: isLoginBeforeEnter
    },

    // 重置密码
    {name: 'forgetPassword', path: '/forgetPassword', meta:{value: 'forgetPassword.title'}, component: ForgetPassword},
    {name: 'forgetPasswordVerify', path: '/forgetPasswordVerify', meta: {value: 'forgetPasswordVerify.title'}, component: ForgetPassword},

    // 账户验证
    {name: 'signupComplete', path: '/signupComplete/:code', meta:{value: 'signupComplete.title'}, component: SignupComplete},

    // 网站统计
    {name: 'site_stats', path: '/sitestats', meta: {value: 'sitestats.title'}, component: SiteStats},

    {name: 'account', path: '/account/:uId', meta: {value: 'account.title'}, component: Account},

    {name: 'notFound', path: '/404', meta: {value: 'basic.tip.notFound'}, component: NotFound},

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
    if (to.meta.metaInfo) {
        store.commit("CHANGE_META_INFO", to.meta.metaInfo)
    }

    store.commit('syncLoginState');

    document.title = `${config.name} | ${i18n.t(to.meta.value)}`;

    next();
});

export default router;
