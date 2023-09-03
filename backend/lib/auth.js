"use strict";
import express from "express";
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import db from "../mysql.js";
import config from '../config.js';

/** @param {string} token */
function verifyJWTToken(token) {
    return new Promise((resolve, reject)=> {
        jwt.verify(token, config.secret, (err, decodedToken)=> {
            if(err || !decodedToken)
                return reject(err);
            return resolve(decodedToken);
        });
    });
}

/** @param {string} passwd */
async function generatePassword(passwd) {
    return await bcrypt.hash(passwd, 10);
}

/** @param {string} passwd @param {string} hash */
async function comparePassword(passwd, hash) {
    return await bcrypt.compare(passwd, hash);
}

/** @param {{id:number,privilege:string|string[],username:string}|undefined} user @param {string[]} roles */
function userHasRoles(user, roles) {
    if(roles[0] == '*')
        return true;
    if(user && user.privilege) {
        const privilege = Array.isArray(user.privilege)? user.privilege : user.privilege.split(',');
        for(let i of privilege)
            if(roles.includes(i))
                return true;
    }
    return false;
}

/** @param {{id:number,privilege:string|string[],username:string}|undefined} user @param {string[]} roles */
function userHasNotRoles(user, roles) {
    if(roles[0] == '*')
        return false;
    if(user && user.privilege) {
        const privilege = Array.isArray(user.privilege)? user.privilege : user.privilege.split(',');
        for(let i of privilege)
            if(roles.includes(i))
                return false;
    }
    return true;
}

/** @param {string[]} current @param {string} add */
function privilegeGranter(current, add) {
    if(add=='blacklisted') // blacklisted, remove all what he got before
        return ['blacklisted'];
    const tmp = new Set(current);
    if( (tmp.has('blacklisted') || tmp.has('freezed')) && add!='freezed' ) { // unban
        tmp.delete('blacklisted');
        tmp.delete('freezed');
    }
    tmp.add(add); // for freezed and other permission
    if(['dev','admin','super','root'].includes(add))
        tmp.delete('normal');
    return Array.from(tmp);
}

/** @param {string[]} current @param {string} del */
function privilegeRevoker(current, del) {
    const tmp = new Set(current);
    tmp.delete(del);
    if(tmp.size == 0)
        tmp.add('normal');
    return Array.from(tmp);
}

/** @param {string} username */
async function getUserPrivilege(username) {
    const result = await db.select('*').from('users').where({username: username}).first();
    if (!result) {
        return [];  // or return an empty string, based on what you expect
    }
    return result.privilege;
}

export {
    verifyJWTToken,
    generatePassword,
    comparePassword,
    userHasRoles,
    userHasNotRoles,
    privilegeGranter,
    privilegeRevoker,
    getUserPrivilege
}