"use strict";
import express from "express";
import { check, body as checkbody, query as checkquery, validationResult, oneOf as checkOneof } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { originClients } from "../lib/origin.js"
import { cheateMethodsSanitizer, handleRichTextInput } from "../lib/user.js";
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
        if(req.query.history) // that guy does exsist
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
    checkbody('data.cheateMethods').isString().notEmpty().custom(cheateMethodsSanitizer),
    checkbody('data.videolink').optional({checkFalsy: true}).isURL(),
    checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'report.bad', message:validateErr.array()});
        
        const client = originClients.getOne();
        const originUserId = await client.searchUserName(req.body.data.originName); // be aware, this origin name is not case-sesitive
        if(!originUserId)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user not found.'});
        const profile = await client.getInfoByUserId(originUserId); // use it for later db operations
        if(profile.username.toLowerCase() !== req.body.data.originName.toLowerCase())
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user mismatch.'});
        // now the user being reported is found
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = (await db.select('*').from('players').where({originUserId: originUserId}))[0];
        const updateCol = { originName: profile.username };
        let avatarLink = '';
        if(reported) { // reported, re-evaluate status
            const nextstate = await stateMachine(reported, req.user, 'report');
            updateCol.commentsNum = reported.commentsNum+1;
            updateCol.games = reported.games.split(',').includes(req.body.data.game)? reported.games+','+req.body.data.game : reported.games;
            if(nextstate != reported.status)
                updateCol.status = nextstate; 
        } else { // not reported yet, fetch more info
            avatarLink = await client.getUserAvatar(originUserId); // this step is not such important, add a catch to ignore error?
        }
        const player = {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: req.body.data.game,
            cheateMethods: '', // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: 0,
            commentsNum: 1,
            valid: 1,
            status: 0, // none
            createTime: new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('originUserId').merge(updateCol); // insert on update
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write action to db
        const report = {
            byUserId: req.user.id, 
            toPlayerId: reported? reported.id : playerId, // update may return 0 if nothing change, but we have reported then
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            game: req.body.data.game,
            cheateMethods: req.body.data.cheateMethods,
            videoLink: req.body.data.videoLink,
            description: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('reports').insert(report);

        siteEvent.emit('data', {method: 'report', params: {report, player}});
        return res.status(201).json({success: 1, code:'report.success', message:'Thank you.'});
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
checkbody('data.cheateMethods').isString().notEmpty().custom(cheateMethodsSanitizer),
checkbody('data.videolink').optional({checkFalsy: true}).isURL(),
checkbody('data.description').isString().trim().isLength({min: 1, max: 65535}),  
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
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
        const reported = (await db.select('*').from('players').where({originUserId: originUserId}))[0];
        const updateCol = { originName: profile.username };
        let avatarLink = '';
        if(reported) { // reported, re-evaluate status
            const nextstate = await stateMachine(reported, req.user, 'report');
            updateCol.commentsNum = reported.commentsNum+1;
            updateCol.games = reported.games.split(',').includes(req.body.data.game)? reported.games+','+req.body.data.game : reported.games;
            if(nextstate != reported.status)
                updateCol.status = nextstate; 
        } else { // not reported yet, fetch more info
            avatarLink = await client.getUserAvatar(originUserId); // this step is not such important, add a catch to ignore error?
        }
        const player = {
            originName: profile.username,
            originUserId: profile.userId,
            originPersonaId: profile.personaId,
            games: req.body.data.game,
            cheateMethods: '', // cheateMethod should be decided by admin
            avatarLink: avatarLink,
            viewNum: 0,
            commentsNum: 1,
            valid: 1,
            status: 0, // none
            createTime: new Date(),
            updateTime: new Date()
        };
        const playerId = await db('players').insert(player).onConflict('originUserId').merge(updateCol); // insert on update
        await pushOriginNameLog(profile.username, profile.userId, profile.personaId);
        // write action to db
        const report = {
            byUserId: req.user.id, 
            toPlayerId: reported? reported.id : playerId, // update may return 0 if nothing change, but we have reported then
            toOriginName: profile.username,
            toOriginUserId: profile.userId,
            game: req.body.data.game,
            cheateMethods: req.body.data.cheateMethods,
            videoLink: req.body.data.videoLink,
            description: handleRichTextInput(req.body.data.description),
            valid: 1,
            createTime: new Date()
        };
        await db('reports').insert(report);

        siteEvent.emit('data', {method: 'report', params: {report, player}});
        return res.status(201).json({success: 1, code:'reportById.success', message:'Thank you.'});
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
        switch(ture) {
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
        .from('reports').where({toPlayerId: req.query.dbId, valid: 1});
        const judgements = await db.select('id','byUserId','cheatMethods','action','content','createTime')
        .from('judgements').where({toPlayerId: req.query.dbID, valid: 1}).orderBy('createTime', 'desc');
        const comments = await db.select('id','byuserId','toCommentType','toCommentId','content','createTime')
        .from('replies').where({toPlayerId: req.query.dbID, valid: 1}).orderBy('createTime', 'desc');
        const ban_appeals = await db.select('id','byUserId','content','viewedAdminIds','status','createTime')
        .from('ban_appeals').where({toPlayerId: req.query.dbID, valid: 1}).orderBy('createTime', 'desc');

        res.status(200).json({success: 1, code: 'timeline.success', data: {
            reports,
            judgements,
            comments,
            ban_appeals
        }});
    } catch(err) {
        next(err);
    }
});

router.post('/comment', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.toCommentType').optional({nullable: true}).isIn([0,1,2,3]), // 0-reply 1-report 2-judgement 3-banappela
    checkbody('data.toCommentId').optional({nullable: true}).isInt({min: 0}),
    checkbody('data.content').isString().trim().isLength({min: 1, max:65535}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'comment.bad', message: validateErr.array()});
        
        if(req.body.data.toCommentType && req.body.data.toCommentId) { // check that comment exist
            const dbname = ['replies', 'reports', 'judgements', 'ban_appeals'];
            const tmp = (await db.select('toPlayerId').from(dbname).where({id: req.body.data.toCommentId}))[0].toPlayerId;
            if(tmp != req.body.data.toPlayerId)
            return res.status(404).json({error: 1, code: 'comment.bad', message: 'no such comment'});
        }
        if( (await db.select('id').from('players').where({id: req.body.data.toPlayerId}))[0] == undefined ) // no such player
            return res.status(404).json({error: 1, code: 'comment.notFound', message: 'no such player'});
        const comment = {
            toPlayerId: req.body.data.toPlayerId,
            byUserId: req.user.id,
            toCommentType: req.body.data.toCommentType? req.body.data.toCommentType : null,
            toCommentId: req.body.data.toCommentId? req.body.data.toCommentId : null,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        await db('repiles').insert(comment);
        await db('players').update({
            updateTime: new Date(), 
        }).increment('commentsNum', 1).where({id: req.body.data.toPlayerId});
        
        siteEvent.emit('data', {method: 'comment', params: {comment}});
        return res.status(201).json({success: 1, code: 'comment.suceess', message: 'Reply success.'});
    } catch(err) {
        next(err);
    }
});

router.post('/update', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('dbId').optional().isInt({min: 0}), 
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
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
    checkbody('data.cheatMethods').optional().isString().custom(cheateMethodsSanitizer), // if no kill or guilt judgment is made, this field is not required
    checkbody('data.action').isIn(['suspect','innocent','dicuss','guilt','kill']),
    checkbody('data.content').isString().trim().isLength({min: 1, max: 65535}),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'judgement.bad', message: validateErr.array()});
        if((req.body.data.action=='kill'||req.body.data.action=='guilt') && !req.body.data.cheateMethods)
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
            cheateMethods: req.body.data.cheateMethods? req.body.data.cheateMethods : null,
            action: req.body.data.action,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        await db('judgements').insert(judgement);
        const nextstate = await stateMachine(player, req.user, req.body.data.action);
        player.status = nextstate;
        player.cheateMethods = nextstate==1? req.body.data.cheateMethods : player.cheateMethods;
        player.updateTime = new Date();
        await db('players').update(player).increment('commentsNum', 1).where({id: player.id});

        siteEvent.emit('data', {method: 'judge', params: {judgement, player}});
        return res.status(200).json({success: 1, code: 'judgement.success', message: 'thank you.'});
    } catch(err) {
        next(err);
    }
});

router.post('/banappeal', verifyJWT, forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.content').isString().trim().isLength({min: 1, max: 65535}),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'banappeal.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").Player|undefined} */
        const player = (await db.select('*').from('players').where({id: req.body.data.toPlayerId}))[0];
        if(!player)
            return res.status(404).json({success: 1, code: 'banappe.notFound', message: 'no such player'});

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

/** @param {string} originName @param {string} originUserId @param {string} originPersonaId */
async function pushOriginNameLog(originName, originUserId, originPersonaId) {
    const last = (await db.select('*').from('name_logs').where({originUserId: originUserId}).orderBy('toTime', 'desc').first())[0];
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