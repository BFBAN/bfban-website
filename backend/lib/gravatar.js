import Config from "../config.js";
import md5 from "md5";

const GravatarImageErrorDefaultValue = [
    'mp',
    '404',
    'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG'
]

function getGravatarUrl () {
    if (!Config.gravatar && !Config.gravatar.domain) return "https://www.gravatar.com";

    return Config.gravatar.domain;
}

/**
 * get gravatar Avatar
 * by https://cn.gravatar.com/site/implement/images/
 * @param {String} email
 * @param {Number} errorImagerType [GravatarImageErrorDefaultValue]
 * @returns {string|null}
 */
function getGravatarAvatar (email, errorImagerType = 2) {
    if (!email) return null;

    return `${getGravatarUrl()}/avatar/${md5(email)}?d=${GravatarImageErrorDefaultValue[errorImagerType]}`;
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
