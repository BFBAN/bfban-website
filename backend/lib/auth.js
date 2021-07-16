import express from "express";
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
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
    if(user && user.privilege) {
        const privilege = Array.isArray(user.privilege)? user.privilege : user.privilege.split(',');
        for(let i of privilege)
            if(roles.includes(i))
                return false;
    }
    return true;
}

export {
    verifyJWTToken,
    generatePassword,
    comparePassword,
    userHasRoles,
    userHasNotRoles,
}