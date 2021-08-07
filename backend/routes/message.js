"use strict";
import express from "express";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { siteEvent } from "../lib/bfban.js";
import { userHasNotRoles, userHasRoles } from "../lib/auth.js";
import { handleCommand } from "../lib/command.js";
import logger from "../logger.js";

const router = express.Router();

router.get('/', verifyJWT, [
    checkquery('box').optional().isIn(['in','out','announce']),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('from').optional().isInt({min: 0}),
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});
        const box = req.query.box? req.query.box : 'in';
        const skip = req.query.skip? req.query.skip : 0;
        const limit = req.query.limit? req.query.limit : 20;
        const from = req.query.from? req.query.from : 0;
        const result = {messages:[], total:0};
        switch(box) {
        case 'in':
            result.messages = await db.select('*').from('messages').where({toUserId: req.user.id}).andWhere('createTime','>=',new Date(from)).offset(skip).limit(limit);
            result.total = await db('messages').count({num: 'id'}).where({toUserId: req.user.id}).andWhere('createTime','>=',new Date(from));
            break;
        case 'out':
            result.messages = await db.select('*').from('messages').where({byUserId: req.user.id}).andWhere('createTime','>=',new Date(from)).offset(skip).limit(limit); 
            result.total = await db('messages').count({num: 'id'}).where({byUserId: req.user.id}).andWhere('createTime','>=',new Date(from));
            break;
        case 'announce':
            switch(true) {
            case userHasRoles(req.user, ['admin','super','root']):
                result.messages = await db.select('*').from('messages').whereIn('type', ['banAppeal','toAdmins']).andWhere('createTime','>=',new Date(from));
                result.total += result.messages.length;
            // eslint-disable-next-line no-fallthrough
            case userHasRoles(req.user, ['normal']):
                result.messages = await db.select('*').from('messages').whereIn('type', ['toNormal']).andWhere('createTime','>=',new Date(from));
                result.total += result.messages.length;
            // eslint-disable-next-line no-fallthrough
            default:
                result.messages = await db.select('*').from('messages').whereIn('type', ['toAll']).andWhere('createTime','>=',new Date(from));
                result.total += result.messages.length;
            }
        }
        res.status(200).json({success: 1, code: 'message.success', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toUserId').if( checkbody('data.type').isIn(['direct','warn','fatal']) ).isInt({min: 0}),
    checkbody('data.type').isIn(['direct','warn','fatal','toAll','toAdmins','toNormals','command']),
    checkbody('data.content').isString().trim().notEmpty()
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});
        
        /** @type {'direct'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'} */
        const type = req.body.data.type;
        /** @type {import("../typedef.js").User|null} */
        let toUser = null;
        if(['direct','warn','fatal'].includes(type)) {
            toUser = (await db.select('*').from('users').where({id: req.body.data.toUserId}) )[0];
            if(!toUser) 
                return res.status(404).json({error: 1, code: 'message.notFound', message: 'no such user.'});
        }
        switch(true) {
        case ( type=='fatal' && userHasRoles(req.user, ['super','root','dev']) ):
            await sendMessage(req.user.id, toUser.id, type, req.body.data.content);
            break; // jump out

        case ( ['info','warn'].includes(type) && userHasRoles(req.user, ['admin','super','root','dev']) ):
            await sendMessage(req.user.id, toUser.id, type, req.body.data.content);
            break; // jump out

        case ( type=='direct' ): // normal or other user
            if(toUser.attr.allowDM === true) // normal user can block dm
                await sendMessage(req.user.id, toUser.id, 'direct', req.body.data.content);
            else
                return res.status(403).json({error: 1, code:'message.blocked', message: 'user block your message.'});   
            break;
        case ( type=='command' ):
            await handleCommand(req.body.data.content, req.user);
            break;
        default: // if the type and privilege did not match all the cases, then deny  
            return res.status(403).json({error: 1, code: 'message.denied', message: 'permission denied.'});
        }

        res.status(200).json({success: 1, code: 'message.success', message: 'post message success'});
    } catch(err) {
        next(err);
    }
});

router.post('/mark', verifyJWT, [
    checkquery('id').isInt({min: 0}),
    checkquery('type').isIn('read', 'unread', 'del')
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        let changed;
        if(req.query.type != 'del')
            changed = await db('messages').update({haveRead: req.query.type=='read'? 1:0})
            .where({toUserId: req.user.id, id: req.query.id})
            .andWhereNot({type: 'falta'});
        else
            changed = await db('messages').del()
            .where({toUserId: req.user.id, id: req.query.id})
            .andWhereNot({type: 'falta'});
        if(changed)
            return res.status(200).json({success: 1, code: 'message.marked', data: {id: req.query.id, type: req.query.type}});
        else
            return res.status(404).json({success: 1, code: 'message.notFound', message: 'no such message.'});
    } catch(err) {
        next(err);
    }
});

/** @param {import("../typedef.js").SiteEvent} event */
async function messageOnSiteEvent(event) {
    logger.info('SiteEvent emitted: '+event.method, event.params);
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
        case 'banAppeal':
            await newBanAppeal(event.params);
            break;
        case 'viewBanAppeal':
            removeBanAppealNotification(event.params);
            break;
        default:
            break;
        } 
    } catch(err) {
        console.error('messageOnSiteEvent: '+err.message, err.stack);
    }
}

siteEvent.on('data', messageOnSiteEvent);

/** 
 * @param {number|null} from @param {number|null} to @param {string} content
 * @param {'direct'|'reply'|'banAppeal'|'info'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'|'...'} type 
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

async function iGotReported(params) {
    /** @type {import("../typedef.js").Report} */
    const report = params.report;
    const user = (await db.select('id').from('users').where({originUserId: report.toOriginUserId}))[0];
    if(!user) // that player being reported hasnt registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', 'You were reported by someone.');
}

async function iGotJudged(params) {
    /** @type {import("../typedef.js").Judgement} */
    const judgement = params.judgement;
    /** @type {import("../typedef.js").User} */
    const user = (await db.select('id').from('users').where({originUserId: judgement.toOriginUserId}))[0];
    if(!user.id) // that player being reported hasnt registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', `You were judge as ${judgement.action}`);
}

async function iGotReplied(params) { // checked that comment dose exist
    /** @type {import("../typedef.js").Reply} */
    const reply = params.reply;
    const {toCommentType, toCommentId, toPlayerId} = reply;
    if(!(toCommentType && toCommentId))
        return;
    const dbname = ['replies', 'reports', 'judgements', 'ban_appeals'];
    const toCommentUser = (await db.select('byUserId').from(dbname[toCommentType]).where({id: toCommentId}))[0].byUserId;
    await sendMessage(reply.byUserId, toCommentUser, 'reply', `You got reply under dbId:${toPlayerId}`);
}

async function newBanAppeal(params) {
    /** @type {import("../typedef.js").BanAppeal} */
    const ban_appeal = params.ban_appeal;
    await sendMessage(ban_appeal.byUserId, undefined, 'banAppeal', ban_appeal.toPlayerId+'');
}

async function removeBanAppealNotification(params) {
    /** @type {import("../typedef.js").BanAppeal} */
    const ban_appeal = params.ban_appeal;
    await db('messages').del().where({type: 'banAppeal', content: ban_appeal.toPlayerId+''});
}

export default router;
export {
    sendMessage,
};