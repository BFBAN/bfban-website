"use strict";
import crypto from "crypto";
import got from "got";
import express from "express";
import dns from "dns"
import {PassThrough, Transform, pipeline} from "stream";
import {body as checkbody, query as checkquery, header as checkheader, validationResult} from "express-validator";

import db from "../mysql.js";
import config from "../config.js";


import {allowPrivileges, verifyJWT} from "../middleware/auth.js";
import {forbidPrivileges} from "../middleware/auth.js";
import {commentRateLimiter} from "../middleware/rateLimiter.js";
import {sendMessage} from "./message.js";
import {handleRichTextInput, initUserStorageQuota, updateUserStorageQuota} from "../lib/user.js";
import {fileSuffixByMIMEType, readStreamTillEnd} from "../lib/misc.js";
import {use} from "bcrypt/promises.js";
import {getGravatarAvatar} from "../lib/gravatar.js";
import {userHasRoles} from "../lib/auth.js";
import jwt from "jsonwebtoken";

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
    async (req, res, next) => {
        try {
            /** @type {import("../typedef.js").StorageQuota} */
            let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
            if (!quota) {  // that user hasnt used the storage before
                quota = initUserStorageQuota(req.user);
                await db('storage_quotas').insert(quota);
            }
            return res.status(200).json({success: 1, code: 'quota.ok', data: quota});
        } catch (err) {
            next(err);
        }
    });

router.get('/myFiles', verifyJWT, [
    checkquery('limit').optional().isInt({min: 0, max: 200}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('order').optional().isIn('asc', 'desc')
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'myFiles.bad', message: validateErr.array()});

        const limit = req.query.limit ? req.query.limit : 50;
        const skip = req.query.skip ? req.query.skip : 0;
        const order = req.query.order ? req.query.order : 'desc';

        let total = await db.count({num: 1}).from('storage_items')
            .where({byUserId: req.user.id})
            .first().then(r => r.num);

        /** @type {import("../typedef.js").StorageItem[]} */
        const items = await db.select('*').from('storage_items').where({byUserId: req.user.id})
            .orderBy('createTime', order).offset(skip).limit(limit)
            .then(r =>
                r.map(i => {
                    delete i.fileId;
                    delete i.byUserId;
                    return i;
                })
            );

        return res.status(200).json({success: 1, code: 'myFiles.ok', data: items, total});
    } catch (err) {
        next(err);
    }
})

router.post('/files', verifyJWT, allowPrivileges(["root", "dev"]), [
        checkbody('data.userId').optional().isInt({min: 0}),
        checkbody('data.createTimeFrom').optional().isInt({min: 0}),
        checkbody('data.createTimeTo').optional().isInt({min: 0}),
        checkbody('order').optional().isIn(['desc', 'asc']),
        checkbody('limit').optional().isInt({min: 0, max: 100}),
        checkbody('skip').optional().isInt({min: 0})
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'msGetFile.bad', message: validateErr.array()});
            const userId = req.body.data.userId !== undefined ? req.body.data.userId : "%%";
            const createTimeFrom = new Date(req.body.data.createTimeFrom ? req.body.data.createTimeFrom - 0 : 0);
            const createTimeTo = new Date(req.body.data.createTimeTo ? req.body.data.createTimeTo - 0 : Date.now());
            const skip = req.body.skip !== undefined ? req.body.skip : 0;
            const limit = req.body.limit !== undefined ? req.body.limit : 20;
            const order = req.body.order ? req.body.order : 'desc';

            const total = await db.count({num: 1}).from('storage_items')
                .where('byUserId', 'like', userId)
                .andWhere("createTime", ">=", createTimeFrom)
                .andWhere("createTime", "<=", createTimeTo)
                .first().then(r => r.num);
            const result = await db.select("*").from("storage_items")
                .where('byUserId', 'like', userId)
                .andWhere("createTime", ">=", createTimeFrom)
                .andWhere("createTime", "<=", createTimeTo)
                .orderBy('createTime', order)
                .offset(skip).limit(limit);

            return res.status(200).json({success: 1, code: 'files.ok', data: result, total});
        } catch (err) {
            res.status(500).json({error: 1, code: 'files.error', message: err.message});
        }
    });

router.get('/file', [
    checkquery('filename').isString().isLength({min: 0, max: 64}),
    checkquery('explain').optional()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'file.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").StorageItem} */
        const fileItem = await db.select('*').from('storage_items').where({filename: req.query.filename}).first();
        if (!fileItem)
            return res.status(404).json({error: 1, code: 'file.notFound', message: 'no such file.'});

        const svResponse = await got.get(`${config.services.msGraphAPI.url}/file?id=${fileItem.fileId}`, {
            throwHttpErrors: false,
        });
        const svResBody = JSON.parse(svResponse.body);

        if (svResponse.statusCode == 404) {
            await db('storage_items').delete().where({id: fileItem.id});
            return res.status(404).json({error: 1, code: 'file.notFound', message: 'file not found'});
        } else if (svResponse.statusCode != 200)
            return res.status(svResponse.statusCode).json({error: 1, code: 'file.error', message: svResBody.message});

        // no error occured
        if (req.query.explain != undefined)
            return res.status(200).json({
                success: 1, code: 'file.ok', data: {
                    downloadURL: svResBody.data.downloadURL,
                    size: svResBody.data.size,
                    mimeType: svResBody.data.mimeType,
                    filename: fileItem.filename,
                }
            });
        else
            return res.redirect(svResBody.data.downloadURL);
    } catch (err) {
        next(err);
    }
});

router.delete('/file', verifyJWT, allowPrivileges(['root', 'dev', 'super']), [
    checkbody('filename').isString().isLength({min: 0, max: 64}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'deleteFile.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").StorageItem} */
        const fileItem = await db.select('*').from('storage_items').where({filename: req.body.filename}).first();
        if (!fileItem)
            return res.status(404).json({error: 1, code: 'deleteFile.notFound', message: 'no such file.'});

        const svResponse = await got.delete(`${config.services.msGraphAPI.url}/file?id=${fileItem.fileId}`, {
            throwHttpErrors: false,
        });
        const svResBody = JSON.parse(svResponse.body);

        if (svResponse.statusCode == 404) {
            return res.status(404).json({error: 1, code: 'deleteFile.notFound', message: 'file not found'});
        } else if (svResponse.statusCode != 200)
            return res.status(svResponse.statusCode).json({
                error: 1,
                code: 'deleteFile.error',
                message: svResBody.message
            });

        await db('storage_items').delete().where({id: fileItem.id});

        return res.status(200).json({success: 1, code: 'deleteFile.ok'});
    } catch (err) {
        next(err);
    }
});

router.put('/upload', verifyJWT, forbidPrivileges(['blacklisted', 'freezed']), [
    checkheader('Content-Length').isInt({min: 0, max: 2048 * 1024}),
    checkheader('Content-Type').isMimeType()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'upload.bad', message: validateErr.array()});

        const contentType = req.get('Content-Type');
        const contentLength = req.get('Content-Length') - 0;
        const fileSuffix = fileSuffixByMIMEType(contentType);
        if (!fileSuffix)
            return res.status(415).json({error: 1, code: 'upload.unsupport', message: 'Unsupport media type'});

        /** @type {import("../typedef.js").StorageQuota} */
        let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
        if (!quota) { // that user hasnt used the storage before
            quota = initUserStorageQuota(req.user);
            await db('storage_quotas').insert(quota);
        }
        if (!updateUserStorageQuota(quota, contentLength))  // update user quota while querying its stats
            return res.status(400).json({
                error: 1,
                code: 'upload.quotaExcced',
                message: 'You have used up all your storage space or today\'s bandwidth'
            });

        const filename = (new Date().toISOString().slice(0, 10) + '_' + crypto.randomUUID()) + fileSuffix;
        const passThrough = new PassThrough();
        const svResponse = await got.put(`${config.services.msGraphAPI.url}/uploadSmall?id=${config.services.msGraphAPI.baseDirId}&name=${filename}`, {
            throwHttpErrors: false,
            body: req.pipe(passThrough),    // add a passThrough to the req stream or the req stream will be closed by got
            headers: {
                'Content-Length': contentLength
            }
        }).json(); // send request to msGraphAPI service

        if (svResponse.error)
            return res.status(500).json({error: 1, code: 'upload.error', message: svResponse.message});

        // no error occured
        await db('storage_items').insert({  // insert fileinfo into db
            filename: filename,
            size: svResponse.data.size,
            byUserId: req.user.id,
            fileId: svResponse.data.id,
        });
        await db('storage_quotas').update(quota).where({userId: quota.userId});  // write updated quota data back
        return res.status(201).json({
            success: 1, code: 'upload.success', data: {
                name: filename,
                size: svResponse.data.size,
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post('/uploadBigFile', verifyJWT, forbidPrivileges(['blacklisted', 'freezed']), [
    checkbody("data.size").isInt({min: 0, max: 2000 * 1000 * 1000}),
    checkbody("data.mimeType").isMimeType()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'upload.bad', message: validateErr.array()});

        const fileSuffix = fileSuffixByMIMEType(req.body.data.mimeType);
        if (!fileSuffix)
            return res.status(415).json({
                error: 1,
                code: 'upload.unsupport',
                message: 'Unsupport media type',
                unMIMEType: req.body.data.mimeType
            });
        const size = req.body.data.size;

        /** @type {import("../typedef.js").StorageQuota} */
        let quota = await db.select('*').from('storage_quotas').where({userId: req.user.id}).first();
        if (!quota) { // that user hasnt used the storage before
            quota = initUserStorageQuota(req.user);
            await db('storage_quotas').insert(quota);
        }
        if (!updateUserStorageQuota(quota, size))  // update user quota while querying its stats
            return res.status(400).json({
                error: 1,
                code: 'upload.quotaExcced',
                message: 'You have used up all your storage space or today\'s bandwidth'
            });

        const filename = (new Date().toISOString().slice(0, 10) + '_' + crypto.randomUUID()) + fileSuffix;

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

        if (svResponse.error)
            return res.status(500).json({error: 1, code: 'uploadBigFile.error', message: svResponse.message});

        // no error occured
        await db('storage_items').insert({  // insert fileinfo into db
            filename: filename,
            size: svResponse.data.size,
            byUserId: req.user.id,
            fileId: svResponse.data.id,
        });
        await db('storage_quotas').update(quota).where({userId: quota.userId});  // write updated quota data back
        return res.status(201).json({
            success: 1, code: 'upload.success', data: {
                name: filename,
                size: svResponse.data.size,
                uploadUrl: svResponse.data.uploadUrl,
                expiredAt: svResponse.data.expiredAt
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * External Auth
 * The licensor needs to deposit a token and it should be long term
 * And returns a user-defined time identity token
 */
router.post('/externalAuth', verifyJWT, allowPrivileges(['root', 'admin', 'bot', 'dev', 'super']), [
    checkbody('id').isLength({min: 0}),
    // checkbody('username').optional().isString().trim().isLength({min: 1, max: 40}),
    checkbody('IS_USERINFO').optional().isBoolean(false),
    checkbody('EXPIRES_IN').optional({nullable: true}).isInt({min: 0}),
    checkbody('CALLBACK_LP').optional().isString().isLength({min: 1, max: 255}),
    checkbody('CALLBACK_PATH').optional().isString().isLength({min: 1})
], async (req, res, next) => {
    try {
        const {id, username, IS_USERINFO, EXPIRES_IN, CALLBACK_LP, CALLBACK_PATH} = req.body;

        const targetUser = await db('users').where({id}).first()
        if (!targetUser)
            res.status(401).json({
                error: 1,
                code: 'externalAuth.noSuchUser',
                message: 'there is no such user'
            })

        if (userHasRoles(req.user, ['bot']) && EXPIRES_IN <= 0 && EXPIRES_IN >= config.userTokenExpiresIn)
            res.status(401).json({
                error: 1,
                code: 'externalAuth.fail',
                message: `bot account the maximum time is: ${config.userTokenExpiresIn}`
            })

        let jwtpayload = {
                username: targetUser.username,
                userId: targetUser.id,
                privilege: targetUser.privilege,
                signWhen: Date.now(),
                visitType: 'external-auth',
                expiresIn: EXPIRES_IN,
                host: {address: req.REAL_IP}
            },
            targetUserJwttoken = jwt.sign(jwtpayload, config.secret, {
                expiresIn: EXPIRES_IN / 1000,  // second
            }),
            data = {
                licensorId: req.user.id,
                token: targetUserJwttoken,
            }

        // set User info
        if (IS_USERINFO) {
            const targetUserInfo = await got.get(`http://${config.address}:${config.port}/api/user/info?id=${targetUser.id}`).json()
            data = {data: {...data, ...targetUserInfo.data || {}}}
        }

        if (CALLBACK_PATH && !CALLBACK_LP && new URL(CALLBACK_PATH).protocol !== 'https:')
            res.status(401).json({
                error: 1,
                code: 'externalAuth.fail',
                message: 'You may have the following reasons:\n' +
                    '- If CALLBACK_PATH is configured, CALLBACK_LP must also be configured\n' +
                    '- The return address protocol must be https'
            })
        else if (CALLBACK_PATH && CALLBACK_LP)
            await got.post(CALLBACK_PATH, {body: data})

        res.status(200).json({
            success: 1,
            code: 'externalAuth.success',
            ...(CALLBACK_PATH && CALLBACK_LP ? {} : data)
        })
    } catch (e) {
        console.log(e)
        next(req)
    }
})

export default router;
