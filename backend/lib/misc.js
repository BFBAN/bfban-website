"use strict";
import crypto from "crypto";
import { pipeline as _pipeline, Readable, Stream } from "stream";
import { promisify } from "util";
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
        str += fromChars[crypto.randomInt(fromChars.length)];
    return str;
}

function validateFileName(filename='') {
    const illegalRe = /[/?<>\\:*|"]/g;
    // eslint-disable-next-line no-control-regex
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+$/;
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    const windowsTrailingRe = /[. ]+$/;
    return !( illegalRe.test(filename) 
    || controlRe.test(filename) || reservedRe.test(filename) 
    || windowsTrailingRe.test(filename) || windowsReservedRe.test(filename) );
}

function validatePath(path='') {
    const santinized = '/'+path.split('/').filter(i=>i&&validateFileName(i)).join('/');
    return santinized == path;
}

function fileSuffixByMIMEType(mimeType) {
    switch(mimeType) {
    case 'image/gif':
        return '.gif';
    case 'image/jpeg':
        return '.jpg';
    case 'image/png':
        return '.png';
    case 'image/webp':
        return '.webp';
    case 'video/webm':
        return '.webm';
    case 'video/ogg':
        return '.ogg';
    case 'video/mp4':
        return '.mp4';
    default:
        return '';
    }
}

/** @param {import("stream").Readable} stream */
function readStreamTillEnd(stream) {
    let content = Buffer.alloc(0);
    return new Promise((res, rej)=> {
        stream.on('data', chunk=>Buffer.concat([content, chunk? chunk:Buffer.alloc(0)]));
        stream.on('end', chunk=>res(Buffer.concat([content, chunk? chunk:Buffer.alloc(0)])) );
        stream.on('error', err=>rej(err));
    });
}

export {
    generateErrorHelper,
    encrypt,
    decrypt,
    generateRandomString,
    validateFileName,
    validatePath,
    fileSuffixByMIMEType,
    readStreamTillEnd
};