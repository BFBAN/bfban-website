"use strict";
import express, { json, urlencoded } from "express";
import { check, body as checkbody, query as checkquery, validationResult, param } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import { OriginClient, originClients } from "../lib/origin.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";

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
        if(req.query.reports==='')
            data.reports = await db('reports').count({reports: 'id'}).where('createTime', '>=', new Date(from)).first().reports;
        if(req.query.players==='')
            data.players = await db('players').count({players: 'id'}).where('createTime', '>=', new Date(from)).andWhere({valid: 1}).first().players;
        if(req.query.confirmed==='')
            data.confirmed = await db('players').count({confirmed: 'id'}).where('createTime', '>=', new Date(from)).andWhere({status: 1}).andWhere({valid: 1}).first().confirmed;
        if(req.query.registers==='')
            data.registers = await db('users').count({registers: 'id'}).where('createTime', '>=', new Date(from)).first().registers;
        if(req.query.banAppeals==='')
            data.banAppeals = await db('ban_appeals').count({banappeals: 'id'}).where('createTime', '>=', new Date(from)).first().banappeals;
        if(req.query.details==='') {
            data.details = {};
            data.details.bygame = {};
            data.details.bystatus = {};
            for(let i of config.supportGames)
                data.details.bygame[i] = await db('players').count({game: 'id'})
                .where('games', 'like', `%${i}%`).andWhere({valid: 1}).andWhere('createTime', '>=', new Date(from)).first().game;
            for(let i of ['1','2','3','4','5','6'])
                data.details.bystatus[i] = await db('players').count({status: 'id'})
                .where({status: i}).andWhere({valid: 1}).andWhere('createTime', '>=', new Date(from)).first().status;
        }
        res.status(200).json({success: 1, code: 'statistics.success', data: data});
    } catch(err) {
        next(err);
    }
});

router.get('/activities', [

], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{

});

router.get('/players', [
    checkquery('game').optional().isIn(config.supportGames.concat(['all'])),
    checkquery('createTime').optional().isInt({min: 0}),
    checkquery('updateTime').optional().isInt({min: 0}),
    checkquery('status').optional().isIn([-1, 0, 1, 2, 3, 4, 5 ]),
    checkquery('sort').optional().isIn(['createTime','updateTime','viewNum','commentsNum']),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('skip').optional().isInt({min: 0})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'players.bad', message: validateErr.array()});
        
        const game = (req.query.game&&req.query.game!='all')? req.query.game : '';
        const createTime = req.query.createTime? req.query.createTime-0 : 0;
        const updateTime = req.query.updateTime? req.query.updateTime-0 : 0;
        const status = (req.query.status&&req.query.status!='-1')? req.query.status : '%';
        const sort = req.query.sort? req.query.sort : 'createTime';
        const limit = req.query.limit? req.query.limit-0 : 20;
        const skip = req.query.skip? req.query.skip-0 : 0;
        
        const result = await db.select('id','originName','originUserId','originPersonaId','games',
        'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
        .from('players').where('games', 'like', `%${game}%`).andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status)
        .orderBy(sort, 'desc').offset(skip).limit(limit);
        const total = await db('players').count({num: 'id'})
        .where('games', 'like', `%${game}%`).andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status).first().num;

        res.status(200).json({ success: 1, code:'players.ok', data:{result: result, total: total} });
    } catch(err) {
        next(err);
    }
});

router.get('/admins', async (req, res, next)=> {
    try {
        /** @type {import("../typedef.js").User[]} */
        const admins = await db.select('id','username','originName','originUserId','privilege').from('users')
        .where('privilege','like','%admin%')
        .orWhere('privilege','like','%super%')
        .orWhere('privilege','like','%root%');
        
        res.status(200).json({success: 1, code: 'getAdmins.success', data: admins});
    } catch(err) {
        next(err);
    }
})


router.get('/search',[
    checkquery('param').isString().trim().notEmpty(),
    checkquery('scope').optional().isIn(['current','history'])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const param = /[A-Za-z0-9_-]*/.exec(req.query.param)[0];
        const result = {success: 1, code: 'search.success', data: {}};
        if(!req.query.scope || req.query.scope=='current')
            result.data = await db.select('originName','originUserId','originPersonaId','avatarLink','status').from('players')
            .where('originName', 'like', '%'+param+'%').limit(100);
        else {
            const history = await db('name_logs').join('players', 'name_logs.originUserId', 'players.originUserId')
            .select('name_logs.originName as prevOriginName', 'players.*', 'name_logs.fromTime', 'name_logs.toTime')
            .where('name_logs.originName', 'like', '%'+param+'%').andWhere({valid: 1}).limit(100);
            result.data = history.map(i=> { return {
                historyName: i.prevOriginName, 
                currentName: i.originName,
                originUserId: i.originUserId,
                originPersonaId: i.originUserId,
                log: { from: i.fromTime, to: i.toTime },
                status: i.status,
            }; });
        }
        return res.status(200).json(result);

    } catch(err) {
        next(err);
    }
});

router.get('/advanceSearch', verifyJWT, forbidPrivileges(['blacklisted','freezed']), [
    checkquery('param').isString().trim().notEmpty()
], /** @type {(req:express.Request&import("../typedef.js").User, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            res.status(400).json({error: 1, code:'advSearch.bad', message:validateErr.array()});

        const originClient = originClients.getOne();
        const originUserId = await originClient.searchUserName(req.query.param); // we have dealt with url unescape
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

export default router;