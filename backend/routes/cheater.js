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
import { cheateMethodsSanitizer, handleRichTextInput } from "../lib/user.js";

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
        .orderBy(sort, 'desc').offset(skip).limit(limit);
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
    try {
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
            return res.status(400).json({error: 1, code: 'cheater.bad', message: 'Must specify one param from "originUserId","originPersonaId","dbId"'});
        }

        const result = (await db.select('id','originName','originUserId','originPersonaId','games',
        'cheatMethods','avatarLink','viewNum','commentsNum','status','createTime','updateTime')
        .from('cheaters').where(key, '=', val))[0];
        if(!result)
            return res.status(404).json({error: 1, code: 'cheater.notFound'});
        if(req.query.history) // that guy does exsist
            result.history =  await db.select('originName','fromTime','toTime').from('name_log').where({originUserId: result.originUserId});
        
        res.status(200).json({success: 1, code: 'cheater.ok', data: result});
    } catch(err) {
        next(err);
    }
});

router.post('/report', verifyCaptcha, verifyJWT, 
    forbidPrivileges(['freezed','blacklisted']), [
    checkbody('data.game').isIn(config.supportGames),
    checkbody('data.originName').isAscii().notEmpty(),
    checkbody('data.cheateMethods').isString().notEmpty().custom(cheateMethodsSanitizer),
    checkbody('data.videolink').optional({checkFalsy: true}).isURL(),
    checkbody('data.description').isString().notEmpty(),  
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error:1, code:'report.bad', message:validateErr.array()});
        
        const client = originClients.getOne();
        const originUserId = await client.searchUserName(req.body.data.originName);
        if(!originUserId)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user not found.'});
        const userInfo = await client.getInfoByUserId(originUserId);
        if(userInfo.username != req.body.data.originName)
            return res.status(404).json({error:1, code:'report.notFound', message:'Report user mismatch.'});
        // now the user being reported is found
        const reported = (await db.select('*').from('cheaters').where({originUserId: originUserId}))[0];
        if(reported) {
            await db('reports').insert({
                byUserId: req.user.id, 
                toOriginName: userInfo.username,
                toOriginUserId: userInfo.userId,
                game: req.body.data.game,
                cheateMethods: req.body.data.cheateMethods,
                videoLink: req.body.data.videoLink,
                description: handleRichTextInput(req.body.data.description),
            });
        }

    } catch(err) {}
});

router.get('/timeline');

router.post('/comment');

router.post('/update');

router.post('/judgement');

router.post('/banappeal');

export default router;