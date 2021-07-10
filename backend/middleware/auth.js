import express from "express";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import db from "../mysql.js";
import { verifyJWTToken } from '../lib/auth.js';

/** @param {express.Request} req @param {express.Response} res @param {express.NextFunction} next */
async function verifyJWT(req, res, next) {
    try {
        const token = req.get('x-access-token');
        /** @type {{userId:number, username:string, privilege:string, signWhen:number, expiresIn:number}} */
        const decodedToken = await verifyJWTToken(token).catch((err)=> {
            res.status(401).json({ err: 1, code: 'user.tokenExpired' });
        });
        const result = await db.select('id', 'username', 'privilege', 'signoutTime').from('users').where({id: decodedToken.userId, valid: 1})[0];
        if(!result)
            return res.status(401).json({error: 1, code: 'user.invalid'});
        if(result.signoutTime > decodedToken.signWhen+decodedToken.expiresIn)
            return res.status(401).json({error: 1, code: 'user.tokenExpired'});
        
        req.user = { id: result.id, username: result.username, privilege: result.privilege };
        next();
    } catch(err) {
        next(err);
    }
}

/** @param {string[]} roles */
function allowPrivileges(roles=[]) { 
    /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>any} */
    return function(req, res, next) { // as long as the user has one allowed role, then allow
        /** @type {string[]} */
        const userRoles = req.user.privilege.split(',');
        for(let i of userRoles)
            if(roles.indexOf(i) != -1)
                return next();
        return res.status(403).json({error: 1, code: 'user.permissionDenined'});
    }
}

/** @param {string[]} roles */
function forbidPrivileges(roles=[]) {
    /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>any} */
    return function(req, res, next) { // as long as the user has one forbidden role, then forbid
        /** @type {string[]} */
        const userRoles = req.user.privilege.split(',');
        for(let i of userRoles)
            if(roles.indexOf(i) != -1)
                return res.status(403).json({error: 1, code: 'user.permissionDenined'});
        return next();
    }
}

export {
    verifyJWT,
    allowPrivileges,
    forbidPrivileges,
}