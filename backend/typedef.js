/** 
 * @typedef {Object} Player
 * @property {number} id
 * @property {string} originName
 * @property {string} originPersonaId
 * @property {string} originUserId
 * @property {string} games
 * @property {string} cheateMethods
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
 * @property {string} attr JSON in string
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
 * @property {number} id
 * @property {string} username
 * @property {string} privilege
 * @property {Date} signoutTime
 */

/** 
 * @typedef {Object} Judgement
 * @property {number} valid
 * @property {number} byUserId
 * @property {number} toPlayerId
 * @property {string} toOriginUserId
 * @property {string} toOriginPersonaId
 * @property {string} cheateMethods
 * @property {string} action
 * @property {string} content
 * @property {Date} createTime
 */



export {
    Player,
    User,
    Judgement,
    ReqUser,
}