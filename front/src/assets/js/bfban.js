import packageInfo from '../../../package.json';
import Print from './print';
import Regular from "@/assets/js/regular";

export default class BFBAN extends Print {
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
        let isBool = false;
        const user = this.$store.state?.user?.userinfo;
        const adminGroup = ['root', 'admin', 'super', 'dev'];
        if (!user) return false;
        for (const i of adminGroup) {
            for (const j of user?.privilege){
                if (j == i) isBool = true;
            }
        }
        return Boolean(isBool);
    }

    isLogin() {
        return Boolean(this.$store.state.user)
    }

    isFull() {
        return Boolean(this.$route.query.full || false);
    }

    currentUser() {
        return this.$store.state.user|| {token: ''}
    }

    currentLan() {
        return this.$root && this.$root.$i18n && this.$root.$i18n.locale || 'zh-CN';
    }

    isMobile() {
        return new Regular().check('mobile', navigator.userAgent).code >= 0;
    }
}