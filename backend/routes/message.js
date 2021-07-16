import express from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { siteEvent } from "../lib/bfban.js";
import { userHasNotRoles } from "../lib/auth.js";

const router = express.Router();

router.get('/messages', verifyJWT, [
    checkquery('box').optional().isIn(['in','out']),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});
        const box = req.query.box? req.query.box : 'in';
        const skip = req.query.skip? req.query.skip : 0;
        const limit = req.query.limit? req.query.limit : 0;
        const result = {messages:[], total:0};
        if(box=='in') {
            result.messages = await db.select('*').from('message').where({toUserId: req.user.id}).offset(skip).limit(limit);
            result.total = await db('messages').count({num: 'id'}).where({toUserId: req.user.id});
        }
        else {
            result.messages = await db.select('*').from('message').where({byUserId: req.user.id}).offset(skip).limit(limit); 
            result.total = await db('messages').count({num: 'id'}).where({byUserId: req.user.id});
        }
        res.status(200).json({success: 1, code: 'message.success', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/message', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toUserId').isInt({min: 0}),
    checkbody('data.type').isIn(['direct','warn','fatal','toAll','toAdmins','toNormals','command']),
    checkbody('data.content').isString().trim().notEmpty()
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").User|undefined} */
        const toUser = (await db.select('*').from('users').where({id: req.body.data.toUserId}) )[0];
        if(!toUser)
            return res.status(404).json({error: 1, code: 'message.notFound', message: 'no such user.'});

        /** @type {'direct'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'} */
        const type = req.body.data.type;

        switch(true) {
        case ( type=='fatal' && userHasRoles(req.user, ['super','root','dev']) ):
            await sendMessage(req.user.id, toUser.id, type, req.body.data.content);
            break; // jump out

        case ( ['direct','warn'].includes(type) && userHasRoles(req.user, ['admin','super','root','dev']) ):
            await sendMessage(req.user.id, toUser.id, type, req.body.data.content); // admins can dm anyone
            break; // jump out

        case ( type=='direct' ): { // normal or other user
            if(!toUser.attr) // no user attribute given, default is block dm
                return res.status(403).json({error: 1, code:'message.blocked', message: 'user block your message.'});
            const attr = JSON.parse(toUser.attr);
            if(attr && attr.allowDM) // normal user can block dm
                await sendMessage(req.user.id, toUser.id, 'direct', req.body.data.content);
            else
                return res.status(403).json({error: 1, code:'message.blocked', message: 'user block your message.'});   
            break;
        }

        default: // if the type and privilege did not match all the cases, then deny  
            return res.status(403).json({error: 1, code: 'message.denied', message: 'permission denied.'});
        }

        res.status(200).json({success: 1, code: 'message.success', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/mark', verifyJWT, [
    checkquery('id').isInt({min: 0}),
    checkquery('type').isIn('read', 'unread', 'del')
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {

})

/** @param {import("../typedef.js").SiteEvent} event */
async function messageOnSiteEvent(event) {
    try {
        switch(event.method) {
        case 'report':
            await iGotReported(event.params);
            break;
        case 'reply':
            await iGotReplied(event.params);
            break;
        case 'judge':
            await iGotJudged(event.params);
            break;
        case 'banappeal':
            await newBanAppeal(event.params);
            break;
        default:
            break;
        } 
    } catch(err) {

    }
}

siteEvent.on('data', messageOnSiteEvent);

/** 
 * @param {number|null} from @param {number|null} to @param {string} content
 * @param {'direct'|'reply'|'info'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'|'...'} type 
 * */
async function sendMessage(from, to, type, content) {
    await db('messages').insert({
        byUserId: from,
        toUserId: to,
        type: type,
        content: content,
        haveRead: 0,
        createTime: new Date()
    });
}

async function iGotReported(report) {
    const user = (await db.select('id').from('users').where({originUserId: report.toOriginUserId}))[0];
    if(!userId) // that player being reported hasnt registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', 'You were reported by someone.');
}

async function iGotJudged(judgement) {
    const user = (await db.select('id').from('users').where({originUserId: judgement.toOriginUserId}))[0];
    if(!userId) // that player being reported hasnt registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', `You were judge as ${judgement.action}`);
}

async function iGotReplied(reply) { // checked that comment dose exist
    const {toCommentType, toCommentId, content} = reply;
    if(!(toCommentType && toCommentId))
        return;
    const dbname = ['replies', 'reports', 'judgements', 'ban_appeals'];
    const toCommentUser = (await db.select('byUserId').from(dbname[toCommentType]).where({id: toCommentId}))[0].byUserId;
    await sendMessage(reply.byUserId, toCommentUser, 'reply', content);
}

async function newBanAppeal(banappeal) {
    await sendMessage(banappeal.byUserId, undefined, 'toAdmins', 'There is a ban appeal:'+banappeal.toPlayerId);
}

export default router;