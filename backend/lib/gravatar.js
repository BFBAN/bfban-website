import Config from "../config.js";
import md5 from "md5";

function getGravatarUrl () {
    if (!Config.gravatar && !Config.gravatar.domain) return "https://www.gravatar.com";

    return Config.gravatar.domain;
}

/**
 * get gravatar Avatar
 * by https://cn.gravatar.com/site/implement/images/
 * @param email
 * @returns {null|*}
 */
function getGravatarAvatar (email) {
    if (!email) return null;

    return `${getGravatarUrl()}/avatar/${md5(email)}`;
}

/**
 * gravatar Profile info
 * by https://cn.gravatar.com/site/implement/profiles/json/
 * @param email
 * @returns {jsonp}
 */
function getGravatarProfile (email) {
    if (!email) return null;

    return `${getGravatarUrl()}/${md5(email)}.json`;
}

export {
    getGravatarAvatar,
    getGravatarProfile
}