import express from "express";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import { verifyJWT } from "../middleware/auth.js";
import { allowPrivileges, forbidPrivileges } from "../middleware/auth.js";
import { commentRateLimiter } from "./player.js";
import { sendMessage } from "./message.js";
import { privilegeGranter, privilegeRevoker, userHasRoles } from "../lib/auth.js";
import { userSetAttributes } from "../lib/user.js";
import got from "got";

const router = express.Router();

router.get('/searchUser', verifyJWT, allowPrivileges(["super","root","dev"]), [
    checkquery('name').isString()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'searchUser.bad', message: validateErr.array()});
        
        const result = await db.select('*').from('users').where('username', 'like', `%${req.query.name}%`).limit(20);
        
        return res.status(200).json({success: 1, code: 'searchUser.ok', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/setComment', verifyJWT, allowPrivileges(["super","root","dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.content').isString().isLength({max: 65535}),
    checkbody('data.videoLink').optional().isURL().isLength({max: 255}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'setComment.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").Comment} */
        const comment = await db.select('*').from('comments').where({id: req.body.data.id}).first();
        if(!comment)
            return res.status(404).json({error: 1, code: 'setComment.notFound'});
        
        await sendMessage(req.user.id, null, "command", JSON.stringify({action:'setComment', target: comment.id}));
        if(req.body.data.content.length == 0 && !req.body.data.videoLink)
            await db('comments').delete().where({id: comment.id});
        else {
            comment.content = req.body.data.content;
            comment.videoLink = comment.type=='report'? (req.body.data.videoLink? req.body.data.videoLink : comment.videoLink) : undefined;
            await db('comments').update(comment).where({id: comment.id});
        }

        return res.status(200).json({success: 1, code: 'setComment.ok'});
    } catch(err) {
        next(err);
    }
});

router.post('/setUser', verifyJWT, allowPrivileges(["super","root","dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.action').isIn(['grant', 'revoke']),
    checkbody('data.role').isIn(['normal','admin','bot','super','dev','blacklisted','freezed'])
],/** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'setComment.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.body.data.id});
        if(!user)
            return res.status(404).json({error: 1, code: 'setUser.notFound'});
        const role = req.body.data.role;
        if(req.body.data.action == 'grant') {
            const devCan = ['normal','bot','blacklisted','freezed'],
                superCan = ['normal','admin','blacklisted','freezed'], 
                rootCan  = ['normal','admin','bot','super','dev','blacklisted','freezed'];
            let flag = false;
            // check if current user can grant such permission
            flag = (userHasRoles(req.user, ['dev']) && devCan.includes(role) )? true : flag;
            flag = (userHasRoles(req.user, ['super']) && superCan.includes(role) )? true : flag;
            flag = (userHasRoles(req.user, ['root']) && rootCan.includes(role) )? true : flag;
            if(flag)
                user.privilege = privilegeGranter(user.privilege, role);    
            else
                return res.status(403).json({error: 1, code: 'setUser.permissionDenied'});
        } else {
            const devCant = ['dev','admin','super','root'],
                superCant = ['super','root','dev'],
                rootCant  = ['root'];
            let flag = false;
            // check if current user can revoke such permission
            flag = (userHasRoles(req.user, ['dev']) && devCant.includes(role) )? flag : true;
            flag = (userHasRoles(req.user, ['super']) && superCant.includes(role) )? flag : true;
            flag = (userHasRoles(req.user, ['root']) && rootCant.includes(role) )? flag : true;
            if(flag)
                user.privilege = privilegeRevoker(user.privilege, role);
            else
                return res.status(403).json({error: 1, code: 'setUser.permissionDenied'});
        }
        await sendMessage(req.user.id, null, "command", JSON.stringify({action:'setUser', target: user.id, detail: `${req.body.data.action}:${role}`}));
        await db('users').update(user).where({id: user.id});
        
        return res.status(200).json({success: 1, code: 'setUser.ok'});
    } catch(err) {
        next(err);
    }
});

router.post('/setUserAttr', verifyJWT, allowPrivileges(["root","dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.attr').isObject()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'setUserAttr.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.body.data.id});
        if(!user)
            return res.status(404).json({error: 1, code: 'setUserAttr.notFound'});
        
        user.attr = userSetAttributes(user.attr, req.body.data.attr, true);

        await sendMessage(req.user.id, null, "command", JSON.stringify({action:'setUserAttr', target: user.id}));
        await db('users').update(user).where({id: user.id});
        
        return res.status(200).json({success: 1, code: 'setUserAttr.ok'});
    } catch(err) {
        next(err);
    }
});

router.get('/msGraphStatus', verifyJWT, allowPrivileges(['root']), 
/** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const svResponse = await got(`${config.services.msGraphAPI.url}/status`, {
            throwHttpErrors: false,
            resolveBodyOnly: true
        }).json();
        return res.status(200).json(svResponse);
    } catch(err) {
        next(err);
    }
});

router.get('/msGraphInit', verifyJWT, allowPrivileges(['root']), 
/** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const redirectUrl = await got(`${config.services.msGraphAPI.url}/msLogin`, {
            followRedirect: false,
        });
        return res.status(200).json({success: 1, code: 'msGraphInit.redirect', data: redirectUrl.headers.location});
    } catch(err) {
        next(err);
    }
});

router.post('/msGraphAuthCode', verifyJWT, allowPrivileges(['root']), [
    checkbody('data.code').isString()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'setUserAttr.bad', message: validateErr.array()});
        
        const svResponse = await got(`${config.services.msGraphAPI.url}/msAuthCallBack?code=${req.body.data.code}`, {
            throwHttpErrors: false,
            resolveBodyOnly: true,
        }).json();

        return res.status(svResponse.success? 200:500).json(svResponse);
    } catch(err) {
        next(err);
    }
});

//router.post('/msGraphDeleteFile', verifyJWT, allowPrivileges(['root', 'super']));
//router.post('/msGraphModifyLink', verifyJWT, allowPrivileges(['root', 'super']));
export default router;