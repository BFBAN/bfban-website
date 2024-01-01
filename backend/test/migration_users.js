/**
 * @typedef {Object} OldUser
 * @property {number} id
 * @property {string} username
 * @property {string} password
 * @property {string} originId
 * @property {string} qq
 * @property {string} privilege
 * @property {Date} createDatetime
 * @property {Date} updateDatetime
 * @property {number} valid
 * @property {string} uId
 */
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} username
 * @property {string} password
 * @property {number[]} subscribes
 * @property {number} valid
 * @property {string[]} privilege
 * @property {Object} attr JSON
 * @property {string} originName
 * @property {string} originUserId
 * @property {string} originPersonaId
 * @property {string} originEmail
 * @property {Date} signoutTime
 * @property {Date} createTime
 * @property {Date} updateTime
 */

import knex from "knex";
import { Stream } from "stream";
import { handleRichTextInput, userDefaultAttribute } from "../lib/user.js";
import config from "../config.js";

const db_src = knex({
    client: 'mysql',
    connection: {
      ...config.mysql,
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
      ...config.newMysql,
        typeCast: (field, next)=> {
            if(field.type == 'JSON')
                return JSON.parse(field.string());
            return next();
        }
    }
});

const converter = new Stream.Writable({
    /** @param {OldUser} chunk */
    write: async (chunk, encoding, callback)=> {
        console.log('--Now handling row:'+chunk.id);
        const attr = userDefaultAttribute(undefined);
        attr.freezeOfNoBinding = true;
        /** @type {User} */
        const obj = {
            id: chunk.id,
            username: chunk.username,
            password: chunk.password,
            subscribes: '[]',
            valid: chunk.valid,
            privilege: JSON.stringify(chunk.valid? [chunk.privilege] : ['blacklisted']),
            attr: JSON.stringify(attr),
            originName: null,
            originEmail: null,
            originPersonaId: null,
            originUserId: null,
            signoutTime: null,
            createTime: chunk.createDatetime,
            updateTime: chunk.updateDatetime,
        };
        console.log('-inserting: '+JSON.stringify(obj));
        await db_dst('users').insert(obj);
        return callback();
    },
    objectMode: true,
});

const istream = db_src.select('*').from('users').orderBy('id','asc').stream();
istream.pipe(converter).on('error', (err)=> {
    console.log('ERROR:'+err.message+'\n'+err.stack);
}).on('finish', async ()=> {
    const increament = await db_src.max({i:'id'}).from('users').first().then(r=>r.i);
    db_dst.raw('alter table users set AUTO_INCREMENT = ?', [increament+1]);
    console.log(`Increament:${increament+1}`);
    console.log('__ALL JOBS HAVE BEEN DONE__');
});
