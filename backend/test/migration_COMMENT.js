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
 * @typedef {Object} Verify
 * @property {number} id
 * @property {number} status
 * @property {string} suggestion
 * @property {number} userId
 * @property {string} cheaterUId
 * @property {Date} createDatetime
 * @property {string} cheatMethods
 * @property {string} originUserId
 * @property {number} valid
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
 * @property {number} toCommentType ['replies', 'reports', 'judgements', 'ban_appeals']
 * @property {number} toCommentId
 * @property {string} content
 * @property {number} valid
 * @property {Date} createTime
 */
/**
 * @typedef {Object} OldReply
 * @property {number} id
 * @property {number} cheaterId
 * @property {number} userId
 * @property {number} toUserId
 * @property {number} toFloor
 * @property {string} content
 * @property {Date} createDatetime
 * @property {string} originUserId
 * @property {number} valid
 */
import knex from "knex";
import { Stream } from "stream";
import { handleRichTextInput } from "../lib/user.js";

const db_src = knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'bfban',
        typeCast: (field, next)=> {
            if(field.type == 'JSON')
                return JSON.parse(field.string());
            return next();
        }
    }
});

const db_dst = knex({
    client: 'mysql',
    connection: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '123456',
        database: 'bfban_2.0_test',
        typeCast: (field, next)=> {
            if(field.type == 'JSON')
                return JSON.parse(field.string());
            return next();
        }
    }
});

const converter = new Stream.Writable({
    /** @param {Player} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        const originUserId = chunk.originUserId;
        /** @type {{id:number, createDatetime:Date, type:'report'|'verify'|'confirm'|'reply'}[]} */
        const oldTimeline = (await db_src.raw(`SELECT id, createDatetime, 'reply' AS 'type' FROM replies WHERE originUserId='${originUserId}' 
        UNION SELECT id, createDatetime, 'report' AS 'type' FROM user_report_cheater WHERE originUserId='${originUserId}' 
        UNION SELECT id, createDatetime, 'verify' AS 'type' FROM user_verify_cheater WHERE originUserId='${originUserId}' 
        UNION SELECT id, createDatetime, 'confirm' AS 'type' FROM user_confirm_verify WHERE userVerifyCheaterId IN ( 
        SELECT id AS userVerifyCheaterId FROM user_verify_cheater WHERE originUserId='${originUserId}' 
        ) 
        ORDER BY createDatetime asc`) )[0];
        const playerId = chunk.id;
        /** @type {{id:number, createTime:Date, type:'report'|'judgement'|'reply'}[]} */
        const newTimeLine = (await db_dst.raw(`SELECT id, createTime, 'reply' AS 'type' FROM replies WHERE toPlayerId=${playerId}
        UNION SELECT id, createTime, 'report' AS 'type' FROM reports WHERE toPlayerId=${playerId}
        UNION SELECT id, createTime, 'judgement' AS 'type' FROM judgements WHERE toPlayerId=${playerId}
        ORDER BY createTime asc`) )[0];
        //      oldTimeline             newTimeline
        //        report                   report
        //     -->reply    ------------     reply<---oldTimeline[i].toFloor-1
        //     |  verify                  judegment
        // i-->\__reply    ------------     reply
        //       confirm                  judgement

        for(let i in oldTimeline) {
            if(oldTimeline[i].type=='reply') {
                /** @type {OldReply} */
                const reply = (await db_src.select('*').from('replies').where({id: oldTimeline[i].id}))[0];
                if(reply.toUserId && reply.toFloor && newTimeLine[reply.toFloor-1] != undefined) {
                    const obj = {
                        toCommentId: newTimeLine[reply.toFloor-1].id, // 0-reply 1-report 2-judgement 3-banAppeal
                        toCommentType: {'reply':0, 'report':1, 'judgement':2}[newTimeLine[reply.toFloor-1].type],
                    };
                    console.log('-updating:'+JSON.stringify(obj));
                    await db_dst('replies').update(obj).where({id: newTimeLine[i].id});
                } // if the old comment reply someone
            } // if the old comment is reply
        }
        return callback();
    },
    objectMode: true,
});

const istream = db_dst.select('*').from('players').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});