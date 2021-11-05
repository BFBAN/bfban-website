"use strict";
import EventEmitter from "events";
import express from "express";

const router = express.Router()

/** @param {{dbId:number, userId: string, personaId: string}} @returns {Promise<number>} dbId */
async function getPlayerId({dbId, userId, personaId}) {
    const key = dbId ? 'id' : (userId ? 'originuserId' : (personaId ? 'originPersonaId' : undefined));
    const val = dbId ? dbId : (userId ? userId : (personaId ? personaId : undefined));
    if (!key || !val)
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
        result.games = JSON.parse(result.games);
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
            //console.log(err);   // DEBUG
            //console.log(isdone.failMessages);
            return undefined; 
        });
        if(!profile)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user not found.'});
        isdone.event.emit('done');  // terminate the unterminated promise (if exist)
        isdone.event.removeAllListeners();  // destory

        // now the user being reported is found
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
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
            updateCol.games =JSON.stringify(
                new Set(JSON.parse(reported.games)).add(req.body.data.game)
            );  // Set(['bf1','bfv']).add('bfv')->"#bf1#,#bfv#"
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
checkbody('data.cheatMethods').isString().notEmpty().custom(cheatMethodsSanitizer),
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
        /** @type {import('../typedef.js').Player|undefined} */
        const reported = await db.select('*').from('players').where({originUserId: profile.userId}).first();
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
            updateCol.games = JSON.stringify(
                new Set(JSON.parse(reported.games)).add(req.body.data.game)
            );
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
        const reportId = (await db('reports').insert(report) )[0];
        report.id = reportId;
        player.id = playerId;
        
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

router.get('/timeline_deprecated', [
    checkquery('dbId').optional().isInt({min: 0}),
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'timeline.bad', message: validateErr.array()});
        let dbId = await getPlayerId({dbId: req.query.dbId, userId: req.query.userId, personaId: req.query.personaId});
        if(dbId==-1)
            return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});
        
        const reports = await db.select('id','byUserId','toOriginName','game','cheatMethods','videoLink','description','createTime')
        .from('reports').where({toPlayerId: dbId, valid: 1});
        const judgements = await db.select('id','byUserId','cheatMethods','action','content','createTime')
        .from('judgements').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');
        const repiles = await db.select('id','byuserId','toFloor','content','createTime')
        .from('replies').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');
        const ban_appeals = await db.select('id','byUserId','content','viewedAdminIds','status','createTime')
        .from('ban_appeals').where({toPlayerId: dbId, valid: 1}).orderBy('createTime', 'desc');

        res.status(200).json({success: 1, code: 'timeline.ok', data: {
            reports,
            judgements,
            repiles,
            ban_appeals
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
    checkquery('subject').optional().isIn(['report', 'reply', 'judgement', 'ban_appeal'])
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'timeline.bad', message: validateErr.array()});
        const skip = req.query.skip!=undefined? req.query.skip : 0;
        const limit = req.query.limit!=undefined? req.query.limit : 20;
        const dbId = await getPlayerId({dbId: req.query.dbId, userId: req.query.userId, personaId: req.query.personaId});
        const subject = req.query.subject;
        if(dbId==-1)
            return res.status(404).json({error: 1, code: 'timeline.notFound', message: 'no such timeline'});

        /** @type {{id:number, createTime: Date, type: 'reply'|'report'|'judgement'|'ban_appeal'}[]} */
        let brief = {};
        if(!subject)
            brief = await db.select('id', 'createTime', db.raw('"reply" as "type"')).from('replies').where({toPlayerId: dbId}).union([
                db.select('id', 'createTime', db.raw('"report" as "type"')).from('reports').where({toPlayerId: dbId}),
                db.select('id', 'createTime', db.raw('"judgement" as "type"')).from('judgements').where({toPlayerId: dbId}),
                db.select('id', 'createTime', db.raw('"ban_appeal" as "type"')).from('ban_appeals').where({toPlayerId: dbId})
            ]).orderBy('createTime', 'asc').offset(skip).limit(limit);
        else
            brief = await db.select('id', 'createTime', db.raw(`"${subject}" as "type"`)).from(
                subject.endsWith('y')? 'replies':subject+'s'    // word->words
            ).where({toPlayerId: dbId});
        let totals = [];
        if(!subject)
            totals = await db.count({num: 'id'}).from('replies').where({toPlayerId: dbId}).union([
                db.count({num: 'id'}).from('reports').where({toPlayerId: dbId}),
                db.count({num: 'id'}).from('judgements').where({toPlayerId: dbId}),
                db.count({num: 'id'}).from('ban_appeals').where({toPlayerId: dbId})
            ]);
        else
            totals = await db.count({num: 'id'}).from(
                subject.endsWith('y')? 'replies':subject+'s'
            ).where({toPlayerId: dbId});
        //console.log(totals);
        const total = totals.reduce((accu, curr)=> {return accu+curr.num}, 0);
        //console.log(total);
        // generate a brief timeline for queries below
        const subQueries = brief.reduce((accu, curr, indx)=>{
            accu[curr.type].push(curr.id);  // group by type
            return accu;
        }, {reply:[], report:[], judgement:[], ban_appeal:[]} );
        // do the final query
        const result = await Promise.all([  // here, we fetch the comments in the *only* page we need
            subQueries.reply.length>0? db('replies').join('users', 'replies.byUserId', 'users.id')
            .select('replies.id','replies.byUserId','replies.toFloor','replies.content',
            'replies.createTime', 'users.username', 'users.privilege',db.raw('"reply" as "type"'))
            .whereIn('replies.id',subQueries.reply) : [],
            
            subQueries.report.length>0? db('reports').join('users', 'reports.byUserId', 'users.id')
            .select('reports.id','reports.byUserId','reports.toOriginName','reports.game','reports.cheatMethods',
            'reports.videoLink','reports.description','reports.createTime', 'users.username', 'users.privilege', db.raw('"report" as "type"'))
            .whereIn('reports.id', subQueries.report) : [],
            
            subQueries.judgement.length>0? db('judgements').join('users', 'judgements.byUserId', 'users.id')
            .select('judgements.id','judgements.byUserId','judgements.cheatMethods','judgements.action',
            'judgements.content','judgements.createTime', 'users.username', 'users.privilege', db.raw('"judgement" as "type"'))
            .whereIn('judgements.id', subQueries.judgement) : [],

            subQueries.ban_appeal.length>0? db('ban_appeals').join('users', 'ban_appeals.byUserId', 'users.id')
            .select('ban_appeals.id','ban_appeals.byUserId','ban_appeals.content','ban_appeals.viewedAdminIds',
            'ban_appeals.status','ban_appeals.createTime', 'users.username', 'users.privilege', db.raw('"ban_appeal" as "type"'))
            .whereIn('ban_appeals.id', subQueries.ban_appeal) : [],
        ]).then(r=> r.flat().sort((a, b)=> a.createTime - b.createTime).forEach(i=>i.privilege = JSON.parse(i.privilege)) ); // re-sort the result

        res.status(200).json({success: 1, code: 'timeline.ok', data: { result, total } });
    } catch(err) {
        next(err);
    }
});

const commentRateLimiter = new UserRateLimiter(600*1000, 10); // 10 comments per 10 minutes(allow brust comment)

router.post('/reply', verifyJWT, forbidPrivileges(['freezed','blacklisted']),
    commentRateLimiter.limiter([{roles: ['admin','super','root','dev','bot'], value: 0}]), [
    checkbody('data.toPlayerId').isInt({min: 0}),
    checkbody('data.toFloor').optional({nullable: true}).isInt({min: 1}),
    checkbody('data.content').isString().trim().isLength({min: 1, max:5000}),
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'reply.bad', message: validateErr.array()});
        
        if(await db.select('id').from('players').where({id: req.body.data.toPlayerId}).first() == undefined) // no such player
            return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such player'});
        const dbId = req.body.data.toPlayerId;
        let toCommentType=null, toCommentId=null;
        if(req.body.data.toFloor) { // reply to a comment, check that comment exist
            /** @type {{id:number, createTime: Date, type: 'replies'|'reports'|'judgements'|'ban_appeals'}} */
            const brief = await db.select('id', 'createTime', db.raw('"replies" as "type"')).from('replies').where({toPlayerId: dbId}).union([
            db.select('id', 'createTime', db.raw('"reports" as "type"')).from('reports').where({toPlayerId: dbId}),
            db.select('id', 'createTime', db.raw('"judgements" as "type"')).from('judgements').where({toPlayerId: dbId}),
            db.select('id', 'createTime', db.raw('"ban_appeals" as "type"')).from('ban_appeals').where({toPlayerId: dbId})
            ]).orderBy('createTime', 'asc').offset(req.body.data.toFloor-1).first();
            if(!brief)
                return res.status(404).json({error: 1, code: 'reply.notFound', message: 'no such comment'});
            toCommentId = brief.id; toCommentType = brief.type;
        }
        
        const reply = {
            toPlayerId: req.body.data.toPlayerId,
            byUserId: req.user.id,
            toFloor: req.body.data.toFloor? req.body.data.toFloor : null,
            content: handleRichTextInput(req.body.data.content),
            valid: 1,
            createTime: new Date(),
        };
        const insertId = (await db('replies').insert(reply) )[0];
        reply.id = insertId;
        await db('players').update({
            updateTime: new Date(), 
        }).increment('commentsNum', 1).where({id: req.body.data.toPlayerId});
        
        reply.toCommentId = toCommentId; reply.toCommentType = toCommentType;
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
        
        const tmp = await db.select('originUserId').from('players').where(key, '=', val).first();
        if(!tmp)
            return res.status(404).json({error: 1, code: 'update.notFound', message: 'no such player'});
        const originUserId = tmp.originUserId;
        const client = originClients.getOne();
        const profile = await client.getInfoByUserId(originUserId);
        const avatarLink = await client.getUserAvatar(originUserId);
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
    checkbody('data.cheatMethods').if(checkbody('data.toPlayerId').isIn('kill','guilt')).isString().custom(cheatMethodsSanitizer), // if no kill or guilt judgment is made, this field is not required
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

        /** @type {import("../typedef.js").Player|undefined} */    
        const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
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
        const insertId = (await db('judgements').insert(judgement) )[0];
        judgement.id = insertId;
        const nextstate = await stateMachine(player, req.user, req.body.data.action);
        const stateChange = {prev: player.status, next: nextstate};
        player.status = nextstate;
        player.cheatMethods = nextstate==1? req.body.data.cheatMethods : '';
        player.updateTime = new Date();
        player.commentsNum += 1;
        await db('players').update(player).where({id: player.id});

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
        
        /** @type {import("../typedef.js").Player|undefined} */
        const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
        if(!player)
            return res.status(404).json({error: 1, code: 'banAppeal.notFound', message: 'no such player'});
        if(player.status!=1 && player.status!=2)
            return res.status(400).json({error: 1, code: 'banAppeal.noNeed', message: 'no need for ban appeal'});
        /** @type {import("../typedef.js").BanAppeal} */
        const prev = await db.select('*').from('ban_appeals').where({toPlayerId: req.body.data.toPlayerId}).orderBy('createTime', 'desc').first();
        if(prev && prev.status=='lock')
            return res.status(403).json({error: 1, code: 'banAppeal.locked', message: 'this thread is locked'});    
        const ban_appeal = {
            toPlayerId: player.id,
            byUserId: req.user.id,
            content: handleRichTextInput(req.body.data.content),
            viewedAdminIds: '',
            status: 'open',
            valid: 1,
            createTime: new Date()
        };
        const insertId = (await db('ban_appeals').insert(ban_appeal) )[0];
        ban_appeal.id = insertId;

        siteEvent.emit('action', {method: 'banAppeal', params: {ban_appeal}});
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
        
        /** @type {import("../typedef.js").BanAppeal} */
        const ban_appeal = await db.select('*').from('ban_appeals').where({id: req.body.data.id}).first();
        if(!ban_appeal)
            return res.status(404).json({success: 1, code: 'banAppeal.notFound', message: 'no such ban appeal'});
        const viewedAdminIds = new Set(ban_appeal.viewedAdminIds==''? undefined:ban_appeal.viewedAdminIds.split(','));
        viewedAdminIds.add(req.user.id);
        
        if(req.body.data.status)
            ban_appeal.status = req.body.data.status;
        ban_appeal.viewedAdminIds = Array.from(viewedAdminIds).slice(0,3).join(',');
        await db('ban_appeals').update(ban_appeal).where({id: ban_appeal.id});

        if(viewedAdminIds.size >= config.personsToReview)
            siteEvent.emit('action', {method: 'viewBanAppeal', params: {ban_appeal}});
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
