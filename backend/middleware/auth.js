"use strict";
import express from "express";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import db from "../mysql.js";
import { verifyJWTToken } from '../lib/auth.js';
import {re} from "@babel/core/lib/vendor/import-meta-resolve.js";
import Config from "../config.js";

/** @param {express.Request} req @param {express.Response} res @param {express.NextFunction} next */
async function verifyJWT(req, res, next) {
    try {
        if(config.__DEBUG__ && req.get('x-whosdaddy') && req.get('x-whosdaddy-p')) {    // DEBUG !!
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
        } catch(err) {
            return res.status(401).json({ err: 1, code: 'user.tokenExpired' });
        }
        //console.log('token:'+JSON.stringify(decodedToken)); // DEBUG
        /** @type {import("../typedef.js").User} */
        const result = await db.select('*').from('users').where({id: decodedToken.userId, valid: 1}).first();
        delete result.subscribes; // useless, and may take up a lot of memory
        //console.log(result); // DEBUG
        if(!result)
            return res.status(401).json({error: 1, code: 'user.invalid'});
        if(result.signoutTime > decodedToken.signWhen)
            return res.status(401).json({error: 1, code: 'user.tokenExpired'});
        if(!decodedToken.visitType && !req.header("user-agent") && decodedToken.visitType != allowUserAgent(req.headers["user-agent"]))
            return res.status(401).json({error: 1, code: 'user.tokenClientException'})
        /** @type {import("../typedef.js").User} */
        req.user = result;
        next();
    } catch(err) {
        next(err);
    }
}

/** @param {string[]} agent */
function allowUserAgent (agent = '') {
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
function allowPrivileges(roles=[]) {
    /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)=>any} */
    return function(req, res, next) { // as long as the user has one allowed role, then allow
        /** @type {string[]} */
        const userRoles = req.user.privilege;
        for(let i of userRoles)
            if(roles.includes(i))
                return next();
        return res.status(403).json({error: 1, code: 'user.permissionDenined'});
    }
}

/** @param {string[]} roles */
function forbidPrivileges(roles=[]) {
    /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)=>any} */
    return function(req, res, next) { // as long as the user has one forbidden role, then forbid
        /** @type {string[]} */
        const userRoles = req.user.privilege;
        for(let i of userRoles)
            if(roles.includes(i))
                return res.status(403).json({error: 1, code: 'user.permissionDenined'});
        return next();
    }
}

/** @param {express.Request} req @param {string[]} roles */
function verifySelfOrPrivilege(roles = []) {
    /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)=>any} */
    return function (req, res, next) {
        const userRoles = req.user.privilege;
        const superPrivileges = ['root', 'dev', 'super'];

        // Check if the user has one of the super privileges
        if (userRoles.some(role => superPrivileges.includes(role))) {
            return next();
        }
        // Check if the user has one of the specified roles
        if (userRoles.some(role => roles.includes(role))) {
            return res.status(403).json({ error: 1, code: 'user.permissionDenied' });
        }
        // Check if the user's originPersonaId matches the data's toOriginPersonaId
        if (req.user.originPersonaId === req.body.data.toOriginPersonaId) {
            return next();
        }
        // If none of the above conditions are met, deny access
        return res.status(403).json({ error: 1, code: 'user.permissionDenied' });
    }
}

export {
    verifyJWT,
    allowPrivileges,
    forbidPrivileges,
    verifySelfOrPrivilege,
}
