import Print from './print';
import Regular from "@/assets/js/regular";
import {account_storage} from "@/assets/js/index";

export default class Application extends Print {
    BFBANLOG = window.BFBANLOG;

    constructor(data) {
        super();

        data.computed = {
            isAdmin: this.isAdmin,
            isLogin: this.isLogin,
            isFull: this.isFull,
            isMobile: this.isMobile,
            currentUser: this.currentUser,
            currentLan: this.currentLan,
            ...data.computed,
        }

        return data;
    }

    isAdmin () {
        return account_storage.checkPrivilegeGroup(
            this.$store.state?.user?.userinfo,
            ['root', 'admin', 'super', 'dev']
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
        return new Regular().check('mobile', navigator.userAgent).code >= 0;
    }
}
