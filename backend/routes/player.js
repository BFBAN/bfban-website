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

const router = express.Router()

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

        const result = (await db.select('id','originName','originUserId','originPersonaId','games',
        'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
        .from('players').where(key, '=', val))[0];
        if(!result)
            return res.status(404).json({error: 1, code: 'player.notFound'});
        if(req.query.history) // that guy does exist
            result.history =  await db.select('originName','fromTime','toTime').from('name_logs').where({originUserId: result.originUserId});
        
        res.status(200).json({success: 1, code: 'player.ok', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/report', verifyJWT, verifyCaptcha,
    forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.game').isIn(config.supportGames),
    checkbody('data.originName').isAscii().notEmpty(),
    checkbody('data.cheatMethods').isString().notEmpty().custom(cheatMethodsSanitizer),
    checkbody('data.videoLink').optional({checkFalsy: true}).isURL(),
    checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'report.bad', message:validateErr.array()});
        
        const isdone = {                                    // what we are doing here:
            successFlag: false, racer: new Set(),          // because origin api isnt good enough, 
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
            console.log(err);   // DEBUG
            console.log(isdone.failMessages);
            return undefined; 
        });
        if(!profile)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user not found.'});
        isdone.event.emit('done');  // terminate the unterminated promise (if exist)
        isdone.event.removeAllListeners();  // destory

        // now the user being reported is found
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = (await db.select('*').from('players').where({originUserId: profile.userId}))[0];
        const updateCol = { originName: profile.username };
        let avatarLink = '';
        let stateChange = {prev: null, next: 0};
        try {   // get/update avatar each report
            const client = originClients.getOne();
            avatarLink = await client.getUserAvatar(profile.userId); // this step is not such important, set avatar to default if it fail
        } catch(err) {
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        if(reported) { // reported, re-evaluate status
            const nextstate = await stateMachine(reported, req.user, 'report');
            stateChange = {prev: reported.status, next: nextstate};
            updateCol.avatarLink = avatarLink;
            updateCol.commentsNum = reported.commentsNum+1;
            updateCol.games = Array.from(new Set(reported.games.split(',')).add(req.body.data.game)).join(',');
            updateCol.status = nextstate;
            updateCol.updateTime = new Date();
        }
        const player = {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: req.body.data.game,
            cheatMethods: '', // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: 0,
            commentsNum: 1,
            valid: 1,
            status: 0, // none
            createTime: new Date(),
            updateTime: new Date()
        };
        let playerId = 0;
        if(reported) {// update, return number
            await db('players').update(updateCol).where({id: reported.id});
            playerId = reported.id;
        }
        else // insert, return [number]
            playerId = (await db('players').insert(player) )[0];
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write action to db
        const report = {
            byUserId: req.user.id, 
            toPlayerId: playerId, // update may return 0 if nothing change, but we have reported then
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            toOriginPersonaId: profile.personaId,
            game: req.body.data.game,
            cheatMethods: req.body.data.cheatMethods,
            videoLink: req.body.data.videoLink,
            description: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('reports').insert(report);
        player.id = playerId;
        
        siteEvent.emit('data', {method: 'report', params: {report, player, stateChange}});
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
checkbody('data.cheatMethods').isString().notEmpty().custom(cheatMethodsSanitizer),
checkbody('data.videoLink').optional({checkFalsy: true}).isURL(),
checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'reportById.bad', message:validateErr.array()});
        
        if(req.query.originPersonaId && !req.query.originUserId)
            return res.status(500).json({error:1, code:'reportById.notSupportYet', message: 'not support yet'});
        const originUserId = req.query.originUserId
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
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = (await db.select('*').from('players').where({originUserId: profile.userId}))[0];
        const updateCol = { originName: profile.username };
        let avatarLink = '';
        let stateChange = {prev: null, next: 0};
        try {   // get/update avatar each report
            const client = originClients.getOne();
            avatarLink = await client.getUserAvatar(profile.userId); // this step is not such important, set avatar to default if it fail
        } catch(err) {
            avatarLink = 'https://secure.download.dm.origin.com/production/avatar/prod/1/599/208x208.JPEG';
        }
        if(reported) { // reported, re-evaluate status
            const nextstate = await stateMachine(reported, req.user, 'report');
            stateChange = {prev: reported.status, next: nextstate};
            updateCol.avatarLink = avatarLink;
            updateCol.commentsNum = reported.commentsNum+1;
            updateCol.games = Array.from(new Set(reported.games.split(',')).add(req.body.data.game)).join(',');
            updateCol.status = nextstate;
            updateCol.updateTime = new Date();
        }
        const player = {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: req.body.data.game,
            cheatMethods: '', // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: 0,
            commentsNum: 1,
            valid: 1,
            status: 0, // none
            createTime: new Date(),
            updateTime: new Date()
        };
        let playerId = 0;
        if(reported) // update, return number
            playerId = await db('players').update(updateCol).where({id: reported.id});
        else // insert, return [number]
            playerId = (await db('players').insert(player) )[0];
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write action to db
        const report = {
            byUserId: req.user.id, 
            toPlayerId: playerId, // update may return 0 if nothing change, but we have reported then
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            toOriginPersonaId: profile.personaId,
            game: req.body.data.game,
            cheatMethods: req.body.data.cheatMethods,
            videoLink: req.body.data.videoLink,
            description: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('reports').insert(report);
        player.id = playerId;
        
        siteEvent.emit('data', {method: 'report', params: {report, player, stateChange}});
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
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'timeline.bad', message: validateErr.array()});
        let dbId = 0;
        switch(true) {
        case !!req.query.dbId: // check if it is exist
            if((await db.select('id').from('players').where({id:req.query.dbId})).length > 0)
                dbId = parseInt(req.query.dbId);
            else
                return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});
            break;
        case !!req.query.userId: {
            const tmp = (await db.select('id').from('players').where({originUserId:req.query.userId}))[0];
            if(!tmp)
                return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});
            dbId = tmp.id;
            break;
        }
        case !!req.query.personaId: {
            const tmp = (await db.select('id').from('players').where({originPersonaId:req.query.personaId}))[0];
            if(!tmp)
                return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});
            dbId = tmp.id;
            break;
        }
        default:
            return res.status(400).json({error: 1, code: 'timeline.bad', message: 'Must specify one param from "originUserId","originPersonaId","dbId"'});
        }
        const reports = await db.select('id','byUserId','toOriginName','game','cheatMethods','videoLink','description','createTime')
        .from('reports').where({toPlayerId: dbId, valid: 1});
        const judgements = await db.select('id','byUserId','cheatMethods','action','content','createTime')
        .from('judgements').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');
        const comments = await db.select('id','byuserId','toCommentType','toCommentId','content','createTime')
        .from('replies').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');
        const ban_appeals = await db.select('id','byUserId','content','viewedAdminIds','status','createTime')
        .from('ban_appeals').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');

        res.status(200).json({success: 1, code: 'timeline.ok', data: {
            reports,
            judgements,
            comments,
            ban_appeals
        }});
    } catch(err) {
        next(err);
    }
});

router.post('/reply', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.toCommentType').optional({nullable: true}).isIn([0,1,2,3]), // 0-reply 1-report 2-judgement 3-banAppeal
    checkbody('data.toCommentId').optional({nullable: true}).isInt({min: 0}),
    checkbody('data.content').isString().trim().isLength({min: 1, max:5000}),
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'reply.bad', message: validateErr.array()});
        
        if(req.body.data.toCommentType && req.body.data.toCommentId) { // reply to a comment, check that comment exist
            const dbname = ['replies', 'reports', 'judgements', 'ban_appeals'][req.body.data.toCommentType];
            const tmp = (await db.select('toPlayerId').from(dbname).where({id: req.body.data.toCommentId}))[0].toPlayerId;
            if(tmp != req.body.data.toPlayerId) // the comment and the ongoing reply is not under the same player
                return res.status(404).json({error: 1, code: 'reply.bad', message: 'no such comment'});
        }
        if( (await db.select('id').from('players').where({id: req.body.data.toPlayerId}))[0] == undefined ) // no such player
            return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such player'});
        const reply = {
            toPlayerId: req.body.data.toPlayerId,
            byUserId: req.user.id,
            toCommentType: req.body.data.toCommentType? req.body.data.toCommentType : null,
            toCommentId: req.body.data.toCommentId? req.body.data.toCommentId : null,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        await db('replies').insert(reply);
        await db('players').update({
            updateTime: new Date(), 
        }).increment('commentsNum', 1).where({id: req.body.data.toPlayerId});
        
        siteEvent.emit('data', {method: 'reply', params: {reply}});
        return res.status(201).json({success: 1, code: 'reply.suceess', message: 'Reply success.'});
    } catch(err) {
        next(err);
    }
});

router.post('/update', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('dbId').optional().isInt({min: 0}), 
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
        
        const tmp = (await db.select('originUserId').from('players').where(key, '=', val))[0];
        if(!tmp)
            return res.status(404).json({error: 1, code: 'update.notFound', message: 'no such player'});
        const originUserId = tmp.originUserId;
        const client = originClients.getOne();
        const profile = await client.getInfoByUserId(originUserId);
        const avatarLink = await client.getUserAvatar(originUserId);
        await db('players').update({originName: profile.username, avatarLink: avatarLink}).where({originUserId: originUserId});
        await pushOriginNameLog(profile.username, originUserId, profile.personaId);

        siteEvent.emit('data', {method: 'playerUpdate', params: {profile}});
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
    checkbody('data.cheatMethods').optional().isString().custom(cheatMethodsSanitizer), // if no kill or guilt judgment is made, this field is not required
    checkbody('data.action').isIn(['suspect','innocent','dicuss','guilt','kill']),
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

        /** @type {import("../typedef.js").Player|undefined} */    
        const player = (await db.select('*').from('players').where({id: req.body.data.toPlayerId}))[0];
        if(!player)
            return res.status(404).json({error: 1, code: 'judgement.notFound', message: 'no such player.'});
        // auth complete, player found, store action into db
        const judgement = {
            byUserId: req.user.id, 
            toPlayerId: player.id,
            toOriginUserId: player.originUserId,
            cheatMethods: req.body.data.cheatMethods? req.body.data.cheatMethods : null,
            action: req.body.data.action,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        await db('judgements').insert(judgement);
        const nextstate = await stateMachine(player, req.user, req.body.data.action);
        const stateChange = {prev: player.status, next: nextstate};
        player.status = nextstate;
        player.cheatMethods = nextstate==1? req.body.data.cheatMethods : player.cheatMethods;
        player.updateTime = new Date();
        await db('players').update(player).increment('commentsNum', 1).where({id: player.id});

        siteEvent.emit('data', {method: 'judge', params: {judgement, player, stateChange}});
        return res.status(200).json({success: 1, code: 'judgement.success', message: 'thank you.'});
    } catch(err) {
        next(err);
    }
});

router.post('/banAppeal', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.content').isString().trim().isLength({min: 1, max: 65535}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'banappeal.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").Player|undefined} */
        const player = (await db.select('*').from('players').where({id: req.body.data.toPlayerId}))[0];
        if(!player)
            return res.status(404).json({success: 1, code: 'banappeal.notFound', message: 'no such player'});

        const ban_appeal = {
            toPlayerId: player.id,
            byUserId: req.user.id,
            content: handleRichTextInput(req.body.data.content),
            viewedAdminIds: '',
            status: 'open',
            valid: 1,
            createTime: new Date()
        };
        await db('ban_appeals').insert(ban_appeal);

        siteEvent.emit('data', {method: 'banappeal', params: {ban_appeal}});
        return res.status(200).json({success: 1, code: 'banappeal.success', message:'thank you.'})
    } catch(err) {
        next(err);
    }
});

router.post('/viewBanAppeal', verifyJWT, allowPrivileges(['admin','super','root']), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.status').isIn(['open','pending','close'])
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'banappeal.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").BanAppeal} */
        const ban_appeal = (await db.select('*').from('ban_appeals').where({id: req.body.data.id}) )[0];
        if(!ban_appeal)
            return res.status(404).json({success: 1, code: 'banappeal.notFound', message: 'no such ban appeal'});
        const viewedAdminIds = new Set(ban_appeal.viewedAdminIds.split(','));
        viewedAdminIds.add(req.user.id);
        
        ban_appeal.status = req.body.data.status;
        ban_appeal.viewedAdminIds = Array.from(viewedAdminIds).slice(0,3).join(',');

        await db('ban_appeals').update(ban_appeal).where({id: ban_appeal.id});

        if(viewedAdminIds.size >= 3)
            siteEvent.emit('data', {method: 'viewBanAppeal', params: {ban_appeal}});
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
        
        siteEvent.emit('data', {method: 'name_tracker', params: {name_log}});
        return true;
    }
}

export default router;