import i18n from "../i18n";
import store from '@/store';
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta'
import {CHANGE_META_INFO} from '../store/mutation-types'

const Home = () => import('@/views/Home.vue');
const Report = () => import('@/views/Report.vue');
const Players = () => import('@/views/Players.vue');
const Detail = () => import('@/views/Detail.vue');
const DetailShare = () => import('@/views/DetailShare.vue');
const DetailAppeal = () => import('@/views/DetailAppeal.vue');
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
import bindOrigin from "@/views/bindOrigin";

Vue.use(VueRouter);
Vue.use(VueMeta, {
    keyName: 'metaInfo',
    attribute: 'data-vue-meta',
});

const isLoginBeforeEnter = function (to, from, next) {
    if (store.state.user) {
        next();
    } else {
        next({path: '/signin', query: {backurl: to.fullPath}});
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
        next({path: '/profile/information'});
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
    {
        name: 'home', path: '/', meta: {
            value: 'home.title',
            metaInfo: {
                title: 'home.title',
                keywords: "home.seo.keywords",
                description: 'home.seo.description'
            }
        },
        component: Home,
    },

    // 关于
    {
        name: 'about', path: '/about',
        meta: {
            metaInfo: {
                title: 'about.title',
                keywords: "about.seo.keywords",
                description: 'about.description'
            }
        },
        component: About
    },

    // 友链
    {
        name: 'link', path: '/link',
        meta: {
            metaInfo: {
                title: 'link.title',
                keywords: "link.seo.keywords",
                description: 'link.description'
            }
        },
        component: Link
    },

    // 应用名单
    {
        name: 'apps', path: '/apps',
        meta: {
            metaInfo: {
                title: 'apps.title',
                keywords: "apps.seo.keywords",
                description: 'apps.description'
            }
        },
        component: Apps
    },

    // 个人中心
    {
        name: 'profile_home', path: '/profile',
        meta: {
            metaInfo: {
                title: 'profile.title',
                keywords: "profile.seo.keywords",
                description: 'profile.description'
            }
        },
        component: Profile,
        beforeEnter: isLoginBeforeEnter
    },
    {
        name: 'profile', path: '/profile/:pagename',
        meta: {
            metaInfo: {
                title: 'profile.title',
                keywords: "profile.seo.keywords",
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
            metaInfo: {
                title: 'profile.admin.title',
                keywords: "profile.seo.keywords",
                description: 'profile.admin.title'
            }
        },
        component: Admin,
        beforeEnter: isAdminBefore
    },


    // 搜索
    {
        name: 'search', path: '/search/:conetnt',
        meta: {
            metaInfo: {
                title: 'search.title',
                keywords: "search.seo.keywords",
                description: 'search.description'
            }
        },
        component: Search
    },
    {
        name: 'search_main', path: '/search',
        meta: {
            metaInfo: {
                title: 'search.title',
                keywords: "search.seo.keywords",
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
            metaInfo: {
                title: 'report.title',
                keywords: "report.seo.keywords",
                description: 'report.description'
            }
        },
        component: Report,
        beforeEnter: isLoginBeforeEnter
    },

    // 作弊名单
    {
        name: 'player_list', path: '/player',
        meta: {
            metaInfo: {
                title: 'player_list.title',
                keywords: "player.seo.keywords",
                description: 'player_list.description'
            }
        },
        component: Players
    },

    // 作弊者详情
    {
        name: 'player', path: '/player/:ouid',
        meta: {
            metaInfo: {
                title: 'detail.title',
                keywords: "detail.seo.keywords",
                description: 'detail.description'
            }
        },
        component: Detail
    },

    // 作弊者分享面板
    {
        name: 'cheater_share', path: '/player/:ouid/share',
        meta: {
            metaInfo: {
                title: 'share.title',
                keywords: "share.seo.keywords",
                description: 'share.title'
            }
        },
        component: DetailShare
    },

    // 申诉
    {name: 'cheater_appeal', path: '/player/:ouid/appeal',
        meta: {
            metaInfo : {
                title: 'detail.info.app_qr.title',
                keywords: "detail.seo.keywords",
                description: 'detail.info.app_qr.title'
            }
        },
        component: DetailAppeal
    },

    // 唤起应用面板
    {
        name: 'cheater_app', path: '/player/:ouid/app',
        meta: {
            metaInfo: {
                title: 'detail.info.app_qr.title',
                keywords: "detail.seo.keywords",
                description: 'detail.info.app_qr.title'
            }
        },
        component: DetailApp
    },

    // 作弊者卡片
    {
        name: 'cheater_share_card', path: '/player/:ouid/share/card',
        meta: {
            metaInfo: {
                title: 'detail.info.app_qr.title',
                keywords: "detail.seo.keywords",
                description: 'detail.info.app_qr.title'
            }
        },
        component: DetailCard
    },

    // 兼容旧url跳转
    {
        name: 'cheaters_old', path: '/cheaters/:ouid',
        meta: {
            metaInfo: {
                title: 'detail.title',
                keywords: "detail.seo.keywords",
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
    {
        name: 'signin', path: '/signin',
        meta: {
            metaInfo: {
                title: 'signin.title',
                keywords: "signin.seo.keywords",
                description: 'signin.description'
            }
        },
        component: Signin
    },

    // 注册
    {
        name: 'signup', path: '/signup',
        meta: {
            metaInfo: {
                title: 'signup.title',
                keywords: "signup.seo.keywords",
                description: 'signup.description'
            }
        },
        component: Signup
    },

    // 注册验证
    {
        name: 'registerVerification', path: '/registerVerification',
        meta: {
            metaInfo: {
                title: 'registerVerification.title',
                keywords: "registerVerification.seo.keywords",
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
            metaInfo: {
                title: 'bindOrigin.title',
                keywords: "bindOrigin.seo.keywords",
                description: 'bindOrigin.description'
            }
        },
        component: bindOrigin,
        beforeEnter: isLoginBeforeEnter
    },

    // 重置密码
    {
        name: 'forgetPassword', path: '/forgetPassword',
        meta: {
            metaInfo: {
                title: 'forgetPassword.title',
                keywords: "forgetPassword.seo.keywords",
                description: 'forgetPassword.description'
            }
        },
        component: ForgetPassword
    },

    {
        name: 'forgetPasswordVerify', path: '/forgetPasswordVerify',
        meta: {
            metaInfo: {
                title: 'forgetPasswordVerify.title',
                keywords: "forgetPasswordVerify.seo.keywords",
                description: 'forgetPasswordVerify.description'
            }
        },
        component: ForgetPassword
    },

    // 账户验证
    {
        name: 'signupComplete', path: '/signupComplete',
        meta: {
            metaInfo: {
                title: 'signupComplete.title',
                keywords: "signupComplete.seo.keywords",
                description: 'signupComplete.description'
            }
        },
        component: SignupComplete
    },

    // 网站统计
    {
        name: 'site_stats', path: '/sitestats',
        meta: {
            metaInfo: {
                title: 'sitestats.title',
                keywords: "sitestats.seo.keywords",
                description: 'sitestats.description'
            }
        },
        component: SiteStats
    },

    {
        name: 'account', path: '/account/:uId',
        meta: {
            metaInfo: {
                title: 'account.title',
                keywords: "account.seo.keywords",
                description: 'account.description'
            }
        },
        component: Account
    },
    {
        name: 'announcement', path: '/announcement',
        // meta: {
        //     metaInfo : {
        //         title: 'account.title',
        //         keywords: "account.seo.keywords",
        //         description: 'account.description'
        //     }
        // },
        component: () => import('@/views/announcement/list.vue')
    },
    {
        name: 'announcementDetails', path: '/announcement/details',
        // meta: {
        //     metaInfo : {
        //         title: 'account.title',
        //         keywords: "account.seo.keywords",
        //         description: 'account.description'
        //     }
        // },
        component: () => import('@/views/announcement/details.vue')
    },

    {
        name: 'notFound', path: '/404', meta: {
            metaInfo: {
                title: 'basic.tip.notFound',
                keywords: "basic.tip.notFound",
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
    const app = router.app;

    try {
        if (to.meta.metaInfo) {
            let metainfo = to.meta.metaInfo;
            if (metainfo.keywords && i18n.t(metainfo.keywords) != metainfo.keywords) metainfo.keywords = "bfban,BFBAN," + i18n.t(metainfo.keywords);
            else metainfo.keywords = "bfban,BFBAN";
            if (metainfo.title) metainfo.title = i18n.t(metainfo.title);
            else metainfo.title = "";
            if (metainfo.description && i18n.t(metainfo.description) != metainfo.description) metainfo.description = i18n.t(metainfo.description);
            else metainfo.description = "";
            store.commit(CHANGE_META_INFO, metainfo)
        }

        store.commit('syncLoginState');

        // document.title = `${config.name} | ${i18n.t(to.meta.value)}`;
        app.$Loading.start();
    } catch (err) {
        app.$Loading.error();
    } finally {
        next();
    }
});

router.afterEach(() => {
    const app = router.app;
    app.$Loading.finish();
})

export default router;
