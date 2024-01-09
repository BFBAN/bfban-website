import achievements from "/public/config/achievements.json"
import {api, http_token} from "@/assets/js/index";

export default class Achievement {
    /**
     * 拼接图标地址
     * @param path
     * @returns {*}
     */
    getIcon(path = 'none.png') {
        return require(`/src/assets/images/achievement/${path}`)
    }

    /**
     * 获取成就信息
     * @param value
     */
    getItem(value) {
        let achievementInfo = {};
        if (!value) return achievementInfo;
        for (let index = 0; index < achievements.child.length; index++) {
            let i = achievements.child[index];
            if (!i.child && i.value === value)
                achievementInfo = i;
            else if (i.child && i.child.length > 0) {
                for (let jIndex = 0; jIndex < i.child.length; jIndex++) {
                    let j = i.child[jIndex];
                    if (j.value === value)
                        achievementInfo = j;
                }
            }
        }
        return achievementInfo;
    }

    /**
     * 主动获取成就
     * @param id
     */
    onActiveAchievement(id) {
        if (!id) return;
        return new Promise((r) => {
            http_token.post(api["account_achievement"], {
                data: {id}
            }).then(res => {
                r(res);
            }).finally((err) => r(err))
        })
    }
}
