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
import knex from "knex";
import { Stream } from "stream";

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
    /** @param {Cheater} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        if(!chunk.originUserId || chunk.originUserId.length > 14) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        const cheatMethods_dst = cheatMethodConverter(chunk.cheatMethods);
        const game_src = (await db_src.select('*').from('cheater_game').where({ouid: chunk.originUserId}) ).map(i=>i.game);
        const game_dst = game_src.length>0? JSON.stringify(game_src) : JSON.stringify(['bf1']);
        const obj = {
            originName: chunk.originId,
            originPersonaId: chunk.originPersonaId,
            originUserId: chunk.originUserId,
            games: game_dst,
            cheatMethods: cheatMethods_dst,
            avatarLink: chunk.avatarLink,
            viewNum: chunk.n,
            commentsNum: chunk.commentsNum,
            valid: chunk.valid,
            status: chunk.status,
            createTime: chunk.createDatetime,
            updateTime: chunk.updateDatetime,
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('players').insert(obj).onConflict().ignore();
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('cheaters').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});