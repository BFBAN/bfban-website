import {account_storage, regular} from "./index";

import $store from "@/store"

export default class Application {
    constructor(data) {
        if (data)
            data.computed = {
                isAdmin: this.isAdmin,
                isAdminL1: this.isAdminL1,
                isAdminL2: this.isAdminL2,
                isAdminL3: this.isAdminL3,
                isAdminL4: this.isAdminL4,
                isLogin: this.isLogin,
                isFull: this.isFull,
                isMobile: this.isMobile,
                currentUser: this.currentUser,
                currentLan: this.currentLan,
                ...data.computed,
            }

        return data;
    }

    isAdmin() {
        return account_storage.checkPrivilegeGroup(
            $store.state?.user?.userinfo,
            ['root', 'admin', 'super', 'dev']
        );
    }

    isAdminL1() {
        return this.isAdmin();
    }

    isAdminL2() {
        return account_storage.checkPrivilegeGroup(
            $store.state?.user?.userinfo,
            ['root', 'super', 'dev']
        );
    }

    isAdminL3() {
        return account_storage.checkPrivilegeGroup(
            $store.state?.user?.userinfo,
            ['root', 'dev']
        );
    }

    isAdminL4() {
        return account_storage.checkPrivilegeGroup(
            $store.state?.user?.userinfo,
            ['root']
        );
    }

    isLogin() {
        return Boolean($store.state.user)
    }

    isFull() {
        return Boolean(this.$route.query.full || false);
    }

    currentUser() {
        return $store.state.user || {token: ''}
    }

    currentLan() {
        return this.$root && this.$root.$i18n && this.$root.$i18n.locale || 'zh-CN';
    }

    isMobile() {
        return regular.check('mobile', navigator.userAgent).code >= 0;
    }
}
