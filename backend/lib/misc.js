"use strict";
import crypto from "crypto";
import config from "../config.js";
const crypt_algo = 'aes256';

/** @param {Error} err */
function generateErrorHelper(err, time=new Date()) {
switch(config.errorHelperVerbose) {
    case true:
        return JSON.stringify({ time: new Date(time).toString(), message: err.message, stack: err.stack }, undefined, 2);
    default: {
        const msg = Buffer.from(`${time.toUTCString()} ${err.message.slice(0,32)}`);
        for(let i=0; i<msg.length; ++i)
            msg.writeUInt8(msg[i]^((69+i)%0xFF), i);
        return msg.toString('base64');
    }
    }
}

/** @param {Buffer|String} content @param {Buffer|String} key */
function encrypt(content, key) {
    content = Buffer.concat([Buffer.alloc(16), Buffer.from(content)]);
    key = Buffer.concat([Buffer.from(key), Buffer.alloc(32, 0)]).slice(0,32); // aes256 requires 32bytes long key
    const cipher = crypto.createCipheriv(crypt_algo, key, crypto.randomBytes(16));
    let crypted = cipher.update(content);
    crypted = Buffer.concat([crypted, cipher.final()]);
    return crypted;
}

/** @param {Buffer|String} content @param {Buffer|String} key */
function decrypt(content, key) {
    try {
        content = Buffer.from(content);
        key = Buffer.concat([Buffer.from(key), Buffer.alloc(32, 0)]).slice(0,32);
        const decipher = crypto.createDecipheriv(crypt_algo, key, content.slice(0,16));
        let decrypted = decipher.update(content.slice(16));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
    } catch(err) { // bad content
        return Buffer.alloc(0);
    }
}

function generateRandomString(length=0, fromChars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    let str = '';
    for(let i=0; i<length; i++)
        str += fromChars[Math.floor(Math.random()*fromChars.length)];
    return str;
}

export {
    generateErrorHelper,
    encrypt,
    decrypt,
    generateRandomString,
};