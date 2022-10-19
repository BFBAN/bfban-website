import Config from "../config.js";
import md5 from "md5";

/**
 * get gravatar Avatar
 * by https://cn.gravatar.com/site/implement/images/
 * @param email
 * @returns {null|*}
 */
function getGravatarAvatar (email) {
    if (!email) return null;

    return Config.gravatar.domain + "/avatar/" + md5(email);
}

export {
    getGravatarAvatar
}