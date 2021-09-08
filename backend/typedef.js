/** 
 * @typedef {Object} Player
 * @property {number} id
 * @property {string} originName
 * @property {string} originPersonaId
 * @property {string} originUserId
 * @property {string} games
 * @property {string} cheatMethods
 * @property {string} avatarLink
 * @property {number} viewNum
 * @property {number} commentsNum
 * @property {number} valid
 * @property {number} status
 * @property {Date} createTime
 * @property {Date} updateTime
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} password
 * @property {string} introduction
 * @property {number} valid
 * @property {string} privilege
 * @property {Object} attr JSON
 * @property {string} originName
 * @property {string} originUserId
 * @property {string} originPersonaId
 * @property {string} originEmail
 * @property {Date} signoutTime
 * @property {Date} createTime
 * @property {Date} updateTime
 */

/** 
 * @typedef {Object} ReqUser
 * @property {User} user
 */

/** 
 * @typedef {Object} Judgement
 * @property {number} valid
 * @property {number} byUserId
 * @property {number} toPlayerId
 * @property {string} toOriginUserId
 * @property {string} cheatMethods
 * @property {string} action
 * @property {string} content
 * @property {Date} createTime
 */

/**
 * @typedef {Object} Reply
 * @property {number} id
 * @property {number} toPlayerId
 * @property {number} byUserId
 * @property {number} toFloor
 * @property {string} content
 * @property {number} valid
 * @property {Date} createTime
 */

/**
 * @typedef {Object} Report
 * @property {number} id
 * @property {number} byUserId
 * @property {string} toOriginName
 * @property {number} toPlayerId
 * @property {string} toOriginUserId
 * @property {string} toOriginPersonaId
 * @property {string} game
 * @property {string} cheatMethods
 * @property {string} videoLink
 * @property {string} description
 * @property {number} valid
 * @property {Date} createTime
 */

/**
 * @typedef {Object} BanAppeal
 * @property {number} id
 * @property {number} toPlayerId
 * @property {number} byUserId
 * @property {string} content
 * @property {number} valid
 * @property {string} viewedAdminIds
 * @property {string} status
 * @property {Date} createTime
 */


/** 
 * @typedef {{method:'report'|'reply'|'judge'|'banAppeal'|'playerUpdate'|'viewBanAppeal'|'register',params:object}} SiteEvent
 */

export {
    Player,
    User,
    Judgement,
    ReqUser,
    SiteEvent,
    Reply,
    Report,
    BanAppeal,
}