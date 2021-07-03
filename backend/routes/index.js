import express, { json, urlencoded } from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult, param } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import { OriginClient, originClients } from "../lib/origin.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";

const router = express.Router();

router.get('/statistics', [
    checkquery('from').optional().isNumeric({no_symbols: true}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'statistics.bad', message:errors.array()}); 
        const from = typeof(req.query.from)==='string'? req.query.from-0 : 0;

        let data={};
        if(req.query.reports==='')
            data.reports = (await db('reports').count({reports: 'id'}).where('createTime', '>=', new Date(from)) )[0].reports;
        if(req.query.cheaters==='')
            data.cheaters = (await db('cheaters').count({cheaters: 'id'}).where('createTime', '>=', new Date(from)) )[0].cheaters;
        if(req.query.confirmed==='')
            data.confirmed = (await db('cheaters').count({confirmed: 'id'}).where('createTime', '>=', new Date(from)).andWhere({status: 1}) )[0].confirmed;
        if(req.query.registers==='')
            data.registers = (await db('users').count({registers: 'id'}).where('createTime', '>=', new Date(from)) )[0].registers;
        if(req.query.banappeals==='')
            data.banappeals = (await db('ban_appeals').count({banappeals: 'id'}).where('createTime', '>=', new Date(from)) )[0].banappeals;
        res.status(200).json({success: 1, code: 'statistics.success', data: data});
    } catch(err) {
        next(err);
    }
});

router.get('/activities', [

], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{

});

router.get('/search',[
    checkquery('param').isString().trim().notEmpty()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const result = {success: 1, code: 'search.success', data: {}};
        const current = await db.select('*').from('cheaters').where('originName', 'like', '%'+/[A-Za-z0-9_\-]*/.exec(req.query.param)[0]+'%').limit(100);
        result.data.current = current.map(i=>{ return {
            originName: i.originName,
            originUserId: i.originUserId,
            originPersonaId: i.originPersonaId,
            avatarLink: i.avatarLink,
            status: i.status
        }; });
        if(req.query.history='') {
            const history = await db('name_log').join('cheaters', 'name_log.originUserId', 'cheaters.originUserId')
            .select('name_log.originName as prevOriginName', 'cheaters.*', 'name_log.fromTime', 'name_log.toTime')
            .where('name_log.originName', 'like', '%'+/[A-Za-z0-9_\-]*/.exec(req.query.param)[0]+'%').andWhere({valid: 1}).limit(100);
            result.data.history = history.map(i=> { return {
                historyName: i.prevOriginName, 
                currentName: i.originName,
                originUserId: i.originUserId,
                originPersonaId: i.originUserId,
                log: { from: i.fromTime.getTime(), to: i.toTime.getTime() },
                status: i.status,
            }; });
        }


    } catch(err) {
        next(err);
    }
});

router.get('/advanceSearch', verifyJWT, forbidPrivileges(['blacklisted','freezed']), [
    checkquery('param').isString().trim().notEmpty()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            res.status(400).json({error: 1, code:'advSearch.bad', message:errors.array()});

        const originClient = originClients.getOne();
        const originUserId = await originClient.searchUserName(req.query.param); // we have dealt with url unescape
        const result = {success: 1, code:'', data:{}};
        if(originUserId) {
            const curOriginInfo = await originClient.getInfoByUserId(originUserId);
            const curOriginAvatar = await originClient.getUserAvatar(originUserId);
            const record = await db.select('*').from('cheaters').where({originUserId: originUserId, valid: 1})[0];
            
            result.data.originName = curOriginInfo.username;
            result.data.originPersonaId = curOriginInfo.personaId;
            result.data.originUserId = curOriginInfo.userId; 
            result.data.originAvatar = curOriginAvatar; 

            if(!record) {
                result.code = 'advSearch.foundOrigin',
                result.data.record = null;
            } else {
                result.code = 'advSearch.foundBoth';
                result.data.record = { currentName: record.originName, status: record.status, cheatMethods: record.cheatMethods };
            }
            return res.status(200),json(result);
        } else {
            return res.status(200).json({success: 1, code:'advSearch.notFound', data:null });
        }
    } catch(err) {
        next(err);
    }
});

export default router;