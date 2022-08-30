"use strict";
import crypto from "crypto";
import got from "got";
import express from "express";
import { PassThrough, Transform, pipeline } from "stream";
import { check, body as checkbody, query as checkquery, header as checkheader, oneOf as checkOneOf ,validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";


import { allowPrivileges, verifyJWT } from "../middleware/auth.js";
import { forbidPrivileges } from "../middleware/auth.js";
import { commentRateLimiter } from "../middleware/rateLimiter.js";
import { sendMessage } from "./message.js";
import { handleRichTextInput, initUserStorageQuota, updateUserStorageQuota } from "../lib/user.js";
import { fileSuffixByMIMEType, readStreamTillEnd } from "../lib/misc.js";
const router = express.Router();

/*
router.get('/feedbacks', [
    checkquery('skip').optional().isInt({min:0}),
    checkquery('limit').optional().isInt({min:0, max:100}),
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */ /*
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
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ /*
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
}); */

router.get('/myStorageQuota', verifyJWT, 
/** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=>{
    try {
        /** @type {import("../typedef.js").StorageQuota} */
        let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
        if(!quota) {  // that user hasnt used the storage before
            quota = initUserStorageQuota(req.user);
            await db('storage_quotas').insert(quota);
        }
        return res.status(200).json({success: 1, code: 'quota.ok', data: quota});
    } catch(err) {
        next(err);
    }
});

router.get('/myFiles', verifyJWT, [
    checkquery('limit').optional().isInt({min: 0, max: 200}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('order').optional().isIn('asc', 'desc')
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'myFiles.bad', message: validateErr.array()});

        const limit = req.query.limit? req.query.limit : 50;
        const skip = req.query.skip? req.query.skip : 0;
        const order = req.query.order? req.query.order : 'desc';
        /** @type {import("../typedef.js").StorageItem[]} */
        const items = await db.select('*').from('storage_items').where({byUserId: req.user.id})
        .orderBy('createTime', order).offset(skip).limit(limit)
        .then(r=>r.map(i=>{ delete i.fileId; delete i.byUserId; return i; }));

        return res.status(200).json({success: 1, code: 'myFiles.ok', data: items});
    } catch(err) {
        next(err);
    }
})

router.get('/file', [
    checkquery('filename').isString().isLength({min: 0, max: 64}),
    checkquery('explain').optional()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'file.bad', message: validateErr.array()});
        
        /** @type {import("../typedef.js").StorageItem} */
        const fileItem = await db.select('*').from('storage_items').where({filename: req.query.filename}).first();
        if(!fileItem)
            return res.status(404).json({error: 1, code: 'file.notFound', message: 'no such file.'});
        
        const svResponse = await got.get(`${config.services.msGraphAPI.url}/file?id=${fileItem.fileId}`, {
            throwHttpErrors: false,
        });
        const svResBody = JSON.parse(svResponse.body);
        
        if(svResponse.statusCode == 404) {
            await db('storage_items').delete().where({id: fileItem.id});
            return res.status(404).json({error: 1, code: 'file.notFound', message: 'file not found'});
        } else if(svResponse.statusCode != 200)
            return res.status(svResponse.statusCode).json({error: 1, code: 'file.error', message: svResBody.message});

        // no error occured
        if(req.query.explain != undefined)
            return res.status(200).json({success: 1, code: 'file.ok', data: {
                downloadURL: svResBody.data.downloadURL,
                size: svResBody.data.size,
                mimeType: svResBody.data.mimeType,
                filename: fileItem.filename,
            }});
        else
            return res.redirect(svResBody.data.downloadURL);
    } catch(err) {
        next(err);
    }
});

router.put('/upload', verifyJWT, forbidPrivileges(['blacklisted', 'freezed']), [
    checkheader('Content-Length').isInt({min: 0, max: 2048*1024}),
    checkheader('Content-Range').isMimeType()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'upload.bad', message: validateErr.array()});

        const contentType = req.get('Content-Type');
        const contentLength = req.get('Content-Length')-0;
        const fileSuffix = fileSuffixByMIMEType(contentType);
        if(!fileSuffix)
            return res.status(415).json({error: 1, code: 'upload.unsupport', message: 'Unsupport media type'});

        /** @type {import("../typedef.js").StorageQuota} */
        let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
        if(!quota) { // that user hasnt used the storage before
            quota = initUserStorageQuota(req.user);
            await db('storage_quotas').insert(quota);
        }
        if(!updateUserStorageQuota(quota, contentLength))  // update user quota while querying its stats
            return res.status(400).json({error: 1, code: 'upload.quotaExcced', message: 'You have used up all your storage space or today\'s bandwidth'});

        const filename = (new Date().toISOString().slice(0,10)+'_'+crypto.randomUUID()) + fileSuffix;
        const passThrough = new PassThrough();
        const svResponse = await got.put(`${config.services.msGraphAPI.url}/uploadSmall?id=${config.services.msGraphAPI.baseDirId}&name=${filename}`, {
            throwHttpErrors: false,
            body: req.pipe(passThrough),    // add a passThrough to the req stream or the req stream will be closed by got
            headers: {
                'Content-Length': contentLength
            }
        }).json(); // send request to msGraphAPI service

        if(svResponse.error)
            return res.status(500).json({error: 1, code: 'upload.error', message: svResponse.message});

        // no error occured
        await db('storage_items').insert({  // insert fileinfo into db
            filename: filename, 
            size: svResponse.data.size, 
            byUserId: req.user.id, 
            fileId: svResponse.data.id,
        });
        await db('storage_quotas').update(quota).where({userId: quota.userId});  // write updated quota data back
        return res.status(201).json({success: 1, code: 'upload.success', data: {
            name: filename,
            size: svResponse.data.size,
        }});
    } catch(err) {
        next(err);
    }
});

router.post('/uploadBigFile', verifyJWT, forbidPrivileges(['blacklisted', 'freezed']), [
    checkbody("data.size").isInt({min: 0, max: 2000*1000*1000}),
    checkbody("data.mimeType").isMimeType()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'upload.bad', message: validateErr.array()});
        
        const fileSuffix = fileSuffixByMIMEType(req.body.data.mimeType);
        if(!fileSuffix)
            return res.status(415).json({error: 1, code: 'upload.unsupport', message: 'Unsupport media type'});
        const size = req.body.data.size;

        /** @type {import("../typedef.js").StorageQuota} */
        let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
        if(!quota) { // that user hasnt used the storage before
            quota = initUserStorageQuota(req.user);
            await db('storage_quotas').insert(quota);
        }
        if(!updateUserStorageQuota(quota, size))  // update user quota while querying its stats
            return res.status(400).json({error: 1, code: 'upload.quotaExcced', message: 'You have used up all your storage space or today\'s bandwidth'});
        
        const filename = (new Date().toISOString().slice(0,10)+'_'+crypto.randomUUID()) + fileSuffix;

        // ask msGraphAPI service for upload URL
        const svResponse = await got.post(`${config.services.msGraphAPI.url}/uploadBig`, {
            throwHttpErrors: false,
            json: {
                data: {
                    id: config.services.msGraphAPI.baseDirId,
                    name: filename,
                    size: size
                }
            }
        }).json();

        if(svResponse.error)
            return res.status(500).json({error: 1, code: 'uploadBigFile.error', message: svResponse.message});
        
        // no error occured
        await db('storage_items').insert({  // insert fileinfo into db
            filename: filename, 
            size: svResponse.data.size, 
            byUserId: req.user.id, 
            fileId: svResponse.data.id,
        });
        await db('storage_quotas').update(quota).where({userId: quota.userId});  // write updated quota data back
        return res.status(201).json({success: 1, code: 'upload.success', data: {
            name: filename,
            size: svResponse.data.size,
            uploadUrl: svResponse.data.uploadUrl,
            expiredAt: svResponse.data.expiredAt
        }});
    } catch(err) {
        next(err);
    }
});


export default router;