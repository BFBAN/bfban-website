/**
 * @typedef {Object} Cheater
 * @property {number} id
 * @property {string} originUserId
 * @property {string} originPersonaId
 * @property {number} n
 * @property {number} valid
 * @property {string} avatarLink
 * @property {number} commentsNum
 * @property {string} originId
 * @property {number} status
 * @property {string} game
 * @property {string} cheatMethods
 * @property {Date} createDatetime
 * @property {Date} updateDatetime
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
    /** @param {OldReply} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        if(!chunk.originUserId || chunk.originUserId.length > 14) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        /** @type {import("../typedef").Player} */
        const player = await db_dst.select('*').from('players').where({originUserId: chunk.originUserId}).first();
        if(!player) {
            console.log('Cannot find such player:'+chunk.originUserId);
            return callback();
        }
        /** @type {import("../typedef").Comment[]} */
        const comments = await db_dst.select('*').from('comments').where({toPlayerId: player.id}).orderBy('createTime', 'asc');

        /** @type {import("../typedef").Comment} */
        const obj = {
            type: 'reply',
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            byUserId: chunk.userId,
            toCommentId: chunk.toFloor? comments[chunk.toFloor-1]? comments[chunk.toFloor].id : null : null,
            content: handleRichTextInput(chunk.content),
            valid: chunk.valid,
            createTime: chunk.createDatetime
        }
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('comments').insert(obj);
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('replies').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});
