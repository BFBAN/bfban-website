import express from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult, oneOf as checkOneof } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { originClients } from "../lib/origin.js"

const router = express.Router()

router.get('/cheaters', [
    checkquery('game').optional().isIn(config.supportGames),
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
            return res.status(400).json({error: 1, code: 'cheaters.bad', message: validateErr.array()});
        
        const game = req.query.game? req.query.game : '';
        const createTime = req.query.createTime? parseInt(req.query.createTime) : 0;
        const updateTime = req.query.updateTime? parseInt(req.query.updateTime) : 0;
        const status = (req.query.status||req.query.status=='-1')? req.query.status : '%';
        const sort = req.query.sort? req.query.sort : 'createTime';
        const limit = req.query.limit? parseInt(req.query.limit) : 20;
        const skip = req.query.skip? parseInt(req.query.skip) : 0;

        const result = await db.select('id','originName','originUserId','originPersonaId','games',
        'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
        .from('cheaters').where('games', 'like', `%${game}%`).andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status)
        .orderBy(sort).offset(skip).limit(limit);
        const total= (await db('cheaters').count({num: 'id'})
        .where('games', 'like', `%${game}%`).andWhere('valid', '=', 1)
        .andWhere('createTime', '>=', new Date(createTime))
        .andWhere('updateTime', '>=', new Date(updateTime))
        .andWhere('status', 'like', status))[0].num;

        res.status(200).json({ success: 1, code:'cheaters.ok', data:{result: result, total: total} });
    } catch(err) {
        next(err);
    }
});

router.get('/cheaters4dev');

router.get('/cheater', [
    checkquery('userId').optional().isInt({min: 0}),
    checkquery('personaId').optional().isInt({min: 0}),
    checkquery('dbId').optional().isInt({min: 0}),
    checkquery('history').optional()
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'cheater.bad', message: validateErr.array()});
    let key = '', val='';
    switch(true) {
    case !!req.query.userId:
        key = 'originUserId'; val = req.query.userId; break;
    case !!req.query.personaId:
        key = 'originPersonaId'; val = req.query.personaId; break;
    case !!req.query.dbId:
        ket = 'id'; val = req.query.dbId; break;
    default:
        return res.status(400).json({error: 1, code: 'cheater.bad'});
    }

    const result = (await db.select('id','originName','originUserId','originPersonaId','games',
    'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
    .from('cheaters').where(key, '=', val))[0];
    if(!result)
        return res.status(404).json({error: 1, code: 'cheater.notFound'});
    if(req.query.history) // that guy does exsist
        result.history =  await db.select('originName','fromTime','toTime').from('name_log').where({originUserId: result.originUserId});
    
    res.status(200).json({success: 1, code: 'cheater.ok', data: result});
});

router.post('/report', verifyCaptcha, verifyJWT, [
    checkbody('data.game').isIn(config.supportGames),
    checkbody('data.originName').isAscii().notEmpty(),
    checkbody('data.cheateMethods').isString().notEmpty().custom((val, {req})=>{
        const cheateMethods = new Set();
        for(let i of val.split(','))
            if(config.possibleCheateMethods.indexOf(i) != -1)
                cheateMethods.add(i); // validate & remove duplicated
        if(cheateMethods.size == 0)
            throw new Error("No valid cheate method given.");
        req.body.data.cheateMethods = ''; // rewrite to sanitize
        for(let i of cheateMethods.keys())
        req.body.data.cheateMethods += i+',';
        req.body.data.cheateMethods = req.body.data.cheateMethods.slice(0,-1);
    }),
    checkbody('data.videolink').optional().isURL(),
    checkbody('data.description').isString(),  
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    // TODO: 
    // 对于userId和personaId不再使用二次确认，直接一次提交搜索一次并保存结果
    // 建议用户使用高级搜素确认玩家存在再进行举报，举报时如玩家不存在直接返回友好错误
});

router.get('/timeline');

router.post('/comment');

router.post('/update');

router.post('/judgement');

router.post('/banappeal');

export default router;