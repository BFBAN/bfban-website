"use strict";
import express from "express";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import db from "../mysql.js";
import {userHasRoles, verifyJWTToken} from '../lib/auth.js';
import {re} from "@babel/core/lib/vendor/import-meta-resolve.js";
import Config from "../config.js";

async function verifyAllowPrivilege(req, res, next) {
    try {
        const {username} = req.body.data;
        const result = await db.select('*')
            .from('users')
            .where({username: username}).orWhere({originEmail: username}).first();

        req.user = result;

        if (!req.body.SKIP_CAPTCHA) return next();
        if (!result)
            return res.status(401).json({error: 1, code: 'user.invalid'});
        if (!userHasRoles(result, ['dev', 'bot']))
            return res.status(401).json({error: 1, code: 'user.invalidIdentity'});


        next();
    } catch (err) {
        next(err);
    }
}

/** @param {express.Request} req @param {express.Response} res @param {express.NextFunction} next */
async function verifyJWT(req, res, next) {
    try {
        if (config.__DEBUG__ && req.get('x-whosdaddy') && req.get('x-whosdaddy-p')) {    // DEBUG !!
            /** @type {import("../typedef.js").User} */
            const result = await db.select('*').from('users').where({id: req.get('x-whosdaddy'), valid: 1}).first();
            result.privilege = req.get('x-whosdaddy-p').split(',');
            req.user = result;
            return next();
        }
        const token = req.get('x-access-token');
        /** @type {{userId:number, username:string, privilege:string[], signWhen:number, visitType: String, expiresIn:number}} */
        let decodedToken;
        try {
            decodedToken = await verifyJWTToken(token)
        } catch (err) {
            return res.status(401).json({err: 1, code: 'user.tokenExpired'});
        }
        //console.log('token:'+JSON.stringify(decodedToken)); // DEBUG
        /** @type {import("../typedef.js").User} */
        const result = await db.select('*').from('users').where({id: decodedToken.userId, valid: 1}).first();
        delete result.subscribes; // useless, and may take up a lot of memory
        //console.log(result); // DEBUG
        if (!result)
            return res.status(401).json({error: 1, code: 'user.invalid'});
        if (result.signoutTime > decodedToken.signWhen)
            return res.status(401).json({error: 1, code: 'user.tokenExpired'});
        if(!decodedToken.visitType && !req.header("user-agent") && decodedToken.visitType != allowUserAgent(req.headers["user-agent"]))
            return res.status(401).json({error: 1, code: 'user.tokenClientException'})
        /** @type {import("../typedef.js").User} */
        req.user = result;
        next();
    } catch (err) {
        next(err);
    }
}

/** @param {string[]} agent */
function allowUserAgent(agent = '') {
    switch (agent) {
        case "client-desktop":
        case "client-phone":
            return "client-phone";
        case "websites":
        default:
            return "websites";
    }
}

/** @param {string[]} roles */
function allowPrivileges(roles = []) {
    /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)=>any} */
    return function (req, res, next) { // as long as the user has one allowed role, then allow
        /** @type {string[]} */
        const userRoles = req.user.privilege;
        for (let i of userRoles)
            if (roles.includes(i))
                return next();
        return res.status(403).json({error: 1, code: 'user.permissionDenined'});
    }
}

/** @param {string[]} roles */
function forbidPrivileges(roles = []) {
    /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)=>any} */
    return function (req, res, next) { // as long as the user has one forbidden role, then forbid
        /** @type {string[]} */
        const userRoles = req.user.privilege;
        for (let i of userRoles)
            if (roles.includes(i))
                return res.status(403).json({error: 1, code: 'user.permissionDenined'});
        return next();
    }
}

export {
    verifyAllowPrivilege,
    verifyJWT,
    allowPrivileges,
    forbidPrivileges,
}
