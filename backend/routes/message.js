"use strict";
import path from "path";
import express from "express";
import {body as checkbody, query as checkquery, validationResult} from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import {forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {siteEvent} from "../lib/bfban.js";
import {userHasRoles} from "../lib/auth.js";
import {handleCommand} from "../lib/command.js";
import logger from "../logger.js";
import {readFile} from "fs/promises";

const router = express.Router();

/**
 * @swagger
 * /api/message:
 *   get:
 *     tags:
 *       - message
 *     description: It needs a token, Get notice, which is a generic front-end get notification message list interface
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: box
 *         description: ['in', 'out', 'announce']
 *         type: number
 *         value:
 *       - name: skip
 *         description: 0 ~ infinite
 *         type: number
 *         value: 0
 *       - name: limit
 *         description: 0 ~ 100
 *         type: number
 *         value:
 *       - name: from
 *         description: 0 ~ infinite
 *         type: number
 *         value: 0
 *     responses:
 *       200: message.success
 *       403: message.notFound
 */
router.get('/', verifyJWT, [
    checkquery('box').optional().isIn(['in', 'out', 'announce']),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('from').optional().isInt({min: 0}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});

        const box = req.query.box ? req.query.box : 'in';
        const skip = req.query.skip ? req.query.skip : 0;
        const limit = req.query.limit ? req.query.limit : 20;
        const from = req.query.from ? req.query.from : 0;
        const result = {messages: [], total: 0};
        switch (box) {
            case 'in':
                result.messages = await db('messages')
                    .join('users', 'messages.byUserId', 'users.id')
                    .select('messages.*', 'users.username')
                    .whereIn('type', ['reply', 'info', 'direct', 'warn', 'fatal'])
                    .andWhere({toUserId: req.user.id})
                    .andWhere('messages.createTime', '>=', new Date(from))
                    .orderBy('id', 'desc')
                    .offset(skip).limit(limit);

                result.total = await db('messages').count({num: 'id'})
                    .whereIn('type', ['reply', 'info', 'direct', 'warn', 'fatal'])
                    .andWhere({toUserId: req.user.id})
                    .andWhere('createTime', '>=', new Date(from)).first()
                    .then(r => r.num);
                break;
            case 'out':
                result.messages = await db.select('*').from('messages')
                    .whereIn('type', ['direct', 'warn', 'fatal'])
                    .andWhere({byUserId: req.user.id})
                    .andWhere('createTime', '>=', new Date(from)).orderBy('id', 'desc').offset(skip).limit(limit);

                result.total = await db('messages').count({num: 'id'})
                    .whereIn('type', ['direct', 'warn', 'fatal'])
                    .andWhere({byUserId: req.user.id})
                    .andWhere('createTime', '>=', new Date(from)).first().then(r => r.num);
                break;
            case 'announce':
                result.messages = [];
                switch (true) {
                    case userHasRoles(req.user, ['admin', 'super', 'root']):
                        result.messages = result.messages.concat(await db.select('*').from('messages').whereIn('type', ['banAppeal', 'toAdmins'])
                            .andWhere('createTime', '>=', new Date(from)).orderBy('id', 'desc'));
                        result.total += result.messages.length;
                    // eslint-disable-next-line no-fallthrough
                    case userHasRoles(req.user, ['normal']):
                        result.messages = result.messages.concat(await db.select('*').from('messages').whereIn('type', ['toNormal'])
                            .andWhere('createTime', '>=', new Date(from)).orderBy('id', 'desc'));
                        result.total += result.messages.length;
                    // eslint-disable-next-line no-fallthrough
                    default:
                        result.messages = result.messages.concat(await db.select('*').from('messages').whereIn('type', ['toAll'])
                            .andWhere('createTime', '>=', new Date(from)).orderBy('id', 'desc'));
                        result.total += result.messages.length;
                }
        }
        res.status(200).json({success: 1, code: 'message.success', data: result});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/message:
 *   post:
 *     tags:
 *       - message
 *     summary: Send chat
 *     description: It needs a token, This is a front-end common messaging interface
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data.toUserId
 *         description: Site user dbId
 *         type: number
 *         value:
 *       - name: data.type
 *         description: ['direct', 'warn', 'fatal']
 *         type: number
 *         value:
 *       - name: data.content
 *         description: chat content
 *         type: string
 *         value: hi,bfban
 */
router.post('/', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), [
    checkbody('data.toUserId').if(checkbody('data.type').isIn(['direct', 'warn', 'fatal'])).isInt({min: 0}),
    checkbody('data.type').isIn(['direct', 'warn', 'fatal', 'toAll', 'toAdmins', 'toNormals', 'command']),
    checkbody('data.content').isString().trim().notEmpty()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'message.bad', message: validateErr.array()});

        // check Binding Account
        if (!req.user.originEmail && req.user.privilege.some(item => ['dev', 'root', 'bot', 'admin', 'super'].toString().indexOf(item) === -1))
            return res.status(403).json({
                error: 1,
                code: 'report.bad',
                message: 'The account is not up to the requirements'
            });

        /** @type {'direct'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'} */
        const type = req.body.data.type;
        const content = req.body.data.content;

        /** @type {import("../typedef.js").User|null} */
        let toUser = null;
        if (['direct', 'warn', 'fatal'].includes(type)) {
            toUser = await db.select('*').from('users').where({id: req.body.data.toUserId}).first();
            if (!toUser)
                return res.status(404).json({error: 1, code: 'message.notFound', message: 'no such user.'});
        }

        switch (true) {
            case (type === 'fatal' && userHasRoles(req.user, ['super', 'root', 'dev'])):
                await sendMessage(req.user.id, toUser.id, type, content);
                siteEvent.emit('message', {from: req.user.id, to: toUser.id, type: type, content: content});
                break; // jump out

            case (['info', 'warn'].includes(type) && userHasRoles(req.user, ['admin', 'super', 'root', 'dev'])):
                await sendMessage(req.user.id, toUser.id, type, content);
                siteEvent.emit('message', {from: req.user.id, to: toUser.id, type: type, content: content});
                break; // jump out

            case (type === 'direct'): // normal or other user
                if (toUser.attr.allowDM === true) { // normal user can block dm
                    await sendMessage(req.user.id, toUser.id, 'direct', content);
                    siteEvent.emit('message', {from: req.user.id, to: toUser.id, type: type, content: content});
                } else
                    return res.status(403).json({
                        error: 1,
                        code: 'message.blocked',
                        message: 'user block your message.'
                    });
                break;

            case (type === 'command'):
                await handleCommand(content, req.user);
                break;

            case (['toAll', 'toNormals', 'toAdmins'].includes(type) && userHasRoles(req.user, ['dev', 'super', 'root'])):
                await sendMessage(req.user.id, null, type, content);
                siteEvent.emit('message', {from: req.user.id, to: null, type: type, content: content});
                break;
            default: // if the type and privilege did not match all the cases, then deny
                return res.status(403).json({error: 1, code: 'message.denied', message: 'permission denied.'});
        }

        res.status(201).json({success: 1, code: 'message.success', message: 'post message success'});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/message/mark:
 *   post:
 *     tags:
 *       - message
 *     summary: Mark message
 *     description: It needs a token, Mark message status
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         description: id of the message in the database
 *         type: number
 *         value:
 *       - name: type
 *         description: Mark the status of the message as read and unread (['read', 'unread'])
 *         type: string
 *         value: read
 *     responses:
 *       200: message.success
 *       403: message.notFound
 */
router.post('/mark', verifyJWT, [
    checkquery('id').isInt({min: 0}),
    checkquery('type').isIn('read', 'unread')
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const changed = await db('messages').update({haveRead: req.query.type === 'read' ? 1 : 0})
            .whereIn('type', ['direct', 'warn', 'reply'])
            .andWhere({toUserId: req.user.id, id: req.query.id});
        if (changed)
            return res.status(200).json({
                success: 1,
                code: 'message.marked',
                data: {id: req.query.id, type: req.query.type}
            });
        else
            return res.status(403).json({success: 1, code: 'message.notFound', message: 'no such message.'});
    } catch (err) {
        next(err);
    }
});

/** @param {import("../typedef.js").SiteEvent} event */
async function messageOnSiteEvent(event) {
    logger.verbose('SiteEvent emitted: ' + event.method, event.params);
    try {
        switch (event.method) {
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
    } catch (err) {
        console.error('messageOnSiteEvent: ' + err.message, err.stack);
    }
}

siteEvent.on('action', messageOnSiteEvent);

/**
 * @param {number|null} from @param {number|null} to @param {string} content
 * @param to
 * @param {'direct'|'reply'|'banAppeal'|'info'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'|'command'|'...'} type
 * @param content
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

async function localeMessage(namepath = '', lang = 'en-US', params) {
    let msgs = JSON.parse(await readFile(path.resolve(config.baseDir, './media/messages.json')));
    for (const i of namepath.split('.'))
        msgs = msgs ? msgs[i] : undefined;
    /** @type {string} */
    let text = msgs?.[lang] ? msgs[lang] : msgs?.['en-US'];
    if (text)
        Object.keys(params).forEach(i => {
            text = text
                .replace(new RegExp(`{${i}}`, 'g'), params[i]);
        });
    return text;
}

async function iGotReported(params) {
    /** @type {import("../typedef.js").Report} */
    const report = params.report;
    /** @type {import("../typedef.js").User} */
    const user = await db.select('*').from('users').where({originUserId: report.toOriginUserId}).first();
    if (!user) // that player being reported hasn't registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', await localeMessage('notifications.beReported', user.attr.language, {
        originPersonaId: report.originPersonaId,
        website: config.mail.domain.origin
    }));
}

async function iGotJudged(params) {
    /** @type {import("../typedef.js").Judgement} */
    const judgement = params.judgement;
    /** @type {import("../typedef.js").Player} */
    const player = params.player;
    /** @type {import("../typedef.js").User} */
    const user = await db.select('*').from('users').where({originUserId: judgement.toOriginUserId}).first();
    if (!user) // that player being reported hasn't registered our site
        return;
    await sendMessage(undefined, user.id, 'warn', await localeMessage('notifications.beReported', user.attr.language, {
        status: await localeMessage(`basic.status.${player.status}`, user.attr.language),
        originPersonaId: player.originPersonaId,
        website: config.mail.domain.origin
    }));
}

async function iGotReplied(params) { // checked that comment dose exist
    /** @type {import("../typedef.js").Comment} */
    const reply = params.reply;
    /** @type {import("../typedef.js").Player} */
    const player = params.player
    const {toCommentId, toPlayerId} = reply;
    if (!toCommentId)
        return;
    const toCommentUserId = await db.select('byUserId').from('comments').where({id: toCommentId}).first().then(r => r.byUserId);
    const toCommentUser = await db.select('*').from('users').where({id: toCommentUserId}).first();
    await sendMessage(reply.byUserId, toCommentUserId, 'reply', await localeMessage('notifications.beReplied', toCommentUser.attr.language, {
        playername: player.originName,
        originPersonaId: player.originPersonaId,
        website: config.mail.domain.origin
    }));
}

async function newBanAppeal(params) {
    /** @type {import("../typedef.js").BanAppeal} */
    const banAppeal = params.banAppeal;
    /** @type {import("../typedef.js").Player} */
    const player = params.player;
    /** @type {import("../typedef.js").User} */
    const user = await db.select('*').from('users').where({id: banAppeal.byUserId}).first();
    await sendMessage(banAppeal.byUserId, banAppeal.id, 'banAppeal', await localeMessage('notifications.newBanAppeal', user.attr.language, {
        playername: player.originName,
        originPersonaId: player.originPersonaId,
        website: config.mail.domain.origin
    }));
    // language is specified by the user who submit the banappeal
}

async function removeBanAppealNotification(params) {
    /** @type {import("../typedef.js").BanAppeal} */
    const banAppeal = params.banAppeal;
    await db('messages').delete().where({type: 'banAppeal', toUserId: banAppeal.id});
}

export default router;
export {
    sendMessage,
    localeMessage
};
