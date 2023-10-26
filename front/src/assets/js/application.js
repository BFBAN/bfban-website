import Print from './print';
import {account_storage, regular} from "./index";

export default class Application extends Print {
    BFBANLOG = window.BFBANLOG;

    constructor(data) {
        super();

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
            this.$store.state?.user?.userinfo,
            ['root', 'admin', 'super', 'dev']
        );
    }

    isAdminL1() {
        return this.isAdmin();
    }

    isAdminL2() {
        return account_storage.checkPrivilegeGroup(
            this.$store.state?.user?.userinfo,
            ['root', 'super', 'dev']
        );
    }

    isAdminL3() {
        return account_storage.checkPrivilegeGroup(
            this.$store.state?.user?.userinfo,
            ['root', 'dev']
        );
    }

    isAdminL4() {
        return account_storage.checkPrivilegeGroup(
            this.$store.state?.user?.userinfo,
            ['root']
        );
    }

    isLogin() {
        return Boolean(this.$store.state.user)
    }

    isFull() {
        return Boolean(this.$route.query.full || false);
    }

    currentUser() {
        return this.$store.state.user || {token: ''}
    }

    currentLan() {
        return this.$root && this.$root.$i18n && this.$root.$i18n.locale || 'zh-CN';
    }

    isMobile() {
        return regular.check('mobile', navigator.userAgent).code >= 0;
    }
}
