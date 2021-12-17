"use strict";
import express from "express";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import { OriginClient, originClients } from "../lib/origin.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { advSearchRateLimiter, normalSearchRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get('/statistics', [
    checkquery('from').optional().isInt({min: 0}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'statistics.bad', message:validateErr.array()}); 
        const from = typeof(req.query.from)==='string'? req.query.from-0 : 0;

        let data={};
        if(req.query.reports)
            data.reports = await db('comments').count({reports: 'id'}).where('createTime', '>=', new Date(from)).andWhere({type: 'report'}).first().then(r=>r.reports);
        if(req.query.players)
            data.players = await db('players').count({players: 'id'}).where('createTime', '>=', new Date(from)).andWhere({valid: 1}).first().then(r=>r.players);
        if(req.query.confirmed)
            data.confirmed = await db('players').count({confirmed: 'id'}).where('createTime', '>=', new Date(from)).andWhere({status: 1}).andWhere({valid: 1}).first().then(r=>r.confirmed);
        if(req.query.registers)
            data.registers = await db('users').count({registers: 'id'}).where('createTime', '>=', new Date(from)).first().then(r=>r.registers);
        if(req.query.banAppeals)
            data.banAppeals = await db('comments').count({banAppeals: 'id'}).where('createTime', '>=', new Date(from)).andWhere({type: 'banAppeal'}).first().then(r=>r.banAppeals);
        res.status(200).json({success: 1, code: 'statistics.ok', data: data});
    } catch(err) {
        next(err);
    }
});

router.post('/playerStatistics', [  // like graphql :)
    checkbody('data').isArray({min: 0, max: 10}),
    checkbody('data').custom((val, {req})=> {
        for(let i of val)
            if(!config.supportGames.concat('*').includes(i.game) || ![-1,0,1,2,3,4,5,6].includes(i.status-0))
                throw(new Error('bad subquery format'));
        return true;
    })
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'playerStatistics.bad', message: validateErr.array()});
        
        const data = [];
        for(let i of req.body.data) {
            const game = i.game=='*'? '%' : `%"${i.game}"%`;
            const status = i.status==-1? '%' : i.status;
            const count = await db.count({num: 'id'}).from('players').where('valid', '=', 1)
            .andWhere('games', 'like', game).andWhere('status', 'like', status).first().then(r=>r.num);
            data.push({game: i.game, status: i.status, count});
        }
        res.status(200).json({success: 1, code: 'playerStatistics.success', data: data});
    } catch(err) {
        next(err);
    }
});

router.get('/activities', [
    checkquery('from').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'activities.bad', message: validateErr.array()});
        
        const from = req.query.from? new Date(req.query.from-0) : new Date();
        const limit = req.query.limit? req.query.limit-0 : 100;
        const registers = await db.select('id', 'username', 'createTime')
        .from('users').where('createTime', '<=', from).orderBy('createTime', 'desc').limit(limit);
        const judgements = await db('comments')
        .join('users', 'comments.byUserId', 'users.id')
        .join('players', 'comments.toPlayerId','players.id')
        .select('comments.id as id', 'users.username as byUserName', 'comments.byUserId as byUserId', 'comments.toPlayerId as toPlayerId'
        , 'players.originName as toPlayerName', 'comments.judgeAction as action', 'comments.createTime as createTime')
        .where('comments.createTime', '<=', from).andWhere({type: 'judgement'}).orderBy('comments.createTime', 'desc').limit(limit);
        const reports = await db('comments')
        .join('users', 'comments.byUserId', 'users.id')
        .join('players', 'comments.toPlayerId', 'players.id')
        .select('comments.id as id', 'users.username as byUserName', 'comments.byUserId as byUserId', 'comments.toPlayerId as toPlayerId'
        , 'players.originName as toPlayerName', 'comments.cheatGame as game', 'comments.createTime as createTime')
        .where('comments.createTime', '<=', from).andWhere({type: 'report'}).orderBy('comments.createTime', 'desc').limit(limit);
        const banAppeals = await db('comments')
        .join('users', 'comments.byUserId', 'users.id')
        .join('players', 'comments.toPlayerId', 'players.id')
        .select('comments.id as id', 'users.username as byUserName', 'comments.byUserId as byUserId', 'comments.toPlayerId as toPlayerId'
        , 'players.originName as toPlayerName', 'comments.createTime as createTime')
        .where('comments.createTime', '<=', from).andWhere({type: 'banAppeal'}).orderBy('comments.createTime', 'desc').limit(limit);
        
        let total = [].concat(registers.map(i=>Object.assign(i, {type: 'register'}) ))
        .concat(judgements.map(i=>Object.assign(i, {type: 'judgement'}) ))
        .concat(reports.map(i=>Object.assign(i, {type: 'report'}) ))
        .concat(banAppeals.map(i=>Object.assign(i, {type: 'banAppeal'}) ));
        total.sort((a, b)=> {
            if(a.createTime > b.createTime)
                return -1;
            else
                return 1;
        });
        
        res.status(200).json({success: 1, code: 'activities.ok', data: total.slice(0, limit) });
    } catch(err) {
        next(err);
    }
});

router.get('/players', [
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('createTime').optional().isInt({min: 0}).default(0),
    checkquery('updateTime').optional().isInt({min: 0}).default(0),
    checkquery('status').optional().isIn([-1, 0, 1, 2, 3, 4, 5, 6 ]),
    checkquery('sort').optional().isIn(['createTime','updateTime','viewNum','commentsNum']).default('createTime'),
    checkquery('limit').optional().isInt({min: 0, max: 100}).default(20),
    checkquery('skip').optional().isInt({min: 0}).default(0)
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'players.bad', message: validateErr.array()});
        
        const game = (req.query.game&&req.query.game!='all')? req.query.game : '';
        const createTime = req.query.createTime;
        const updateTime = req.query.updateTime;
        const status = (req.query.status&&req.query.status!=-1)? req.query.status : '%';
        const sort = req.query.sort;
        const limit = req.query.limit;
        const skip = req.query.skip;

        const result = await db.select('*').from('players')
        .where('games', 'like', game? `%"${game}"%` : "%").andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status)
        .orderBy(sort, 'desc').offset(skip).limit(limit)
        .then(r=>r.map(i=>{ delete i.valid; return i }));
        const total = await db('players').count({num: 'id'})
        .where('games', 'like', game? `%"${game}"%` : "%").andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status).first().then(r=>r.num);

        res.status(200).json({ success: 1, code:'players.ok', data:{ result, total } });
    } catch(err) {
        next(err);
    }
});

router.get('/banAppeals', [
    checkquery('status').optional().isIn(['open', 'close', 'lock', 'all']).default('open'),
    checkquery('limit').optional().isInt({min: 0, max: 100}).default(20),
    checkquery('skip').optional().isInt({min: 0}).default(20)
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const status = req.query.status=='all'? '%' : req.query.status;
        const limit = req.query.limit;
        const skip = req.query.skip;

        const result = await db('players').join('comments', 'players.id', 'comments.toPlayerId', 'comments.byUserId')
        .select('players.*', 'comments.appealStatus', 'comments.createTime as appealTime').distinct('id')
        .where('comments.type','banAppeal').andWhere('comments.appealStatus', 'like', status)
        .orderBy('appealTime', 'desc').offset(skip).limit(limit)
        .then(r=>r.map(i=>{ delete i.valid; return i }));
        const total = await db.countDistinct({num: 'toPlayerId'}).from('comments').where('comments.type','banAppeal')
        .andWhere('comments.appealStatus', 'like', status).first().then(r=>r.num);

        res.status(200).json({ success: 1, code:'players.ok', data:{ result, total } });
    } catch(err) {
        next(err);
    }
});


router.get('/admins', async (req, res, next)=> {
    try {
        /** @type {import("../typedef.js").User[]} */
        let admins = await db.select('id','username','originName','originUserId','privilege', 'attr').from('users')
        .where('privilege','like','%"admin"%')
        .orWhere('privilege','like','%"super"%')
        .orWhere('privilege','like','%"root"%');
        admins.forEach(i=>{
            if(!i.attr.showOrigin) {
                i.originUserId = null;
                i.originName = null;
            }
        });
        res.status(200).json({success: 1, code: 'getAdmins.success', data: admins});
    } catch(err) {
        next(err);
    }
})

router.get('/search', normalSearchRateLimiter, [
    checkquery('param').trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 3}),
    checkquery('skip').optional().isInt({min: 0}).default(0),
    checkquery('limit').optional().isInt({min: 0, max: 100}).default(20)
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'search.bad', message: validateErr.array()});

        const skip = req.query.skip;
        const limit = req.query.limit;
        const param = req.query.param;
        const result = {success: 1, code: 'search.success', data: []};
        /** @type {(import("../typedef.js").Player&{prevOriginName:string,fromTime:Date,toTime:Date})[]} */
        const history = await db('name_logs').join('players', 'name_logs.originUserId', 'players.originUserId')
        .select('name_logs.originName as prevOriginName', 'players.*', 'name_logs.fromTime', 'name_logs.toTime')
        .where('name_logs.originName', 'like', '%'+param+'%').andWhere({valid: 1}).offset(skip).limit(limit);
        result.data = history.map(i=> { return {
            historyName: i.prevOriginName, 
            originName: i.originName,
            dbId: i.id,
            originUserId: i.originUserId,
            originPersonaId: i.originUserId,
            avatarLink: i.avatarLink,
            status: i.status,
            games: i.games,
            cheatMethods: i.cheatMethods,
            viewNum: i.viewNum,
            commentsNum: i.commentsNum,
            createTime: i.createTime,
            updateTime: i.updateTime,
            log: { from: i.fromTime, to: i.toTime },
        }; });
        return res.status(200).json(result);

    } catch(err) {
        next(err);
    }
});

router.get('/advanceSearch', verifyJWT, forbidPrivileges(['blacklisted','freezed']), 
    advSearchRateLimiter.limiter([{roles: ['root','super','admin','dev'], value: 0}]), [
    checkquery('param').isAlphanumeric('en-US', {ignore: '-_'}).trim().isLength({min: 4})
], /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code:'advSearch.bad', message:validateErr.array()});

        const originClient = originClients.getOne();
        const originUserId = await originClient.searchUserName(req.query.param);
        const result = {success: 1, code:'', data:{}};
        if(originUserId) {
            const curOriginInfo = await originClient.getInfoByUserId(originUserId);
            const curOriginAvatar = await originClient.getUserAvatar(originUserId);
            const record = await db.select('*').from('players').where({originUserId: originUserId, valid: 1}).first();
            
            result.data.originName = curOriginInfo.username;
            result.data.originPersonaId = curOriginInfo.personaId;
            result.data.originUserId = curOriginInfo.userId; 
            result.data.avatarLink = curOriginAvatar; 

            if(!record) {
                result.code = 'advSearch.foundOrigin',
                result.data.record = null;
            } else {
                result.code = 'advSearch.foundBoth';
                result.data.record = { currentName: record.originName, status: record.status, cheatMethods: record.cheatMethods };
            }
            return res.status(200).json(result);
        } else {
            return res.status(404).json({error: 1, code:'advSearch.notFound', message:'No such player found on origin.' });
        }
    } catch(err) {
        next(err);
    }
});

router.get('/trend', [
    checkquery('limit').optional().isInt({min: 1, max:10})
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code:'trend.bad', message:validateErr.array()});
        
        const limit = req.query.limit? req.query.limit : 5;
        const result = await db.count({hot: 'tmp.id'}).select('players.*').from(function () {
            this.select('id', 'toPlayerId').from('comments').orderBy('id', 'desc').limit(200).as('tmp');
        }).join('players', 'tmp.toPlayerId', 'players.id')
        .groupBy('id')
        .orderBy('hot', 'desc')
        .limit(limit)
        .then(r=>r.map(i=>{ delete i.valid; return i; }));
        return res.status(200).json({success: 1, code: 'trend.ok', data: result});
    } catch(err) {
        next(err);
    }
});

router.get('/siteStats', async (req, res, next)=>{
    try {
        const tbeg = new Date('2018-10-12T00:00:00.000Z');  // first commit of bfban
        const tnow = new Date();
        const period = 10;
        const slices = [...Array(period).keys()];   // like range(0, 10) in python

        const playerStats = await db('players').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
        .where('createTime', '<=', tbeg).andWhere({valid: 1})
        .unionAll(slices.map(i=> {
            const t = new Date(Math.round( tbeg.getTime()+(tnow.getTime()-tbeg.getTime())/period*(i+1) ));
            // caculate the time
            return db('players').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                .where('createTime', '<=', t).andWhere({valid: 1});
        }));

        const confirmStats = await db('players').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
        .where('createTime', '<=', tbeg).andWhere({valid: 1, status: 1})
        .unionAll(slices.map(i=> {
            const t = new Date(Math.round( tbeg.getTime()+(tnow.getTime()-tbeg.getTime())/period*(i+1) ));

            return db('players').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                .where('createTime', '<=', t).andWhere({valid: 1, status: 1});
        }));

        const userStats =  await db('users').count({num: '*'}).select(db.raw(`"${tbeg.toISOString()}" as time`))
        .where('createTime', '<=', tbeg).andWhere({valid: 1})
        .unionAll(slices.map(i=> {
            const t = new Date(Math.round( tbeg.getTime()+(tnow.getTime()-tbeg.getTime())/period*(i+1) ));

            return db('users').count({num: '*'}).select(db.raw(`"${t.toISOString()}" as time`))
                .where('createTime', '<=', t).andWhere({valid: 1});
        }));
        
        return res.status(200).json({success: 1, code: 'siteStats.ok', data: { playerStats, confirmStats, userStats } });
    } catch(err) {
        next(err);
    }
})

export default router;