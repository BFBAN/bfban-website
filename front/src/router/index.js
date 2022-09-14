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
const Admin = () => import('@/views/admin/index.vue');
const Search = () => import('@/views/Search.vue');

Vue.use(VueRouter);

const isLoginBeforeEnter = function (to, from, next) {
    if (store.state.user) {
        next();
    } else {
        next({path: '/signin', query: { backurl: to.fullPath }});
    }
}

const isAdminBefore = (to, from, next) => {
    let checkAdmin = false;

    isLoginBeforeEnter(to, from, next);

    if (store.state.user)
      checkAdmin = store.state.user.userinfo.privilege.some(item => ['admin', 'super', 'dev'].includes(item))
        // for (const i of store.state.user.userinfo.privilege) {
        //     if (['admin', 'root', ''].includes(i)) checkAdmin = true;
        // }

    if (checkAdmin) {
        next();
    } else {
        next({path: '/profile/account'});
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
        metaInfo : {
            title: 'home.title',
            keywords: "home,bfban",
            description: 'home.description'
        }
    }, component: Home},

    // 关于
    {name: 'about', path: '/about',
        meta: {
            metaInfo : {
                title: 'about.title',
                keywords: "about",
                description: 'about.description'
            }
        },
        component: About
    },

    // 友链
    {name: 'link', path: '/link',
        meta: {
            metaInfo : {
                title: 'link.title',
                keywords: "link",
                description: 'link.description'
            }
        },
        component: Link
    },

    // 应用名单
    {name: 'apps', path: '/apps',
        meta: {
            metaInfo : {
                title: 'apps.title',
                keywords: "apps,bfban,app",
                description: 'apps.description'
            }
        },
        component: Apps
    },

    // 个人中心
    {name: 'profile_home', path: '/profile',
        meta: {
            metaInfo : {
                title: 'profile.title',
                keywords: "profile",
                description: 'profiledescription'
            }
        },
        component: Profile,
        beforeEnter: isLoginBeforeEnter
    },
    {name: 'profile', path: '/profile/:pagename',
        meta: {
            metaInfo : {
                title: 'profile.title',
                keywords: "profile",
                description: 'profile.description'
            }
        },
        component: Profile,
        beforeEnter: isLoginBeforeEnter
    },
    {
        name: 'admin',
        path: '/admin/:pagename',
        meta: {
            metaInfo : {
                title: 'profile.admin.title',
                keywords: "profile,admin",
                description: 'profile.admin.title'
            }
        },
        component: Admin,
        beforeEnter: isAdminBefore
    },


    // 搜索
    {name: 'search', path: '/search/:conetnt',
        meta: {
            metaInfo : {
                title: 'search.title',
                keywords: "search",
                description: 'search.description'
            }
        },
        component: Search
    },
    {name: 'search_main', path: '/search',
        meta: {
            metaInfo : {
                title: 'search.title',
                keywords: "search",
                description: 'search.description'
            }
        },
        component: Search
    },

    // 举报
    {
        name: 'report',
        path: '/report',
        meta: {
            metaInfo : {
                title: 'report.title',
                keywords: "report",
                description: 'report.description'
            }
        },
        component: Report,
        beforeEnter: isLoginBeforeEnter
    },

    // 作弊名单
    {name: 'player_list', path: '/player',
        meta: {
            metaInfo : {
                title: 'player_list.title',
                keywords: "player list",
                description: 'player_list.description'
            }
        },
        component: List
    },

    // 作弊者详情
    {name: 'player', path: '/player/:ouid',
        meta: {
            metaInfo : {
                title: 'detail.title',
                keywords: "detail, detail player",
                description: 'detail.description'
            }
        },
        component: Detail
    },

    // 作弊者分享面板
    {name: 'cheater_share', path: '/player/:ouid/share',
        meta: {
            metaInfo : {
                title: 'cheater_share.title',
                keywords: "cheater,share,card,player",
                description: 'cheater_share.description'
            }
        },
        component: DetailShare
    },

    // 唤起应用面板
    {name: 'cheater_app', path: '/player/:ouid/app',
        meta:{
            metaInfo : {
                title: 'cheater_app.title',
                keywords: "app ios android",
                description: 'cheater_app.description'
            }
        },
        component: DetailApp
    },

    // 作弊者卡片
    {name: 'cheater_share_card', path: '/player/:ouid/share/card',
        meta:{
            metaInfo : {
                title: 'cheater_share_card.title',
                keywords: "cheater,share,card",
                description: 'cheater_share_card.description'
            }
        },
        component: DetailCard
    },

    // 兼容旧url跳转
    {
        name: 'cheaters_old', path: '/cheaters/:ouid',
        meta: {
            metaInfo : {
                title: 'detail.title',
                keywords: "player detail",
                description: 'detail.description'
            }
        },
        component: Detail,
        beforeEnter(to, from, next) {
            next({
                path: `/player/${to.params.ouid}`, query: {oldUrl: true}
            });
        }
    },

    // 登录
    {name: 'signin', path: '/signin',
        meta: {
            metaInfo : {
                title: 'signin.title',
                keywords: "signin",
                description: 'signin.description'
            }
        },
        component: Signin
    },

    // 注册
    {name: 'signup', path: '/signup',
        meta: {
            metaInfo : {
                title: 'signup.title',
                keywords: "signup",
                description: 'signup.description'
            }
        },
        component: Signup
    },

    // 注册验证
    {name: 'registerVerification', path: '/registerVerification',
        meta: {
            metaInfo : {
                title: 'registerVerification.title',
                keywords: "register Verification",
                description: 'registerVerification.description'
            }
        },
        component: SignupComplete
    },

    // 旧账户换绑 需登录
    {
        name: 'bindOrigin',
        path: '/bindOrigin',
        meta: {
            metaInfo : {
                title: 'bindOrigin.title',
                keywords: "bind Origin",
                description: 'bindOrigin.description'
            }
        },
        component: Signup,
        beforeEnter: isLoginBeforeEnter
    },

    // 重置密码
    {name: 'forgetPassword', path: '/forgetPassword',
        meta:{
            metaInfo : {
                title: 'forgetPassword.title',
                keywords: "forget Password",
                description: 'forgetPassword.description'
            }
        },
        component: ForgetPassword
    },

    {name: 'forgetPasswordVerify', path: '/forgetPasswordVerify',
        meta: {
            metaInfo : {
                title: 'forgetPasswordVerify.title',
                keywords: "forget Password Verify",
                description: 'forgetPasswordVerify.description'
            }
        },
        component: ForgetPassword
    },

    // 账户验证
    {name: 'signupComplete', path: '/signupComplete/:code',
        meta:{
            metaInfo : {
                title: 'signupComplete.title',
                keywords: "signupComplete",
                description: 'signupComplete.description'
            }
        },
        component: SignupComplete
    },

    // 网站统计
    {name: 'site_stats', path: '/sitestats',
        meta: {
            metaInfo : {
                title: 'sitestats.title',
                keywords: "sitestats",
                description: 'sitestats.description'
            }
        },
        component: SiteStats
    },

    {name: 'account', path: '/account/:uId',
        meta: {
            metaInfo : {
                title: 'account.title',
                keywords: "account",
                description: 'account.description'
            }
        },
        component: Account
    },

    {name: 'notFound', path: '/404', meta: {
            metaInfo : {
                title: 'basic.tip.notFound',
                keywords: "notFound",
                description: 'basic.tip.notFound'
            }
        },
        component: NotFound
    },

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
        let metainfo = to.meta.metaInfo;
            metainfo.title = i18n.t(metainfo.title);
            metainfo.description = i18n.t(metainfo.description);
        store.commit("CHANGE_META_INFO", metainfo)
    }

    store.commit('syncLoginState');

    // document.title = `${config.name} | ${i18n.t(to.meta.value)}`;

    next();
});

export default router;
