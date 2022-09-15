import store from '../src/store/index'

export default class PwaUtil {
    isAdmin () {
        let isBool = false;
        const user = store.state?.user?.userinfo;
        const adminGroup = ['root', 'admin', 'super', 'dev'];
        if (!user) return false;
        for (const i of adminGroup) {
            for (const j of user?.privilege){
                if (j == i) isBool = true;
            }
        }
        return Boolean(isBool);
    }

    isLogin () {
        return Boolean(store.state.user)
    }

    // 是否开启扩展
    isEnhance () {
        return store.state.configuration.enhance;
    }
}