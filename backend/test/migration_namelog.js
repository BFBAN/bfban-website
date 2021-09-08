/**
 * @typedef {Object} OldNameLog
 * @property {number} id
 * @property {string} originUserId
 * @property {string} cheaterGameName
 * @property {Date} createDatetime 
 */

/**
 * @typedef {Object} NameLog
 * @property {number} id
 * @property {string} originName
 * @property {string} originUserId
 * @property {string} originPersonaId
 * @property {Date} fromTime
 * @property {Date} toTime
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

const converter = new Stream.Writable({
    /** @param {OldNameLog} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        if(!chunk.originUserId || chunk.originUserId.length > 14) {
            console.log('Bad OriginUserId:'+JSON.stringify(chunk));
            return callback();
        }
        /** @type {Player} */
        const player = await db_dst.select('*').from('players').where({originUserId: chunk.originUserId}).first();
        if(!player) {
            console.log('Cannot find player:'+JSON.stringify(chunk));
            return callback();
        }
        /** @type {NameLog} */
        const latest = await db_dst.select('*').from('name_logs').where({originUserId: chunk.originUserId})
        .orderBy('toTime', 'desc').first();
        if(latest && latest.originName == chunk.cheaterGameName) {
            console.log('-updating: '+JSON.stringify(latest));
            await db_dst('name_logs').update({toTime: chunk.createDatetime}).where({id: latest.id});
            return callback();
        }
        /** @type {NameLog} */
        const obj = {
            originName: chunk.cheaterGameName,
            originPersonaId: player.originPersonaId,
            originUserId: player.originUserId,
            fromTime: chunk.createDatetime,
            toTime: chunk.createDatetime,
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('name_logs').insert(obj);
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('origin').orderBy('createDatetime','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', ()=> {
    console.log('__ALL JOBS HAVE BEEN DONE__');
});