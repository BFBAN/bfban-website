/**
 * @typedef {Object} OldReport
 * @property {number} id
 * @property {number} userId
 * @property {string} cheatMethods
 * @property {string} bilibiliLink
 * @property {string} description
 * @property {string} cheaterUId
 * @property {Date} createDatetime
 * @property {number} valid
 * @property {string} cheaterGameName
 * @property {string} originUserId
 * @property {string} game
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

/*cheatMethods: {
    stealth: '隐身',
    wallhack: '透视',
    aimbot: '自瞄',
    oneShotKill: '秒杀',
    gadgetModify: '改装备',
    damageChange: '改伤',
    shootingThroughWalls: '子弹穿墙',
  },
  possiblecheatMethods: ['wallhack', 'aimbot', 'invisible', 'magicBullet', 
    'damageChange', 'gadgetModify', 'teleport', 'attackServer'],
  */
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
    /** @param {OldReport} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        if(!chunk.originUserId || chunk.originUserId.length > 14) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        /** @type {import("../typedef").Player} */
        const player = (await db_dst.select('*').from('players').where({originUserId: chunk.originUserId}) )[0];
        if(!player) {
            console.log('Cannot find such player:'+chunk.originUserId);
            return callback();
        }
        /** @type {Report} */
        const obj = {
            byUserId: chunk.userId,
            toOriginName: chunk.cheaterGameName,
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            game: chunk.game=='bfv'? 'bfv':'bf1',
            cheatMethods: cheatMethodConverter(chunk.cheatMethods),
            videoLink: handleRichTextInput(chunk.bilibiliLink),
            description: handleRichTextInput(chunk.description),
            valid: chunk.valid,
            createTime: chunk.createDatetime
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('reports').insert(obj).onConflict().ignore();
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('user_report_cheater').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});