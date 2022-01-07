"use strict";
import EventEmitter from "events";
import express from "express";
import { check, body as checkbody, query as checkquery, validationResult, oneOf as checkOneof } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { originClients, getUserProfileByName } from "../lib/origin.js"
import { cheatMethodsSanitizer, handleRichTextInput } from "../lib/user.js";
import { siteEvent, stateMachine } from "../lib/bfban.js";
import { userHasRoles } from "../lib/auth.js";
import { commentRateLimiter, viewedRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router()

/** @param {{dbId:number, userId: string, personaId: string}} @returns {Promise<number>} dbId */
async function getPlayerId({dbId, userId, personaId}) {
    const key = dbId? 'id' : (userId? 'originuserId' : (personaId? 'originPersonaId':undefined) );
    const val = dbId? dbId : (userId? userId : (personaId? personaId:undefined) );
    if(!key || !val)
        return -1;
    const tmp = await db.select('id').from('players').where(key, '=', val).first();
    if(!tmp)
        return -1;
    return tmp.id;
}

router.get('/', [
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('dbId').optional().isInt({min: 0}),
    checkquery('history').optional()
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'player.bad', message: validateErr.array()});
        let key = '', val='';
        switch(true) {
        case !!req.query.userId:
            key = 'originUserId'; val = req.query.userId; break;
        case !!req.query.personaId:
            key = 'originPersonaId'; val = req.query.personaId; break;
        case !!req.query.dbId:
            key = 'id'; val = req.query.dbId; break;
        default:
            return res.status(400).json({error: 1, code: 'player.bad', message: 'Must specify one param from "originUserId","originPersonaId","dbId"'});
        }

        const result = await db.select('id','originName','originUserId','originPersonaId','games',
        'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
        .from('players').where(key, '=', val).first();
        if(!result)
            return res.status(404).json({error: 1, code: 'player.notFound'});
        if(req.query.history) // that guy does exist
            result.history =  await db.select('originName','fromTime','toTime').from('name_logs').where({originUserId: result.originUserId});
        
        res.status(200).json({success: 1, code: 'player.ok', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/viewed', viewedRateLimiter, [
    checkbody('data.id').isInt({min: 0})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'viewed.bad', message:validateErr.array()});

        await db('players').increment("viewNum", 1).where({id: req.body.data.id});
        return res.status(200).json({success:1, code:'viewed.ok'});
    } catch(err) {
        next(err);
    }
});

router.post('/report', verifyJWT, verifyCaptcha,
    forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.game').isIn(config.supportGames),
    checkbody('data.originName').isAscii().notEmpty(),
    checkbody('data.cheatMethods').isArray().custom(cheatMethodsSanitizer),
    checkbody('data.videoLink').optional({checkFalsy: true}).isURL(),
    checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'report.bad', message:validateErr.array()});
        
        const isdone = {                                    // what we are doing here:
            successFlag: false, racer: new Set(),           // because origin api isnt good enough, 
            winner: '',         fails: new Set(),           // we need multiple api to provide user profile by name
            failMessages: [],   event: new EventEmitter(),  // and we want it asap, so those api need to RACE
            // Promise.race() return or throw the first resolved or rejected Promise result, so we need to block the errors till someone done or all failed
            successListener: (tag)=> {              // the function deal with the api get the result                 
                isdone.racer.add(tag);              // register racer
                return (result)=> {                 // return a custom function for handling
                    if(isdone.successFlag) return;  // someone already done
                    isdone.event.emit('done');      // the listener function of this event will be called next tick
                    isdone.successFlag=true; isdone.winner=tag;  // so no need to worry about returing competition 
                    return result;
                } 
            },
            failListener: (tag)=> {                 // the function deal with the api fail
                isdone.racer.add(tag);              // register racer again, dosent matter because we're using Set
                return async (error)=> {            // return a custom function for handling
                    isdone.fails.add(tag); isdone.failMessages.push(error); // log error
                    if(isdone.successFlag) return;  // someone finished before, so just return
                    if(isdone.fails.size>=isdone.racer.size) { // all racer failed, throw error
                        isdone.event.emit('done'); throw(new Error('all tries failed.'));
                    }
                    await new Promise((res,rej)=>isdone.event.once('done', res)); // wait for someone finishes or all fail
                    return;
                }
            }
        };
        /** @type {{username:string, personaId:string, userId:string}} */
        const profile = await Promise.race([ 
            getUserProfileByName(req.body.data.originName).then(isdone.successListener('origin')).catch(isdone.failListener('origin')),
            // getUserProfileBySomeOtherWay(name).then(successListener()).catch(failListener()),
        ]).catch((err)=> { 
            //console.log(err);   // DEBUG
            //console.log(isdone.failMessages);
            return undefined; 
        });
        if(!profile)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user not found.'});
        isdone.event.emit('done');  // terminate the unterminated promise (if exist)
        isdone.event.removeAllListeners();  // destory

        // now the user being reported is found
        let avatarLink;
        try {   // get/update avatar each report
            const client = originClients.getOne();
            avatarLink = await client.getUserAvatar(profile.userId); // this step is not such important, set avatar to default if it fail
        } catch(err) {
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
        const player = {
            id: reported? reported.id : undefined, 
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: JSON.stringify(Array.from( new Set(reported? reported.games : []).add(req.body.data.game) )),
            cheatMethods: JSON.stringify(reported? reported.cheatMethods : []), // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: reported? reported.viewNum : 0,
            commentsNum: reported? reported.commentsNum+1 : 1,
            valid: 1,
            status: reported? await stateMachine(reported, req.user, 'report') : 0,
            createTime: reported? reported.createTime : new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('id').merge().then(r=>r[0]);
        const stateChange = {
            prev: reported? reported.status : null, 
            next: player.status
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
        player.games = Array.from( new Set(reported? reported.games : []).add(req.body.data.game) );
        player.cheatMethods = reported? reported.cheatMethods : [];
        report.cheatMethods = req.body.data.cheatMethods;

        siteEvent.emit('action', {method: 'report', params: {report, player, stateChange}});
        return res.status(201).json({success: 1, code:'report.success', message:'Thank you.', data: {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            dbId: report.toPlayerId
        }});
    } catch(err) {
        next(err);
    }
});

router.post('/reportById', verifyJWT, verifyCaptcha, 
    forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.game').isIn(config.supportGames),
    checkOneof([
        checkbody('data.originUserId').isInt({min: 0}), 
        checkbody('data.originPersonaId').isInt({min: 0}) // cuurently not support
    ]),
    checkbody('data.cheatMethods').isArray().custom(cheatMethodsSanitizer),
    checkbody('data.videoLink').optional({checkFalsy: true}).isURL(),
    checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'reportById.bad', message:validateErr.array()});
        
        if(req.body.data.originPersonaId && !req.body.data.originUserId)
            return res.status(500).json({error:1, code:'reportById.notSupportYet', message: 'not support yet'});
        const originUserId = req.body.data.originUserId
        const client = originClients.getOne();
        let profile;
        try { 
            profile = await client.getInfoByUserId(originUserId);
        } catch(err) {
            if(err.message.includes('Bad Response:'))   
                return res.status(404).json({error:1, code:'reportById.notFound', message: 'no such player.'});
            throw(err); // unknown error, throw it
        }

        // now the user being reported is found
        let avatarLink;
        try {   // get/update avatar each report
            const client = originClients.getOne();
            avatarLink = await client.getUserAvatar(profile.userId); // this step is not such important, set avatar to default if it fail
        } catch(err) {
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
        const player = {
            id: reported? reported.id : undefined, 
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: JSON.stringify(Array.from( new Set(reported? reported.games : []).add(req.body.data.game) )),
            cheatMethods: JSON.stringify(reported? reported.cheatMethods : []), // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: reported? reported.viewNum : 0,
            commentsNum: reported? reported.commentsNum+1 : 1,
            valid: 1,
            status: reported? await stateMachine(reported, req.user, 'report') : 0,
            createTime: reported? reported.createTime : new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('id').merge().then(r=>r[0]);
        const stateChange = {
            prev: reported? reported.status : null, 
            next: player.status
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
        player.games = Array.from( new Set(reported? reported.games : []).add(req.body.data.game) );
        player.cheatMethods = reported? reported.cheatMethods : [];
        report.cheatMethods = req.body.data.cheatMethods;

        siteEvent.emit('action', {method: 'report', params: {report, player, stateChange}});
        return res.status(201).json({success: 1, code:'report.success', message:'Thank you.', data: {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            dbId: report.toPlayerId
        }});
    } catch(err) {
        next(err);
    }
});


router.get('/timeline', [
    checkquery('dbId').optional().isInt({min: 0}),
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('order').optional().isIn(['asc', 'desc']),
    checkquery('subject').optional().isIn(['report', 'reply', 'judgement', 'banAppeal'])
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'timeline.bad', message: validateErr.array()});
        const skip = req.query.skip!=undefined? req.query.skip : 0;
        const limit = req.query.limit!=undefined? req.query.limit : 20;
        const dbId = await getPlayerId({dbId: req.query.dbId, userId: req.query.userId, personaId: req.query.personaId});
        const order = req.query.order? req.query.order : 'asc';
        const subject = req.query.subject? req.query.subject : '%';
        if(dbId==-1)
            return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});

        const total = await db.count({num: 1}).from('comments').where({toPlayerId: dbId, valid: 1})
                            .andWhere('type', 'like', subject).first().then(r=>r.num);
        /** @type {import("../typedef.js").Comment[]} */
        const result = await db('comments').join('users', 'comments.byUserId', 'users.id')
                            .select('comments.*', 'users.username', 'users.privilege').where({toPlayerId: dbId, 'comments.valid': 1})
                            .andWhere('comments.type', 'like', subject).orderBy('comments.createTime', order).offset(skip).limit(limit);
        result.forEach(i=>{     // delete those unused keys
            for(let j of Object.keys(i))
                if(typeof(i[j])=='undefined' || i[j]==null)
                    delete i[j];
            delete i.valid;
        });

        res.status(200).json({success: 1, code: 'timeline.ok', data: { result, total } });
    } catch(err) {
        next(err);
    }
});


router.post('/reply', verifyJWT, forbidPrivileges(['freezed','blacklisted']),
    commentRateLimiter.limiter([{roles: ['admin','super','root','dev','bot'], value: 0}]), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.toCommentId').optional({nullable: true}).isInt({min: 1}),
    checkbody('data.content').isString().trim().isLength({min: 1, max:5000}),
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'reply.bad', message: validateErr.array()});
        
        const dbId = req.body.data.toPlayerId;
        const toCommentId = req.body.data.toCommentId;
        /** @type {import("../typedef.js").Player} */
        const player = await db.select('*').from('players').where({id: dbId}).first();
        if(!player) // no such player
            return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such player'});
        if(await db.select('toPlayerId').from('comments').where({id: toCommentId}).first().then(r=>r? r.toPlayerId : -1) != dbId)
            return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such comment'});
        
        const reply = {
            type: 'reply',
            toPlayerId: dbId,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            byUserId: req.user.id,
            toCommentId: toCommentId? toCommentId : null,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };

        const insertId = (await db('comments').insert(reply) )[0];
        reply.id = insertId;
        await db('players').update({
            updateTime: new Date(), 
        }).increment('commentsNum', 1).where({id: dbId});

        siteEvent.emit('action', {method: 'reply', params: {reply}});
        return res.status(201).json({success: 1, code: 'reply.suceess', message: 'Reply success.'});
    } catch(err) {
        next(err);
    }
});

router.post('/update', verifyJWT, forbidPrivileges(['freezed','blacklisted']), 
    commentRateLimiter.limiter([{roles: ['admin','super','root','dev','bot'], value: 0}]), [
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('dbId').optional().isInt({min: 0}), 
    checkquery('blockAvatar').optional().isIn(['true', 'false'])
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'update.bad', message: validateErr.array()});
        let key = '', val='';
        switch(true) {
        case !!req.query.userId:
            key = 'originUserId'; val = req.query.userId; break;
        case !!req.query.personaId:
            key = 'originPersonaId'; val = req.query.personaId; break;
        case !!req.query.dbId:
            key = 'id'; val = req.query.dbId; break;
        default:
            return res.status(400).json({error: 1, code: 'update.bad', message: 'Must specify one param from "originUserId","originPersonaId","dbId"'});
        }
        /** @type {import("../typedef.js").Player} */
        const tmp = await db.select('*').from('players').where(key, '=', val).first();
        if(!tmp)
            return res.status(404).json({error: 1, code: 'update.notFound', message: 'no such player'});
        const originUserId = tmp.originUserId;
        const client = originClients.getOne();
        const profile = await client.getInfoByUserId(originUserId);
        let avatarLink = tmp.avatarLink;
        if(userHasRoles(req.user, ['admin','super','root','dev']) && req.query.blockAvatar) {
            if(req.query.blockAvatar=='true')
                avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG#BLOCKED';
            else
                avatarLink = await client.getUserAvatar(originUserId);
        } else if (!tmp.avatarLink.endsWith('#BLOCKED'))
            avatarLink = await client.getUserAvatar(originUserId);
        
        await db('players').update({originName: profile.username, avatarLink: avatarLink}).where({originUserId: originUserId});
        await pushOriginNameLog(profile.username, originUserId, profile.personaId);

        siteEvent.emit('action', {method: 'playerUpdate', params: {profile}});
        return res.status(200).json({success: 1, code:'update.success', data: {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
        }});
    } catch(err) {
        next(err);
    }
});

router.post('/judgement', verifyJWT, allowPrivileges(['admin','super','root']), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.cheatMethods').optional().isArray().custom(cheatMethodsSanitizer), // if no kill or guilt judgment is made, this field is not required
    checkbody('data.action').isIn(['suspect','innocent','discuss','guilt','kill','trash']),
    checkbody('data.content').isString().trim().isLength({min: 1, max: 65535}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'judgement.bad', message: validateErr.array()});
        if((req.body.data.action=='kill'||req.body.data.action=='guilt') && !req.body.data.cheatMethods)
            return res.status(400).json({error: 1, code: 'judgement.bad', message: 'must specify one cheate method.'});
        if(req.body.data.action=='kill' && !userHasRoles(req.user, ['super','root']))
            return res.status(403).json({error: 1, code: 'judgement.permissionDenied', message: 'permission denied.'});

        /** @type {import("../typedef.js").Player} */    
        const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
        if(!player)
            return res.status(404).json({error: 1, code: 'judgement.notFound', message: 'no such player.'});
        // auth complete, player found, store action into db
        const judgement = {
            type: 'judgement',
            byUserId: req.user.id, 
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            cheatMethods: req.body.data.cheatMethods? JSON.stringify(req.body.data.cheatMethods) : '[]',
            judgeAction: req.body.data.action,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        const insertId = (await db('comments').insert(judgement) )[0];
        judgement.id = insertId;
        const nextstate = await stateMachine(player, req.user, req.body.data.action);
        const stateChange = {prev: player.status, next: nextstate};
        player.status = nextstate;
        player.cheatMethods = nextstate==1? JSON.stringify(req.body.data.cheatMethods) : '[]';
        player.updateTime = new Date();
        player.commentsNum += 1;
        await db('players').update(player).where({id: player.id});

        judgement.cheatMethods = req.body.data.cheatMethods? req.body.data.cheatMethods : [];
        player.cheatMethods = nextstate==1? req.body.data.cheatMethods : [];

        siteEvent.emit('action', {method: 'judge', params: {judgement, player, stateChange}});
        return res.status(201).json({success: 1, code: 'judgement.success', message: 'thank you.'});
    } catch(err) {
        next(err);
    }
});

router.post('/banAppeal', verifyJWT, forbidPrivileges(['freezed','blacklisted']),
    commentRateLimiter.limiter([{roles: ['admin','super','root','dev','bot'], value: 0}]), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.content').isString().trim().isLength({min: 1, max: 65535}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'banAppeal.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").Player} */
        const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
        if(!player)
            return res.status(404).json({error: 1, code: 'banAppeal.notFound', message: 'no such player'});
        if(player.status!=1 && player.status!=2)
            return res.status(400).json({error: 1, code: 'banAppeal.noNeed', message: 'no need for ban appeal'});
        /** @type {import("../typedef.js").Comment} */
        const prev = await db.select('*').from('comments').where({toPlayerId: req.body.data.toPlayerId, type: 'banAppeal'}).orderBy('createTime', 'desc').first();
        if(prev && prev.status=='lock')
            return res.status(403).json({error: 1, code: 'banAppeal.locked', message: 'this thread is locked'});    
        const banAppeal = {
            type: 'banAppeal',
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            toOriginPersonaId: player.originPersonaId,
            byUserId: req.user.id,
            content: handleRichTextInput(req.body.data.content),
            viewedAdmins: '[]',
            appealStatus: 'open',
            valid: 1,
            createTime: new Date()
        };
        const insertId = (await db('comments').insert(banAppeal) )[0];
        banAppeal.id = insertId;
        banAppeal.viewedAdmins = [];

        siteEvent.emit('action', {method: 'banAppeal', params: {banAppeal}});
        return res.status(201).json({success: 1, code: 'banAppeal.success', message:'please wait.'})
    } catch(err) {
        next(err);
    }
});

router.post('/viewBanAppeal', verifyJWT, allowPrivileges(['admin','super','root']), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.status').optional().isIn(['open','close','lock'])
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'banAppeal.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").Comment} */
        const banAppeal = await db.select('*').from('comments').where({id: req.body.data.id, type: 'banAppeal'}).first();
        if(!banAppeal)
            return res.status(404).json({success: 1, code: 'banAppeal.notFound', message: 'no such ban appeal'});
        const viewedAdmins = new Set(banAppeal.viewedAdmins);
        viewedAdmins.add(req.user.id);
        
        if(req.body.data.status)
            banAppeal.appealStatus = req.body.data.status;
        banAppeal.viewedAdmins = JSON.stringify(Array.from(viewedAdmins).slice(0, config.personsToReview+1));
        await db('comments').update(banAppeal).where({id: banAppeal.id});
        banAppeal.viewedAdmins = Array.from(viewedAdmins).slice(0, config.personsToReview+1);

        if(viewedAdmins.size >= config.personsToReview)
            siteEvent.emit('action', {method: 'viewBanAppeal', params: {banAppeal: banAppeal}});
        return res.status(200).json({success: 1, code: 'viewBanAppeal.success', message: 'thank you'});
    } catch(err) {
        next(err);
    }
});

/** @param {string} originName @param {string} originUserId @param {string} originPersonaId */
async function pushOriginNameLog(originName, originUserId, originPersonaId) {
    const last = await db.select('*').from('name_logs').where({originUserId: originUserId}).orderBy('toTime', 'desc').first();
    if(last && last.originName==originName) {
        await db('name_logs').update({toTime: new Date}).where({id: last.id});
        return false;
    }
    else {
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

export default router;
export {
    commentRateLimiter,
};