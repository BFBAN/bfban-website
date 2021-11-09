import express from "express";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import { verifyJWT } from "../middleware/auth.js";
import { forbidPrivileges } from "../middleware/auth.js";
import { commentRateLimiter } from "./player.js";
import { sendMessage } from "./message.js";
import { handleRichTextInput } from "../lib/user.js";
const router = express.Router();

router.get('/feedbacks', [
    checkquery('skip').optional().isInt({min:0}),
    checkquery('limit').optional().isInt({min:0, max:100}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'feedback.bad', message: validateErr.array()});
        
        const skip = req.query.skip? req.query.skip-0 : 0;
        const limit = req.query.limit? req.query.limit-0 : 20;
        const result = await db('messages').join('users', 'messages.byUserId', 'users.id')
        .select('messages.id', 'messages.byUserId', 'content', 'createTime', 'users.username')
        .where('messages.type', 'feedback').orderBy('messages.createTime', 'desc')
        .offset(skip).limit(limit);
        const total = await db('messages').count({num: 'id'}).where('type', 'feedback').first().then(r=>r.num);
        return res.status(200).json({success: 1, code: 'feedback.ok', data: { result, total }});
    } catch(err) {
        next(err);
    }
});

router.post('/feedback', verifyJWT, forbidPrivileges(['blacklisted']),
    commentRateLimiter.limiter([{roles: ['admin','super','root','dev','bot'], value: 0}]), [
    checkbody('data.content').isString().trim().isLength({min: 1, max:5000}),
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'feedback.bad', message: validateErr.array()});
        await sendMessage(req.user.id, null, "feedback", handleRichTextInput(req.body.data.content));
        return res.status(201).json({success: 1, code: 'feedback.posted', message: 'feedback posted.'});
    } catch(err) {
        next(err);
    }
});

export default router;