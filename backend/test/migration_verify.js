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
    /** @param {Verify} chunk */
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
        /** @type {Judgement} */
        const obj = {
            valid: chunk.valid,
            byUserId: chunk.userId,
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            cheatMethods: cheatMethodConverter(chunk.cheatMethods),
            action: ['discuss', 'guilt', 'suspect','innocent','trash'][chunk.status],
            content: chunk.suggestion,
            createTime: chunk.createDatetime,
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('judgements').insert(obj);
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('user_verify_cheater').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});

