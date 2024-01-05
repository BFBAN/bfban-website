"use strict";
import EventEmitter from "events";
import express from "express";
import {body as checkbody, query as checkquery, validationResult, oneOf as checkOneof} from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import verifyCaptcha from "../middleware/captcha.js";
import {allowPrivileges, forbidPrivileges, verifyJWT, verifySelfOrPrivilege} from "../middleware/auth.js";
import {cheatMethodsSanitizer, handleRichTextInput, userAttributes, userShowAttributes} from "../lib/user.js";
import {siteEvent, stateMachine} from "../lib/bfban.js";
import {userHasRoles} from "../lib/auth.js";
import {commentRateLimiter, viewedRateLimiter} from "../middleware/rateLimiter.js";
import {texCoincidenceRatio, textSimilarityDiff} from "../lib/textDiff.js";
import serviceApi, {ServiceApiError} from "../lib/serviceAPI.js";
import logger from "../logger.js";
import {verifyDuplicateContent, SpamFormData} from "../lib/akismet.js";
import {re} from "@babel/core/lib/vendor/import-meta-resolve.js";

const router = express.Router()

/** @param {{dbId:number, userId: string, personaId: string}} @returns {Promise<number>} dbId */
async function getPlayerId({dbId, userId, personaId}) {
    const key = dbId ? 'id' : (userId ? 'originuserId' : (personaId ? 'originPersonaId' : undefined));
    const val = dbId ? dbId : (userId ? userId : (personaId ? personaId : undefined));
    if (!key || !val) return -1;
    const tmp = await db.select('id').from('players').where(key, '=', val).first();
    if (!tmp) return -1;
    return tmp.id;
}

/**
 * @swagger
 * /api/player:
 *   get:
 *     tags:
 *       - player
 *     summary: player Detail
 *     description: Get the details of the player who reported it
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: user ID
 *         type: num
 *         in: query
 *       - name: personaId
 *         description: persona ID
 *         required: true
 *         type: integer
 *         in: query
 *         value: 1003377988190
 *       - name: dbId
 *         description: db ID
 *         type: num
 *         in: query
 *       - name: history
 *         description: Whether history exists
 *         required: true
 *         type: boolean
 *         in: query
 *         value: true
 *     responses:
 *       200:
 *         description: viewed.ok
 *       400:
 *         description: viewed.bad
 *       404:
 *         description: player.notFound
 */
router.get('/', [checkquery('userId').optional().isInt({min: 0}), checkquery('personaId').optional().isInt({min: 0}), checkquery('dbId').optional().isInt({min: 0}), checkquery('history').optional()], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'player.bad',
            message: validateErr.array()
        });
        let key = '', val = '';
        switch (true) {
            case !!req.query.userId:
                key = 'originUserId';
                val = req.query.userId;
                break;
            case !!req.query.personaId:
                key = 'originPersonaId';
                val = req.query.personaId;
                break;
            case !!req.query.dbId:
                key = 'id';
                val = req.query.dbId;
                break;
            default:
                return res.status(400).json({
                    error: 1,
                    code: 'player.bad',
                    message: 'Must specify one param from "originUserId","originPersonaId","dbId"'
                });
        }

        const result = await db.select('id', 'originName', 'originUserId', 'originPersonaId', 'games', 'cheatMethods', 'avatarLink', 'viewNum', 'commentsNum', 'status', 'createTime', 'updateTime', 'appealStatus')
            .from('players').where(key, '=', val).first();
        if (!result) return res.status(404).json({error: 1, code: 'player.notFound'});
        if (req.query.history) // that guy does exist
            result.history = await db.select('originName', 'fromTime', 'toTime').from('name_logs').where({originUserId: result.originUserId});

        res.status(200).json({success: 1, code: 'player.ok', data: result});
    } catch (err) {
        next(err);
    }
});

router.get('/batch', [checkquery('userIds').optional().isArray({max: 128}).custom((val) => {
    for (const i of val) if (Number.isNaN(parseInt(i)) || parseInt(i) < 0) throw new Error('Bad input');
    return true;
}), checkquery('personaIds').optional().isArray({max: 128}).custom((val) => {
    for (const i of val) if (Number.isNaN(parseInt(i)) || parseInt(i) < 0) throw new Error('Bad input');
    return true;
}), checkquery('dbIds').optional().isArray({max: 128}).custom((val) => {
    for (const i of val) if (Number.isNaN(parseInt(i)) || parseInt(i) < 0) throw new Error('Bad input');
    return true;
}), checkquery('*').custom((val, {req}) => {
    let cnt = 0;
    cnt += Array.isArray(req.query.userIds) ? req.query.userIds.length : 0;
    cnt += Array.isArray(req.query.personaIds) ? req.query.personaIds.length : 0;
    cnt += Array.isArray(req.query.dbIds) ? req.query.dbIds.length : 0;
    if (cnt > 128) throw new Error('Too much entities. (max 128)');
    return true;
})], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'playerBatch.bad',
            message: validateErr.array()
        });

        let result = [];
        if (req.query.userIds?.length) result = result.concat(await db.select('*').from('players').whereIn('originUserId', req.query.userIds)
            .then(r => r.map(i => {
                delete i.valid;
                return i;
            })));
        if (req.query.personaIds?.length) result = result.concat(await db.select('*').from('players').whereIn('originPersonaId', req.query.personaIds)
            .then(r => r.map(i => {
                delete i.valid;
                return i;
            })));
        if (req.query.dbIds?.length) result = result.concat(await db.select('*').from('players').whereIn('id', req.query.dbIds)
            .then(r => r.map(i => {
                delete i.valid;
                return i;
            })));

        return res.status(200).json({success: 1, code: 'playerBatch.ok', data: result});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/player/viewed:
 *   post:
 *     tags:
 *       - player
 *     summary: 游览量
 *     description: 增加举报者游览量，请做本地缓存
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data.id
 *         description: player的DB id，不是橘子id
 *         type: num
 *         in: path
 *         value: 1
 *     responses:
 *       200:
 *         description: viewed.ok
 *       400:
 *         description: viewed.bad
 */
router.post('/viewed', viewedRateLimiter, [checkbody('data.id').isInt({min: 0})], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'viewed.bad',
            message: validateErr.array()
        });

        await db('players').increment("viewNum", 1).where({id: req.body.data.id});
        return res.status(200).json({success: 1, code: 'viewed.ok'});
    } catch (err) {
        next(err);
    }
});

function raceGetOriginUserId(originName) {
    const isdone = {                                    // what we are doing here:
        successFlag: false, racer: new Set(),           // because origin api isn't good enough,
        /** @type {Map<string, [number, Error]>} */
        result: new Map(), event: new EventEmitter(),   // we need multiple api to provide user profile by name,
        // and we want it asap, so those api need to RACE
        // Promise.race() return or throw the first resolved or rejected Promise result, so we need to block the errors till someone done or all failed
        successListener: (tag) => {              // the function deal with the api get the result
            isdone.racer.add(tag);              // register racer
            return (result) => {                 // return a custom function for handling
                if (isdone.successFlag) return;  // someone already done
                isdone.event.emit('done');      // the listener function of this event will be called next tick
                isdone.successFlag = true;        // so no need to worry about returing competition
                isdone.result.set(tag, [200, result]);
                return result;
            }
        }, failListener: (tag) => {                 // the function deal with the api fail
            return async (error) => {            // return a custom function for handling
                isdone.result.set(tag, [        // record error
                    error.statusCode === 404 ? 404 : 500, error]);
                if (isdone.successFlag) return;  // someone finished before, so just return
                if (isdone.result.size >= isdone.racer.size) { // all racer failed, throw error
                    isdone.event.emit('done');
                    throw (new Error('all tries failed.'));
                }
                await new Promise((res) => isdone.event.once('done', res)); // wait for someone finishes or all fail
            }
        }
    };
    return Promise.race([serviceApi('eaAPI', '/searchUser').query({name: originName}).get().then(r => r.data)
        .then(isdone.successListener('eaAPI')).catch(isdone.failListener('eaAPI')), // getUserProfileBySomeOtherWay(name).then(successListener()).catch(failListener()),
    ]).catch((err) => {
        let is404 = false;
        for (const i of isdone.result.keys()) {
            if (isdone.result.get(i)[0] === 404) is404 = true; else logger.error(`/report getOriginUserId Race error ${i}`, isdone.result.get(i)[1].message, isdone.result.get(i)[1].stack);
        }
        if (is404) return undefined;
        throw (err);
    }).finally(() => {
        isdone.event.emit('done');  // terminate the unterminated promise (if exist)
        isdone.event.removeAllListeners();  // destory
    });
}

/**
 * @swagger
 * /api/player/report:
 *   post:
 *     tags:
 *       - report
 *       - player
 *     summary: report player
 *     description:
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: game
 *         description: Type of game reported
 *         type: num
 *         in: query
 *       - name: originName
 *         description: Origin game ID
 *         required: true
 *         type: integer
 *         in: query
 *       - name: cheatMethods
 *         description: Reported plug-in type ['wallhack', 'aimbot', 'invisable', 'magicBullet', 'damageChange', 'gadgetModify', 'teleport', 'attackServer']
 *         type: array
 *         in: query
 *       - name: videoLink
 *         description: Video connection
 *         type: integer
 *         in: query
 *         value: https://google.com,https://youtube.com
 *       - name: description
 *         description: Supplementary statement
 *         required: true
 *         type: integer
 *         in: query
 *     responses:
 *       200:
 *         description: viewed.ok
 *       400:
 *         description: viewed.bad
 *       404:
 *         description: player.notFound
 */
router.post('/report', verifyJWT, verifyCaptcha, forbidPrivileges(['freezed', 'blacklisted']), [checkbody('data.game').isIn(config.supportGames), checkbody('data.originName').isAscii().notEmpty(), checkbody('data.cheatMethods').isArray().custom(cheatMethodsSanitizer), checkbody('data.videoLink').optional({checkFalsy: true}).isURL().isLength({max: 255}), checkbody('data.description').isString().trim().isLength({
    min: 1,
    max: 65535
}),], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'report.bad',
            message: validateErr.array()
        });

        // The user identity is disabled
        if (req.user.attr.mute) {
            const date = new Date(req.user.attr.mute)
            const now = new Date()
            if (date - now > 0) {
                res.status(400).json({
                    error: 1,
                    code: `report.bad`,
                    message: `You have been disable to report, ${req.user.attr.mute} end of disable`
                });
                return
            }
        }

        // check Binding Account
        if (!req.user.originEmail && !req.user.privilege.some(item => ['dev', 'root', 'bot', 'admin', 'super'].toString().indexOf(item) !== -1)) return res.status(403).json({
            error: 1, code: 'report.bad', message: 'The account is not up to the requirements'
        });

        // check for spam content
        // if (await verifyDuplicateContent(req.body.data.description)) return res.status(403).json({
        //     error: 1,
        //     code: 'report.spam',
        //     message: 'Duplicate content detected'
        // });
        // if (await checkSpam(toSpam(req, {spamType: 'report', content: req.body.data.description})))
        //     return res.status(403).json({
        //         error: 1,
        //         code: 'report.spam',
        //         message: 'The content you submitted contains spam, please revise it'
        //     });

        const originUserId = await raceGetOriginUserId(req.body.data.originName);
        if (!originUserId) return res.status(403).json({
            error: 1,
            code: 'report.notFound',
            message: 'Report user not found.'
        });
        /** @type {{username:string, personaId:string, userId:string}} */
        const profile = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r => r.data);

        // now the user being reported is found
        let avatarLink;
        try {   // get/update avatar each report
            avatarLink = await serviceApi('eaAPI', '/userAvatar').query({userId: profile.userId}).get().then(r => r.data); // this step is not such important, set avatar to default if it fails
        } catch (err) {
            logger.warn('/report: error while fetching user\'s avatar');
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
        const player = {
            id: reported ? reported.id : undefined,
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: JSON.stringify(Array.from(new Set(reported ? reported.games : []).add(req.body.data.game))),
            cheatMethods: JSON.stringify(reported ? reported.cheatMethods : []), // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: reported ? reported.viewNum : 0,
            commentsNum: reported ? reported.commentsNum + 1 : 1,
            valid: 1,
            status: reported ? await stateMachine(reported, req.user, 'report') : 0,
            createTime: reported ? reported.createTime : new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('id').merge().then(r => r[0]);
        const stateChange = {
            prev: reported ? reported.status : null, next: player.status
        };
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write report content to db
        const report = {
            type: 'report',
            byUserId: req.user.id,
            toPlayerId: playerId,
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            toOriginPersonaId: profile.personaId,
            cheatGame: req.body.data.game,
            cheatMethods: JSON.stringify(req.body.data.cheatMethods),
            videoLink: req.body.data.videoLink,
            content: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('comments').insert(report);

        player.id = playerId;
        player.games = Array.from(new Set(reported ? reported.games : []).add(req.body.data.game));
        player.cheatMethods = reported ? reported.cheatMethods : [];
        report.cheatMethods = req.body.data.cheatMethods;

        siteEvent.emit('action', {method: 'report', params: {report, player, stateChange}});
        return res.status(200).json({
            success: 1, code: 'report.success', message: 'Thank you.', data: {
                originName: profile.username,
                originUserId: profile.userId,
                originPersonaId: profile.personaId,
                dbId: report.toPlayerId
            }
        });
    } catch (err) {
        if (err instanceof ServiceApiError || err instanceof Error) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
            return res.status(err.statusCode === 501 ? 501 : 500).json({
                error: 1, code: err.statusCode === 501 ? 'report.notImplement' : 'report.error', message: err.message
            });
        }
        next(err);
    }
});

router.post('/reportById', verifyJWT, verifyCaptcha, forbidPrivileges(['freezed', 'blacklisted']), [checkbody('data.game').isIn(config.supportGames), checkOneof([checkbody('data.originUserId').isInt({min: 0}), checkbody('data.originPersonaId').isInt({min: 0}) // cuurently not support
]), checkbody('data.cheatMethods').isArray().custom(cheatMethodsSanitizer), checkbody('data.videoLink').optional({checkFalsy: true}).isURL(), checkbody('data.description').isString().trim().isLength({
    min: 1,
    max: 65535
}),], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'reportById.bad',
            message: validateErr.array()
        });

        if (req.body.data.originPersonaId && !req.body.data.originUserId) return res.status(500).json({
            error: 1,
            code: 'reportById.notSupportYet',
            message: 'not support yet'
        });
        const originUserId = req.body.data.originUserId
        let profile;
        try {
            profile = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r => r.data);
        } catch (err) {
            if (err.message.includes('Bad Response:')) return res.status(404).json({
                error: 1,
                code: 'reportById.notFound',
                message: 'no such player.'
            });
            throw (err); // unknown error, throw it
        }

        // now the user being reported is found
        let avatarLink;
        try {   // get/update avatar each report
            avatarLink = await serviceApi('eaAPI', '/userAvatar').query({userId: profile.userId}).get().then(r => r.data); // this step is not such important, set avatar to default if it fails
        } catch (err) {
            logger.warn('/reportById: error while fetching user\'s avatar');
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
        const player = {
            id: reported ? reported.id : undefined,
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: JSON.stringify(Array.from(new Set(reported ? reported.games : []).add(req.body.data.game))),
            cheatMethods: JSON.stringify(reported ? reported.cheatMethods : []), // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: reported ? reported.viewNum : 0,
            commentsNum: reported ? reported.commentsNum + 1 : 1,
            valid: 1,
            status: reported ? await stateMachine(reported, req.user, 'report') : 0,
            createTime: reported ? reported.createTime : new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('id').merge().then(r => r[0]);
        const stateChange = {
            prev: reported ? reported.status : null, next: player.status
        };
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write report content to db
        const report = {
            type: 'report',
            byUserId: req.user.id,
            toPlayerId: playerId,
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            toOriginPersonaId: profile.personaId,
            cheatGame: req.body.data.game,
            cheatMethods: JSON.stringify(req.body.data.cheatMethods),
            videoLink: req.body.data.videoLink,
            content: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('comments').insert(report);

        player.id = playerId;
        player.games = Array.from(new Set(reported ? reported.games : []).add(req.body.data.game));
        player.cheatMethods = reported ? reported.cheatMethods : [];
        report.cheatMethods = req.body.data.cheatMethods;

        siteEvent.emit('action', {method: 'report', params: {report, player, stateChange}});
        return res.status(201).json({
            success: 1, code: 'report.success', message: 'Thank you.', data: {
                originName: profile.username,
                originUserId: profile.userId,
                originPersonaId: profile.personaId,
                dbId: report.toPlayerId
            }
        });
    } catch (err) {
        if (err instanceof ServiceApiError || err instanceof Error) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
            return res.status(err.statusCode === 501 ? 501 : 500).json({
                error: 1, code: err.statusCode === 501 ? 'report.notImplement' : 'report.error', message: err.message
            });
        }
        next(err);
    }
});

/**
 * @swagger
 * /api/player/timeline:
 *   get:
 *     tags:
 *       - player
 *     summary: timeline
 *     description: Players draw lines, including comments, reports, replies, complaints content
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: dbId
 *         description: db Id
 *         required: true
 *         type: num
 *         in: query
 *         value: 1
 *       - name: userId
 *         description: user Id
 *         required: true
 *         type: num
 *         in: query
 *         value: 1
 *       - name: personaId
 *         description: persona Id
 *         required: true
 *         type: num
 *         in: query
 *         value: 1
 *       - name: order
 *         description: order，['asc', 'desc']
 *         type: string
 *         in: query
 *         value: desc
 *       - name: subject
 *         description: type，['report', 'reply', 'judgement', 'banAppeal']
 *         type: string
 *         in: query
 *         value: null
 *     responses:
 *       200:
 *         description: viewed.ok
 *       400:
 *         description: viewed.bad
 */
router.get('/timeline', [checkquery('dbId').optional().isInt({min: 0}), checkquery('userId').optional().isInt({min: 0}), checkquery('personaId').optional().isInt({min: 0}), checkquery('skip').optional().isInt({min: 0}), checkquery('limit').optional().isInt({
    min: 0,
    max: 100
}), checkquery('order').optional().isIn(['asc', 'desc']), checkquery('subject').optional().isIn(['report', 'reply', 'judgement', 'banAppeal'])], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'timeline.bad',
            message: validateErr.array()
        });
        const skip = req.query.skip !== undefined ? req.query.skip : 0;
        const limit = req.query.limit !== undefined ? req.query.limit : 20;
        const dbId = await getPlayerId({
            dbId: req.query.dbId, userId: req.query.userId, personaId: req.query.personaId
        });
        const order = req.query.order ? req.query.order : 'asc';
        const subject = req.query.subject ? req.query.subject : '%';

        if (dbId === -1) return res.status(404).json({
            error: 1,
            code: 'timeline.notFound',
            message: 'no such timeline'
        });

        const total = await db.count({num: 1}).from('comments')
            .where({toPlayerId: dbId, valid: 1})
            .andWhere('type', 'like', subject).first()
            .then(r => r.num);

        /** @type {import("../typedef.js").Comment[]} */
        let result = await db('comments').join('users', 'comments.byUserId', 'users.id')
            .select('comments.*', 'users.username', 'users.privilege', 'users.attr')
            .where({toPlayerId: dbId, 'comments.valid': 1})
            .andWhere('comments.type', 'like', subject)
            .orderBy('comments.createTime', order)
            .offset(skip).limit(limit);

        const now = new Date()
        result = result.map(item => {
            item = Object.assign(item, timeLineItemShowAttributes(item, req));

            if (item.attr.mute) {
                const date = new Date(item.attr.mute)
                if (date - now > 0) {
                    item.isMute = true
                }
            }
            delete item.attr
            return item
        })

        result.forEach(i => {     // delete those unused keys
            for (let j of Object.keys(i)) if (typeof (i[j]) == 'undefined' || i[j] == null) delete i[j];
            delete i.valid;
        });

        const replieIds = result.filter(i => i.toCommentId !== undefined).map(i => i.toCommentId);
        /** @type {import("../typedef.js").Comment[]} */
        const quotes = await db('comments').join('users', 'comments.byUserId', 'users.id')
            .select('comments.*', 'users.username', 'users.privilege')
            .whereIn('comments.id', replieIds).andWhere({'comments.valid': 1});
        quotes.forEach(i => {     // delete those unused keys
            for (let j of Object.keys(i)) if (typeof (i[j]) == 'undefined' || i[j] == null) delete i[j];
            delete i.valid;
        });
        result.forEach(i => {     // add origin comment to those replies
            if (i.toCommentId) i.quote = quotes.find(j => j.id === i.toCommentId);
        });

        res.status(200).json({success: 1, code: 'timeline.ok', data: {result, total}});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/player/timeline/item:
 *   get:
 *     tags:
 *       - player
 *     summary: Get comments
 *     description: Get details on a single comment in the timeline
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: timeline.item.ok
 */
router.get('/timeline/item', [checkquery('id').isInt({min: 0}),], async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'timeline.item.bad',
            message: validateErr.array()
        });

        const id = req.query.id;

        const result = await db.from('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .select('comments.*', 'users.username', 'users.privilege')
            .where('comments.id', id)
            .first()
            .then(res => Object.assign(res, timeLineItemShowAttributes(res, req)));

        if (!result) return res.status(400).json({
            error: 1, code: 'timeline.item.bad', message: 'This data is not available.'
        })

        delete result.valid;

        return res.status(200).json({success: 1, code: 'timeline.item.ok', data: result});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/player/reply:
 *   post:
 *     tags:
 *       - player
 *       - user
 *     summary: reply
 *     description: Reply content
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data.toPlayerId
 *         description: player id
 *         required: true
 *         type: num
 *         in: path
 *         value: 1
 *       - name: data.toCommentId
 *         description: Comment, reply, complaint id
 *         type: num
 *         in: path
 *         value: 1
 *       - name: data.content
 *         description: content
 *         required: true
 *         type: string
 *         in: path
 *         value: Text
 *     responses:
 *       200:
 *         description: reply.success
 *       404:
 *         description: reply.notFound
 *       403:
 *         description: reply.spam and reply.bad
 *       400:
 *         description: reply.bad
 */
router.post('/reply', verifyJWT, verifyCaptcha, forbidPrivileges(['freezed', 'blacklisted']), commentRateLimiter.limiter([{
    roles: ['admin', 'super', 'root', 'dev', 'bot'],
    value: 0
}]), [checkbody('data.toPlayerId').isInt({min: 0}), checkbody('data.toCommentId').optional({nullable: true}).isInt({min: 1}), checkbody('data.content').isString().trim().isLength({
    min: 1,
    max: 5000
}),], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'reply.bad',
            message: validateErr.array()
        });
        const {content, toCommentId, toPlayerId} = req.body.data;

        // The user identity is disabled
        if (req.user.attr.mute) {
            const date = new Date(req.user.attr.mute)
            const now = new Date()
            if (date - now > 0) {
                res.status(400).json({
                    error: 1,
                    code: `reply.bad`,
                    message: `You have been disable to reply, ${req.user.attr.mute} end of disable`
                });
                return
            }
        }

        // check Binding Account
        if (!req.user.originEmail && !req.user.privilege.includes('bot')) return res.status(403).json({
            error: 1, code: 'reply.bad', message: 'The account is not up to the requirements'
        });

        // check for spam content
        if (await verifyDuplicateContent(content)) return res.status(403).json({
            error: 1,
            code: 'reply.spam',
            message: 'Duplicate content detected'
        });

        // check for intentional duplication
        const prevUserCommentItem = await db.select("*").from('comments').where({
            toPlayerId: toPlayerId, byUserId: req.user.id
        }).orderBy('createTime', 'desc').limit(3).first();
        if (prevUserCommentItem) {
            const value = textSimilarityDiff(handleRichTextInput(content), handleRichTextInput(prevUserCommentItem.content), 1);
            if (value >= texCoincidenceRatio) return res.status(403).json({
                error: 1,
                code: 'reply.bad',
                message: 'Duplicate submission'
            });
        }

        const dbId = req.body.data.toPlayerId;
        /** @type {import("../typedef.js").Player} */
        const player = await db.select('*').from('players').where({id: dbId}).first();
        if (!player) // no such player
            return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such player'});
        if (toCommentId && await db.select('toPlayerId')    // check whether the comment that user want to reply exists
            .from('comments')
            .where({id: toCommentId})
            .limit(1)
            .first().then(r => r ? r.toPlayerId : -1) !== dbId) return res.status(404).json({
            error: 1,
            code: 'reply.notFound',
            message: 'no such comment'
        });

        const reply = {
            type: 'reply',
            toPlayerId: dbId,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            byUserId: req.user.id,
            toCommentId: toCommentId ? toCommentId : null,
            content: handleRichTextInput(content),
            valid: 1,
            createTime: new Date(),
        };

        const insertId = (await db('comments').insert(reply))[0];
        reply.id = insertId;
        await db('players').update({
            updateTime: new Date()
        }).increment('commentsNum', 1).where({id: dbId});
        siteEvent.emit('action', {method: 'reply', params: {reply, player}});
        if (req.user.privilege.includes('admin') && req.body.data.appealStatus == '1') {
            await db('players').update({appealStatus: '2'}).where({id: dbId});
        }
        return res.status(200).json({success: 1, code: 'reply.success', message: 'Reply success.'});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/player/checkContent:
 *   post:
 *     tags:
 *       - player
 *     summary: Detection text
 *     description: Detect whether the content contains spam ads
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data.content
 *         description: text 1-5000
 *         required: true
 *         type: string
 *         in: path
 *         value: "test"
 *       - name: data.spamType
 *         description: ['reply', 'comment']
 *         type: string
 *         in: path
 *         value: "comment"
 *     responses:
 *       200:
 *         description: checkContent.success
 */
router.post('/checkContent', verifyJWT, verifyCaptcha, forbidPrivileges(['freezed', 'blacklisted']), [checkbody('data.content').isString().trim().isLength({
    min: 1,
    max: 5000
}), checkbody('data.spamType').isIn(['reply', 'comment']),], async (req, res, next) => {
    try {
        const {content, spamType = ''} = req.body.data;
        const waitFormData = new SpamFormData(req, spamType, content);
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'checkContent.bad',
            message: validateErr.array()
        });

        // Whether to submit a report to akismet here
        var result = await submitSpam(waitFormData);
        if (!result && result.status == false) return res.status(403).json({
            error: 1,
            code: 'reply.spam',
            message: result.message ??= 'The content you submitted contains spam, please revise it',
        });

        return res.status(200).json({success: 1, code: 'checkContent.success', message: result.message});
    } catch (err) {
        logger.error('akismet:' + err);
        next(err);
    }
});

/**
 * @swagger
 * /api/player/update:
 *   post:
 *     tags:
 *       - player
 *     summary: Update history name
 *     description: 主动更新举报玩家新的名称
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: userId
 *         description: 用户 id
 *         required: true
 *         type: num
 *         in: path
 *       - name: personaId
 *         description: persona Id
 *         required: true
 *         type: num
 *         in: path
 *       - name: dbId
 *         description: db id
 *         required: true
 *         type: num
 *         in: path
 *         value: 1
 *     responses:
 *       200:
 *         description: update.success
 *       400:
 *         description: update.bad
 *       404:
 *         description: update.notFound
 *       501:
 *         description: update.notImplement OR update.error
 */
router.post('/update', verifyJWT, forbidPrivileges(['freezed', 'blacklisted']), commentRateLimiter.limiter([{
    roles: ['admin', 'super', 'root', 'dev', 'bot'],
    value: 0
}]), [checkquery('userId').optional().isInt({min: 0}), checkquery('personaId').optional().isInt({min: 0}), checkquery('dbId').optional().isInt({min: 0}), checkquery('blockAvatar').optional().isIn(['true', 'false'])], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'update.bad',
            message: validateErr.array()
        });
        let key = '', val = '';

        if (req.body.userId) {
            key = 'originUserId';
            val = req.body.userId;
        } else if (req.body.personaId) {
            key = 'originPersonaId';
            val = req.body.personaId;
        } else if (req.body.dbId) {
            key = 'id';
            val = req.body.dbId;
        } else {
            return res.status(400).json({
                error: 1,
                code: 'update.bad',
                message: 'Must specify one param from "originUserId","originPersonaId","dbId"'
            });
        }

        /** @type {import("../typedef.js").Player} */
        const tmp = await db.select('*').from('players').where(key, '=', val).first();
        if (!tmp) return res.status(404).json({error: 1, code: 'update.notFound', message: 'no such player'});
        const originUserId = tmp.originUserId;
        const profile = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r => r.data);
        let avatarLink = tmp.avatarLink;
        if (userHasRoles(req.user, ['admin', 'super', 'root', 'dev']) && req.query.blockAvatar) {
            if (req.query.blockAvatar === 'true') avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG#BLOCKED'; else avatarLink = await serviceApi('eaAPI', '/userAvatar').query({userId: profile.userId}).get().then(r => r.data);
        } else if (!tmp.avatarLink.endsWith('#BLOCKED')) {
            try {
                avatarLink = await serviceApi('eaAPI', '/userAvatar').query({userId: profile.userId}).get().then(r => r.data);
            } catch (err) {
                logger.warn('/player/update: error while fetching user\'s avatar');
            }
        }
        await db('players').update({
            originName: profile.username, avatarLink: avatarLink
        }).where({originUserId: originUserId});
        await pushOriginNameLog(profile.username, originUserId, profile.personaId);

        siteEvent.emit('action', {method: 'playerUpdate', params: {profile}});
        return res.status(200).json({
            success: 1, code: 'update.success', data: {
                originName: profile.username, originUserId: profile.userId, originPersonaId: profile.personaId,
            }
        });
    } catch (err) {
        if (err instanceof ServiceApiError) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
            return res.status(err.statusCode === 501 ? 501 : 500).json({
                error: 1, code: err.statusCode === 501 ? 'update.notImplement' : 'update.error', message: err.message
            });
        }
        next(err);
    }
});

router.post('/judgement', verifyJWT, allowPrivileges(['admin', 'super', 'root']), [checkbody('data.toPlayerId').isInt({min: 0}), checkbody('data.cheatMethods').optional({nullable: true}).isArray().custom(cheatMethodsSanitizer), // if no kill or guilt judgment is made, this field is not required
    checkbody('data.action').isIn(['suspect', 'innocent', 'discuss', 'guilt', 'kill', 'invalid', 'more', 'farm']), checkbody('data.content').isString().trim().isLength({
        min: 1,
        max: 65535
    }),], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'judgement.bad',
            message: validateErr.array()
        });
        if ((req.body.data.action === 'kill' || req.body.data.action === 'guilt') && !req.body.data.cheatMethods) return res.status(400).json({
            error: 1,
            code: 'judgement.bad',
            message: 'must specify one cheate method.'
        });
        if (req.body.data.action === 'kill' && !userHasRoles(req.user, ['super', 'root'])) return res.status(403).json({
            error: 1,
            code: 'judgement.permissionDenied',
            message: 'permission denied.'
        });
        const {toPlayerId, cheatMethods, action, content} = req.body.data;

        /** @type {import("../typedef.js").Player} */
        const player = await db.select('*').from('players').where({id: toPlayerId}).first();
        if (!player) return res.status(404).json({error: 1, code: 'judgement.notFound', message: 'no such player.'});
        const correspondingRecord = await db.count({num: 1})
            .from('comments')
            .where({toPlayerId: player.id, type: 'banAppeal', appealStatus: 'lock'})
            .first().then(r => r.num);

        // Check if there are locked appeals that will be blocked here
        if (correspondingRecord >= 1) {
            return res.status(403).json({
                error: 1,
                code: 'judgement.appealLock',
                message: 'There is an appeal lock and the case cannot be decided further'
            });
        }

        // check for spam content
        if (await verifyDuplicateContent(req.body.data.description)) return res.status(403).json({
            error: 1,
            code: 'report.spam',
            message: 'Duplicate content detected'
        });

        // check for intentional duplication
        const prevUserCommentItem = await db.select("*").from('comments').where({
            toPlayerId: toPlayerId, byUserId: req.user.id
        }).orderBy('createTime', 'desc').limit(3).first();
        if (prevUserCommentItem) {
            const value = textSimilarityDiff(handleRichTextInput(content), handleRichTextInput(prevUserCommentItem.content), 1);
            if (value >= texCoincidenceRatio) return res.status(403).json({
                error: 1,
                code: 'judgement.bad',
                message: 'Duplicate submission'
            });
        }

        // auth complete, player found, store action into db
        const judgement = {
            type: 'judgement',
            byUserId: req.user.id,
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            cheatMethods: cheatMethods ? JSON.stringify(cheatMethods) : '[]',
            judgeAction: action,
            content: handleRichTextInput(content),
            valid: 1,
            createTime: new Date(),
        };
        const insertId = (await db('comments').insert(judgement))[0];
        judgement.id = insertId;
        const nextstate = await stateMachine(player, req.user, action);
        const stateChange = {prev: player.status, next: nextstate};

        player.status = nextstate;
        player.cheatMethods = nextstate === 1 ? JSON.stringify(cheatMethods) : '[]';
        player.updateTime = new Date();
        player.commentsNum += 1;

        await db('players').update({
            status: player.status,
            cheatMethods: player.cheatMethods,
            updateTime: player.updateTime,
            commentsNum: player.commentsNum,
            appealStatus: player.appealStatus ? '2' : null
        }).where({id: player.id});

        judgement.cheatMethods = cheatMethods ? cheatMethods : [];
        player.cheatMethods = nextstate === 1 ? cheatMethods : [];

        siteEvent.emit('action', {method: 'judge', params: {judgement, player, stateChange}});
        return res.status(200).json({success: 1, code: 'judgement.success', message: 'thank you.'});
    } catch (err) {
        next(err);
    }
});

router.post('/banAppeal', verifyJWT, verifySelfOrPrivilege(['volunteer']), forbidPrivileges(['freezed', 'blacklisted']), commentRateLimiter.limiter([{
    roles: ['admin', 'super', 'root', 'dev', 'bot'],
    value: 0
}]), [checkbody('data.toPlayerId').isInt({min: 0}), checkbody('data.content').isString().trim().isLength({
    min: 1,
    max: 65535
}), // Adding new checks for optional parameters
    checkbody('data.appealType').isString().isIn(['moss', 'farm', 'none']),], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'banAppeal.bad',
            message: validateErr.array()
        });

        /** @type {import("../typedef.js").Player} */
        const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
        if (!player) return res.status(404).json({error: 1, code: 'banAppeal.notFound', message: 'no such player'});
        if (player.status !== 1 && player.status !== 2) return res.status(400).json({
            error: 1,
            code: 'banAppeal.noNeed',
            message: 'no need for ban appeal'
        });
        /** @type {import("../typedef.js").Comment} */

        let contentObject = {};
        const prev = await db.select('*').from('comments').where({
            toPlayerId: req.body.data.toPlayerId, type: 'banAppeal'
        }).orderBy('createTime', 'desc').first();
        if (prev && prev.appealStatus === 'lock') return res.status(403).json({
            error: 1,
            code: 'banAppeal.locked',
            message: 'this thread is locked'
        });
        // 申诉事件，不符合条件, 添加冷却时间
        if (player.appealStatus == 1 && !userHasRoles(req.user, ['root', 'dev', 'super', 'admin', 'volunteer'])) {
            if (!prev) return res.status(400).json({
                error: 1, code: 'banAppeal.noPreviousAppeal', message: 'no previous appeal found'
            });
            const dbTime = new Date(prev.createTime);
            const currentTime = new Date();
            const diffHours = (currentTime - dbTime) / (1000 * 60 * 60); // convert milliseconds difference to hours

            if (diffHours < 24) return res.status(404).json({
                error: 1, code: 'banAppeal.timeLimit', message: 'less than a day since the last appeal'
            });
        }

        contentObject = timeLineItemSetAttributes(req.body.data);

        const banAppeal = {
            type: 'banAppeal',
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            byUserId: req.user.id,
            content: JSON.stringify(contentObject),   // Convert the content object to a string here
            viewedAdmins: '[]',
            appealStatus: '1',
            valid: 1,
            createTime: new Date()
        };
        const insertId = await db('comments').insert(banAppeal).then(r => r[0]);

        banAppeal.id = insertId;
        banAppeal.viewedAdmins = [];

        await db('players')
            .where('originPersonaId', player.originPersonaId)
            .update({status: 9});

        siteEvent.emit('action', {method: 'banAppeal', params: {banAppeal, player}});
        return res.status(201).json({success: 1, code: 'banAppeal.success', message: 'please wait.'})
    } catch (err) {
        next(err);
    }
});

router.post('/viewBanAppeal', verifyJWT, allowPrivileges(['admin', 'super', 'root']), [checkbody('data.id').isInt({min: 0}), checkbody('data.status').optional().isIn(['open', 'close', 'lock'])], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty()) return res.status(400).json({
            error: 1,
            code: 'banAppeal.bad',
            message: validateErr.array()
        });

        /** @type {import("../typedef.js").Comment} */
        const banAppeal = await db.select('*').from('comments').where({
            id: req.body.data.id, type: 'banAppeal'
        }).first();
        if (!banAppeal) return res.status(404).json({
            success: 1,
            code: 'banAppeal.notFound',
            message: 'no such ban appeal'
        });

        const viewedAdmins = new Set(banAppeal.viewedAdmins);
        viewedAdmins.add(req.user.id);

        if (req.body.data.status) banAppeal.appealStatus = req.body.data.status;

        banAppeal.viewedAdmins = JSON.stringify(Array.from(viewedAdmins).slice(0, config.personsToReview + 1));
        await db('comments').update({
            viewedAdmins: banAppeal.viewedAdmins, appealStatus: banAppeal.appealStatus,
        }).where({id: banAppeal.id});
        banAppeal.viewedAdmins = Array.from(viewedAdmins).slice(0, config.personsToReview + 1);

        if (viewedAdmins.size >= config.personsToReview) siteEvent.emit('action', {
            method: 'viewBanAppeal',
            params: {banAppeal: banAppeal}
        });

        return res.status(200).json({success: 1, code: 'viewBanAppeal.success', message: 'thank you'});
    } catch (err) {
        next(err);
    }
});

/** @param {string} originName @param {string} originUserId @param {string} originPersonaId
 * @param originUserId
 * @param originPersonaId
 */
async function pushOriginNameLog(originName, originUserId, originPersonaId) {
    const last = await db.select('*').from('name_logs').where({originUserId: originUserId}).orderBy('toTime', 'desc').first();
    if (last && last.originName === originName) {
        await db('name_logs').update({toTime: new Date}).where({id: last.id});
        return false;
    } else {
        const name_log = {
            originName: originName,
            originUserId: originUserId,
            originPersonaId: originPersonaId,
            fromTime: new Date(),
            toTime: new Date()
        };
        await db('name_logs').insert(name_log);

        siteEvent.emit('action', {method: 'name_tracker', params: {name_log}});
        return true;
    }
}

/**
 * Verify if the string json is similar
 * @param jsonValue
 * @returns {boolean}
 */
function isJSON(jsonValue = "") {
    if (!!!jsonValue) return false;

    if (/^[\],:{}\s]*$/.test(jsonValue.toString().replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    }
    return false;
}

const timeLineItemAttributes = {
    "appealType": {type: "string", appealType: ['moss', 'farm', 'none'], get: true, set: true, default: 'none'},
    "extendedLinks": {type: "object", appealType: ['moss', 'farm'], get: true, set: true, default: {}},
    "extendedLinks.btrLink": {type: "string", appealType: ['farm'], get: true, set: true, default: ""},
    "extendedLinks.videoLink": {
        type: "string", appealType: ['moss', 'farm'], get: true, set: true, default: ""
    },
    "extendedLinks.mossDownloadUrl": {
        type: "string", appealType: ['moss', 'farm'], get: true, set: true, default: ""
    },
    "content": {type: "string", appealType: ['moss', 'farm', 'none'], set: true, default: ""},
    "text": {type: "string", appealType: ['moss', 'farm', 'none'], get: true, default: ""},
}

function timeLineItemSetAttributes(attr) {
    let result = {};
    for (let i of Object.keys(timeLineItemAttributes)) if (typeof (attr[i]) == timeLineItemAttributes[i].type && (timeLineItemAttributes[i].set || force) && timeLineItemAttributes[i].appealType.includes(attr.appealType) && attr[i]) result[i] = attr[i] ?? timeLineItemAttributes[i].default;
    return result;
}

/**
 * @param item
 * @returns {{
 *     extendedLink?: Map
 *     appealType: String
 *     text: String
 * }}
 */
function timeLineItemShowAttributes(item = {}, req) {
    switch (item.type) {
        case 'banAppeal':
            // New code to handle the content field
            if (isJSON(item.content)) {
                const superPrivileges = ['root', 'dev', 'super'];
                let contentAsMap = JSON.parse(item.content) ?? {};

                // Check if the user's privilege doesn't contain 'admin' and 'dev' and 'root'
                if (!item.privilege.some(role => superPrivileges.includes(role))) {
                    // Check if appealType is 'moss' and if mossDownloadUrl exists
                    // Delete the mossDownloadUrl field
                    if (contentAsMap.appealType === 'moss' && contentAsMap.extendedLinks.hasOwnProperty('mossDownloadUrl')) delete contentAsMap.extendedLinks.mossDownloadUrl;
                }

                item.content = {
                    appealType: contentAsMap.appealType,
                    extendedLinks: contentAsMap.extendedLinks,
                    text: contentAsMap.content ??= null,
                }
                return;
            }

            item.content = {
                text: item.content
            }

            break;
        default:
            item.content = {
                text: item.content
            }
            break;
    }

    item.content.showAttachment = !!req.user;
    if (!req.user && !!item.content.extendedLinks) {
        delete item.content.extendedLinks;
    }
    return item;
}

export default router;
export {
    pushOriginNameLog,
};
