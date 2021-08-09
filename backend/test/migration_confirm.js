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
 * @typedef {Object} Confirm
 * @property {number} id
 * @property {number} userId
 * @property {number} userVerifyCheaterId
 * @property {Date} createDatetime
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

function cheatMethodConverter(str_src='') {
    const src = new Set(str_src.split(','));
    const dst = new Set();
    for(let i of src.values()) {
        switch(i) {
        case 'stealth': dst.add('invisible'); break;
        case 'wallhack': dst.add('wallhack'); break;
        case 'aimbot': dst.add('aimbot'); break;
        case 'oneShotKill': dst.add('damageChange'); break;
        case 'gadgetModify': dst.add('gadgetModify'); break;
        case 'damageChange': dst.add('damageChange'); break;
        case 'shootingThroughWalls': dst.add('magicBullet'); break;
        default: console.log('Unrecognized cheatMethod:'+i);
        }
    }
    return Array.from(dst).join(',');
}

const converter = new Stream.Writable({
    /** @param {Confirm} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        /** @type {Verify} */
        const verify = (await db_src.select('*').from('user_verify_cheater').where({id: chunk.userVerifyCheaterId}))[0];
        if(!verify) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        if(!verify.originUserId || verify.originUserId.length > 14) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        /** @type {import("../typedef").Player} */
        const player = (await db_dst.select('*').from('players').where({originUserId: verify.originUserId}) )[0];
        if(!player) {
            console.log('Cannot find such player:'+verify.originUserId);
            return callback();
        }
        /** @type {Judgement} */
        const obj = {
            valid: 1,
            byUserId: chunk.userId,
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            action: 'guilt',
            createTime: chunk.createDatetime,
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('judgements').insert(obj);
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('user_confirm_verify').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});
 
 