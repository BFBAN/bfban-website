import express from "express";
import moment from "moment"
import {body as checkbody, query as checkquery, validationResult} from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import {forbidPrivileges, verifyJWT} from "../middleware/auth.js";
import {allowPrivileges} from "../middleware/auth.js";
import {localeMessage, sendMessage} from "./message.js";
import {generatePassword, privilegeGranter, privilegeRevoker, userHasRoles} from "../lib/auth.js";
import {initUserStorageQuota, userDefaultAttribute, userSetAttributes} from "../lib/user.js";
import got from "got";
import {ServiceApiError} from "../lib/serviceAPI.js";
import * as misc from "../lib/misc.js";
import logger from "../logger.js";
import {siteEvent} from "../lib/bfban.js";
import {re} from "@babel/core/lib/vendor/import-meta-resolve.js";

const router = express.Router();

router.get('/searchUser', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkquery('name').isString(),
    checkquery('type').optional().isIn(['all', 'admin']),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('order').optional().isIn(['asc', 'desc']),
    checkquery('parameter').isIn(['id', 'username', 'originName', 'originPersonaId', 'originEmail']),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'searchUser.bad', message: validateErr.array()});

        const type = req.query.type !== undefined ? req.query.type : 'all';
        const skip = req.query.skip !== undefined ? req.query.skip : 0;
        const limit = req.query.limit !== undefined ? req.query.limit : 20;
        const order = req.query.order ? req.query.order : 'desc';
        const parameter = req.query.parameter ? req.query.parameter : 'username';

        let total;
        let result;

        switch (type) {
            case 'admin':
                result = await db.select('*').from('users')
                    .where('users.privilege', 'like', '%"admin"%')
                    .orWhere('users.privilege', 'like', '%"super"%')
                    .orWhere('users.privilege', 'like', '%"root"%')
                    .select('users.*', 'users.username', 'users.privilege')
                    .orderBy('users.createTime', order)
                    .offset(skip).limit(limit);

                total = await db.count({num: 1}).from('users')
                    .where('users.privilege', 'like', '%"admin"%')
                    .orWhere('users.privilege', 'like', '%"super"%')
                    .orWhere('users.privilege', 'like', '%"root"%')
                    .first().then(r => r.num);
                break;
            case 'all':
            default:
                result = await db.select('*').from('users')
                    .where(`users.${parameter}`, 'like', `%${req.query.name}%`)
                    .select('users.*', 'users.username', 'users.privilege')
                    .orderBy('users.createTime', order)
                    .offset(skip).limit(limit);

                total = await db.count({num: 1}).from('users')
                    .where(`users.${parameter}`, 'like', `%${req.query.name}%`)
                    .first().then(r => r.num);
        }

        if (result) {
            const now = new Date()
            result.forEach(i => {
                delete i.password;
                delete i.subscribes;
                if (i.attr.mute) {
                    const date = new Date(i.attr.mute)
                    if (date - now > 0) {
                        i.isMute = true
                    }
                }
                return i;
            });
        }

        return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'searchUser.ok',
            data: result,
            total
        });
    } catch (err) {
        next(err);
    }
});

router.get('/blockedUserAll', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('order').optional().isIn(['asc', 'desc']),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'admin.blockedUserAll.bad', message: validateErr.array()});

        const skip = req.query.skip !== undefined ? req.query.skip : 0;
        const limit = req.query.limit !== undefined ? req.query.limit : 20;
        const order = req.query.order ? req.query.order : 'desc';

        let total = await db.count({num: 1}).from('users')
            .where('users.valid', 0)
            .first().then(r => r.num);
        let result = await db.select('*').from('users')
            .where((qb) => {
                const key = 'users.privilege';
                qb.where('users.valid', 0).orWhere(key, 'like', '%"freezed"%').orWhere(key, 'like', '%"blacklisted"%')
            })
            .orderBy('users.id', order)
            .offset(skip).limit(limit);

        return res.status(200).json({success: 1, code: 'admin.blockedUserAll.ok', data: result, total});
    } catch (err) {
        next(err);
    }
});

router.get('/commentAppeal', verifyJWT, allowPrivileges(["super", "root", "dev", "bot"]), [
        // checkbody('type').optional().isString().isInt(['banAppeal']),
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0, max: 100}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.commentAll.bad', message: validateErr.array()});

            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';
            const type = 'banAppeal';

            const total = await db('comments')
                .count({num: 1})
                .andWhere(function () {
                    this.where({valid: 1});
                    if (type != 'all' || !type)
                        this.where({type: type});
                })
                .first().then(r => r.num);

            const result = await db.from('comments')
                .join('users', 'comments.byUserId', 'users.id')
                .select('comments.*', 'users.username', 'users.privilege')
                .andWhere(function () {
                    if (type != 'all' || !type)
                        this.where({type: type});
                })
                .orderBy('comments.createTime', order)
                .offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.valid;
                    return i
                }));

            return res.status(200).json({success: 1, code: 'admin.commentAll.ok', data: result, total});
        } catch (err) {
            next(err);
        }
    });

router.get('/commentAll', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
        checkbody('type').optional().isString().isInt(['report', 'reply', 'judgement', 'banAppeal']),
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0, max: 100}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.commentAll.bad', message: validateErr.array()});

            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';
            const type = req.query.type;

            const total = await db('comments')
                .count({num: 1})
                .andWhere(function () {
                    this.where({valid: 1});
                    if (type != 'all' || !type)
                        this.where({type: type});
                })
                .first().then(r => r.num);

            const result = await db.from('comments')
                .join('users', 'comments.byUserId', 'users.id')
                .select('comments.*', 'users.username', 'users.privilege')
                .andWhere(function () {
                    if (type != 'all' || !type)
                        this.where({type: type});
                })
                .orderBy('comments.createTime', order)
                .offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.valid;
                    return i
                }));

            return res.status(200).json({success: 1, code: 'admin.commentAll.ok', data: result, total});
        } catch (err) {
            next(err);
        }
    });

router.get('/CommentTypeList', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
        checkquery('type').optional().isString().isIn(['banAppeal', 'judgement']),
        checkquery('banAppealStats').optional().isString(),
        checkquery('judgeAction').optional().isString(),
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0, max: 100}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({
                    error: 1,
                    code: 'admin.CommentTypeList.bad',
                    message: validateErr.array()
                });

            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';
            const type = req.query.type;
            const banAppealStats = req.query.banAppealStats;
            const judgeAction = req.query.judgeAction;

            let totalQuery = db('comments')
                .count({num: 1})
                .where({'comments.valid': 1});

            let query = db.from('comments')
                .join('users', 'comments.byUserId', 'users.id')
                .select('comments.*', 'users.username', 'users.privilege')
                .where({'comments.valid': 1});

            if (type && type === 'banAppeal') {
                if (!banAppealStats) {
                    return res.status(400).json({
                        error: 1,
                        code: 'admin.CommentTypeList.bad',
                        message: 'banAppealStats is required'
                    });
                }
                totalQuery = totalQuery.andWhere({
                    'comments.type': 'banAppeal',
                    'comments.appealStatus': banAppealStats
                });
                query = query.andWhere({'comments.type': 'banAppeal', 'comments.appealStatus': banAppealStats});
            } else if (type && type === 'judgement') {
                if (!judgeAction) {
                    return res.status(400).json({
                        error: 1,
                        code: 'admin.CommentTypeList.bad',
                        message: 'judgeAction is required'
                    });
                }
                totalQuery = totalQuery.andWhere({'comments.type': 'judgement', 'comments.judgeAction': judgeAction});
                query = query.andWhere({'comments.type': 'judgement', 'comments.judgeAction': judgeAction});
            } else {
                return res.status(400).json({error: 1, code: 'admin.CommentTypeList.bad', message: 'Invalid type'});
            }

            const {num: total} = await totalQuery.first();

            const result = await query
                .orderBy('comments.createTime', order)
                .offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.valid;
                    return i;
                }));

            return res.status(200).json({success: 1, code: 'admin.CommentTypeList.ok', data: result, total});
        } catch (err) {
            next(err);
        }
    });

router.post('/setComment', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.content').isString().isLength({max: 65535}),
    checkbody('data.videoLink').optional().isURL().isLength({max: 255}),
    checkbody('data.isSpam').optional().isBoolean(),
    checkbody('data.valid').optional().isInt({min: 0, max: 1})
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'admin.setComment.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").Comment} */
        const isSpam = req.body.data.isSpam ? req.query.data.isSpam : false;
        const valid = req.body.data.valid ? req.query.data.valid : null;
        const comment = await db.select('*').from('comments').where({id: req.body.data.id}).first();
        if (!comment)
            return res.status(404).json({error: 1, code: 'admin.setComment.notFound'});

        await sendMessage(req.user.id, null, "command", JSON.stringify({action: 'setComment', target: comment.id}));

        if (req.body.data.content.length === 0 && !req.body.data.videoLink)
            await db('comments').delete().where({id: comment.id});
        else {
            comment.content = req.body.data.content;
            comment.videoLink = comment.type === 'report' ? (req.body.data.videoLink ? req.body.data.videoLink : comment.videoLink) : undefined;
            await db('comments').update({
                content: comment.content,
                videoLink: comment.videoLink
            }).where({id: comment.id});
        }

        if (valid != null) {
            await db('comments').update({
                valid: valid
            }).where({id: comment.id})
        }

        await db('operation_log').insert({
            byUserId: req.user.id,
            toUserId: comment.toPlayerId,
            action: 'edit',
            role: isSpam ? 'spam' : 'comment',
            createTime: new Date()
        });

        return res.status(200).json({success: 1, code: 'admin.setComment.ok'});
    } catch (err) {
        next(err);
    }
});

router.post('/setAppeal', verifyJWT, allowPrivileges(["super", "root", "dev", "admin"]), [
    checkbody('data.toPlayerId').isInt({min: 0})
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        /** @type {import("../typedef.js").Comment} */
        // const comment = await db.select('*').from('comments').where({id: req.body.id}).first();
        // if (!comment)
        //     return res.status(404).json({error: 1, code: 'admin.setAppeal.notFound'});
        // const player = await db.select('*').from('players').where({id: req.body.data.toPlayerId}).first();
        // await db('players').where('originPersonaId', commentItemPersonId.toOriginPersonaId).update({ appealStatus });
        // await sendMessage(req.user.id, null, "command", JSON.stringify({action: 'setAppeal', target: comment.id}));

        // const updateData = {
        //     admincontent: req.body.content,
        //     appealStatus: req.body.action
        // };
        // const comments = db('comments');
        // const commentItem = comments.where({id: comment.id});
        // const commentItemPersonId = await commentItem.first();

        // if (commentItemPersonId.appealStatus == 'accept')
        //     return res.status(400).json({error: 1, code: 'admin.setAppeal.repeatedPassage'});

        // let playerStatus = 0;
        // if (updateData.appealStatus === 'fail') playerStatus = 1;
        // if (updateData.appealStatus === 'accept') playerStatus = 3;

        // await commentItem.update(updateData);
        await db('players').where('originPersonaId', commentItemPersonId.toOriginPersonaId).update({appealStatus: '2'});
        await db('operation_log').insert({
            byUserId: req.user.id,
            toUserId: req.body.data.toPlayerId,
            action: 'edit',
            role: 'appeal',
            createTime: new Date()
        });

        return res.status(200).json({success: 1, code: 'admin.setAppeal.ok'});
    } catch (err) {
        next(err);
    }
});

router.post('/setUser', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.action').isIn(['grant', 'revoke']),
    checkbody('data.role').isIn(['normal', 'admin', 'bot', 'super', 'dev', 'volunteer', 'blacklisted', 'freezed'])
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'admin.setUser.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.body.data.id}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'admin.setUser.notFound'});
        const role = req.body.data.role;
        if (req.body.data.action === 'grant') {
            const devCan = ['normal', 'bot', 'blacklisted', 'freezed', 'volunteer'],
                superCan = ['normal', 'admin', 'blacklisted', 'freezed', 'volunteer'],
                rootCan = ['normal', 'admin', 'bot', 'super', 'dev', 'blacklisted', 'freezed', 'volunteer'];
            let flag = false;
            // check if current user can grant such permission
            flag = (userHasRoles(req.user, ['dev']) && devCan.includes(role)) ? true : flag;
            flag = (userHasRoles(req.user, ['super']) && superCan.includes(role)) ? true : flag;
            flag = (userHasRoles(req.user, ['root']) && rootCan.includes(role)) ? true : flag;
            // check if user trying to grant 'blacklisted' or 'freezed' role to someone who have higher permission
            flag = (['blacklisted', 'freezed'].includes(role) && user.privilege.filter(i => ['admin', 'super', 'dev', 'root'].includes(i)).length === 0) ? true : flag;
            if (flag)
                user.privilege = privilegeGranter(user.privilege, role);
            else
                return res.status(403).json({error: 1, code: 'admin.setUser.permissionDenied'});
        } else {    // revoke permission
            const devCanNot = ['dev', 'admin', 'super', 'root'],
                superCanNot = ['super', 'root', 'dev'],
                rootCanNot = ['root'];
            let flag = false;
            // check if current user can revoke such permission
            flag = (userHasRoles(req.user, ['dev']) && !devCanNot.includes(role)) ? true : flag;
            flag = (userHasRoles(req.user, ['super']) && !superCanNot.includes(role)) ? true : flag;
            flag = (userHasRoles(req.user, ['root']) && !rootCanNot.includes(role)) ? true : flag;
            if (flag)
                user.privilege = privilegeRevoker(user.privilege, role);
            else
                return res.status(403).json({error: 1, code: 'admin.setUser.permissionDenied'});
        }
        await sendMessage(req.user.id, null, "command", JSON.stringify({
            action: 'setUser',
            target: user.id,
            detail: `${req.body.data.action}:${role}`
        }));

        user.attr = JSON.stringify(user.attr)
        user.subscribes = JSON.stringify(user.subscribes)
        user.privilege = JSON.stringify(user.privilege)

        await db('users').update(user).where({id: user.id});
        const quota = initUserStorageQuota(user);
        await db('storage_quotas').update({
            totalStorageQuota: quota.totalStorageQuota,
            maxFileNumber: quota.maxFileNumber,
            maxTrafficQuota: quota.maxTrafficQuota
        }).where({userId: user.id});
        const {id, action} = req.body.data
        await db('operation_log').insert({
            byUserId: req.user.id,
            toUserId: id,
            action,
            role: req.body.data.role,
            createTime: new Date()
        });
        return res.status(200).json({success: 1, code: 'admin.setUser.ok'});
    } catch (err) {
        next(err);
    }
});

router.post('/judgementLog', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('userId').optional().isInt({min: 0}),
    checkbody('userName').optional().isString(),
    checkbody('dbId').optional().isInt({min: 0}),
    checkbody('createTimeFrom').optional().isInt({min: 0}),
    checkbody('createTimeTo').optional().isInt({min: 0}),
    checkbody('skip').optional().isInt({min: 0}),
    checkbody('limit').optional().isInt({min: 0, max: 100}),
    checkbody('order').optional().isIn(['asc', 'desc']),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'judgementLog.bad', message: validateErr.array()});

        const createTimeFrom = new Date(req.query.createTimeFrom ? req.query.createTimeFrom - 0 : 0);
        const createTimeTo = new Date(req.query.createTimeTo ? req.query.createTimeTo - 0 : Date.now());
        const skip = req.body.skip !== undefined ? req.body.skip : 0;
        const limit = req.body.limit !== undefined ? req.body.limit : 20;
        const order = req.body.order ? req.query.order : 'desc';

        const total = await db.count({num: 1}).from('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .where((qb) => {
                if (req.body.userId)
                    qb.where('comments.byUserId', '=', req.body.userId)
                if (req.body.dbId)
                    qb.where('comments.id', '=', req.body.dbId)
                if (req.body.userName)
                    qb.where('users.username', 'like', `%${req.body.userName}%`)
            })
            .andWhere('type', `judgement`)
            .andWhere('comments.createTime', '>=', createTimeFrom)
            .andWhere('comments.createTime', '<=', createTimeTo)
            .first().then(r => r.num);

        const result = await db('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .select('comments.*', 'users.username', 'users.privilege')
            .where((qb) => {
                if (req.body.userId)
                    qb.where('comments.byUserId', '=', req.body.userId)
                if (req.body.dbId)
                    qb.where('comments.id', '=', req.body.dbId)
                if (req.body.userName)
                    qb.where('users.username', 'like', `%${req.body.userName}%`)
            })
            .andWhere('type', `judgement`)
            .andWhere('comments.createTime', '>=', createTimeFrom)
            .andWhere('comments.createTime', '<=', createTimeTo)
            .orderBy('comments.createTime', order)
            .limit(limit).offset(skip);

        return res.status(200).json({success: 1, code: 'admin.log.ok', data: result, total});
    } catch (err) {
        next(err);
    }
});

router.get('/adminLog', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkquery('createTimeFrom').optional().isInt({min: 0}),
    checkquery('createTimeto').optional().isInt({min: 0}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0}),
    checkquery('order').optional().isIn(['asc', 'desc']),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const createTimeFrom = new Date(req.query.createTimeFrom);
        const createTimeto = new Date(req.query.createTimeto);
        const skip = req.query.skip !== undefined ? req.query.skip : 0;
        const limit = req.query.limit !== undefined ? req.query.limit : 20;
        const order = req.query.order ? req.query.order : 'desc';

        const result = await db('comments')
            .join('users', 'comments.byUserId', 'users.id')
            .join('players', 'comments.toOriginPersonaId', 'players.originPersonaId')
            .where('type', '!=', `report`).andWhere('type', '!=', `reply`)
            .select('comments.*', 'users.username', 'users.privilege', 'players.games', 'players.originName')
            .andWhere("comments.createTime", ">=", createTimeFrom)
            .andWhere("comments.createTime", "<=", createTimeto)
            .orderBy('users.createTime', order)
        // .offset(skip).limit(limit);

        return res.status(200).json({success: 1, code: 'admin.log.ok', data: result});
    } catch (err) {
        next(err);
    }
});

router.get('/chatLog', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
    checkquery('order').optional().isIn(['asc', 'desc']),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const skip = req.query.skip !== undefined ? req.query.skip : 0;
        const limit = req.query.limit !== undefined ? req.query.limit : 20;
        const order = req.query.order ? req.query.order : 'desc';

        const total = await db.count({num: 1}).from('messages').first().then(r => r.num);

        const result = await db('messages')
            .orderBy('messages.createTime', order)
            .offset(skip).limit(limit);

        return res.status(200).json({success: 1, code: 'admin.chatLog.ok', data: result, total,});
    } catch (err) {
        next(err);
    }
});

router.get('/userOperationLogs', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
        checkquery('id').optional().isString(),
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({
                    error: 1,
                    code: 'admin.userOperationLogs.bad',
                    message: validateErr.array()
                });

            const id = req.query.id;
            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';

            const result = await db.from('operation_log')
                .join('users', 'operation_log.byUserId', 'users.id')
                .select('operation_log.*', 'users.username', 'users.id')
                .where('users.id', id)
                .orderBy('operation_log.createTime', order)
                .offset(skip).limit(limit);

            // const result = await db.select(
            //     'useTab1.username as adminName',
            //     'useTab2.username as userName',
            //     'operation_log.action',
            //     'operation_log.role',
            //     'operation_log.byUserId',
            //     'operation_log.toUserId',
            //     'operation_log.createTime'
            // )
            //     .from('operation_log')
            //     .leftJoin('users as useTab1', 'operation_log.byUserId', 'useTab1.id')
            //     .leftJoin('users as useTab2', 'operation_log.toUserId', 'useTab2.id')
            //     .where('useTab2.id', id)
            //     .orderBy('operation_log.createTime', order)
            //     .offset(skip).limit(limit);

            return res.status(200).json({success: 1, code: 'admin.userOperationLogs.ok', data: result});
        } catch (err) {
            next(err);
        }
    });

router.post('/setUserAttr', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
    checkbody('data.id').isInt({min: 0}),
    checkbody('data.attr').isObject(),
    checkbody('data.username').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 1, max: 40})
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'admin.setUserAttr.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const userData = await db.select('*').from('users').where({id: req.body.data.id}).first();
        if (!userData)
            return res.status(404).json({error: 1, code: 'setUserAttr.notUser'});
        let doEditUserData = {};
        doEditUserData.attr = JSON.stringify(userSetAttributes(userData.attr, req.body.data.attr, true));

        // change UserName
        if (req.body.data.username !== undefined)
            doEditUserData.username = req.body.data.username;

        // Set userIntroduction
        if (req.body.data.attr && req.body.data.attr.userIntroduction !== undefined)
            doEditUserData.introduction = req.body.data.attr.userIntroduction;

        await sendMessage(req.user.id, null, "command", JSON.stringify({action: 'setUserAttr', target: userData.id}));
        await db('users').update(doEditUserData).where({id: userData.id});
        await db('operation_log').insert({
            byUserId: req.user.id,
            toUserId: userData.id,
            action: 'edit',
            role: 'user',
            createTime: new Date()
        });

        return res.status(200).json({success: 1, code: 'admin.setUserAttr.ok'});
    } catch (err) {
        next(err);
    }
});

router.post('/addUser', verifyJWT, allowPrivileges(["super", "root", "dev"]), [
        checkbody('data.username').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 1, max: 40}),
        checkbody('data.password').isString().trim().isLength({min: 1, max: 40}),
        checkbody('data.language').isIn(config.supportLanguages)
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.addUser.bad', message: validateErr.array()});

            // all data well-formed, ready to flight
            /** @type {{username:string, password:string, originName:string, originEmail:string}} */
            const {username, password, originName, originEmail} = req.body.data;

            // does anyone occupied?
            if ((await db.select('username').from('verifications').where({username: username, type: 'register'}).union([
                db.select('username').from('users').where({username: username})
            ])).length !== 0)
                return res.status(400).json({error: 1, code: 'admin.addUser.usernameExist'});

            // no mistakes detected, generate a unique string for register validation
            const randomStr = misc.generateRandomString(127);
            const passwdHash = await generatePassword(password);
            await db('verifications').insert({
                type: 'register',
                username: username,
                uniqCode: randomStr,
                password: passwdHash,
                originName: "",
                originEmail: "",
                originUserId: "",
                originPersonaId: "",
                expiresTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4h
                createTime: new Date()
            });

            // on verifications data
            const registrant = await db.select('*')
                .from('verifications')
                .where({uniqCode: randomStr}).first();
            if (!registrant)
                return res.status(404).json({error: 1, code: 'admin.addUser.notFound'});
            if (registrant.expiresTime < new Date())
                return res.status(400).json({error: 1, code: 'admin.addUser.expired'});

            const userData = {
                username: registrant.username,
                password: registrant.password,
                originName: registrant.originName,
                originEmail: registrant.originEmail,
                originUserId: registrant.originUserId,
                originPersonaId: registrant.originPersonaId,
                privilege: JSON.stringify(['normal']),
                attr: JSON.stringify(userDefaultAttribute(req.REAL_IP, req.headers["accept-language"] || req.query.lang)),
                createTime: new Date(),
                updateTime: new Date(),
            };

            await db('users').insert(userData);
            await db('verifications').where({uniqCode: randomStr}).delete();

            logger.info('admin.addUser.signupNoVerify Success:', {name: userData.username});
            siteEvent.emit('action', {method: 'register', params: {user: userData}});
            await db('operation_log').insert({
                byUserId: req.user.id,
                toUserId: userData.id,
                action: 'add',
                role: 'user',
                createTime: new Date()
            });
            return res.status(201).json({success: 1, code: 'admin.addUser.success', message: 'add User Success!'});
        } catch (err) {
            if (err instanceof ServiceApiError) {
                logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
                return res.status(err.statusCode === 501 ? 501 : 500).json({
                    error: 1,
                    code: err.statusCode === 501 ? 'admin.addUser.notImplement' : 'admin.addUser.error',
                    message: err.message
                });
            }
            next(err);
        }
    });

router.get('/muteUserAll', verifyJWT, allowPrivileges(["root", "dev", "super", "admin"]), [
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0, max: 100}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.muteUserAll.bad', message: validateErr.array()});

            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';

            const total = await db.count({num: 1}).from('users')
                .whereJsonPath('users.attr', '$.mute', '!=', '')
                .first().then(r => r.num);
            const result = await db.from('users')
                .whereJsonPath('users.attr', '$.mute', '!=', '')
                .orderBy('users.createTime', order)
                .offset(skip).limit(limit);

            return res.status(200).json({success: 1, code: 'admin.muteUserAll.ok', data: result, total});
        } catch (err) {
            next(err);
        }
    });

router.post('/muteUser', verifyJWT, allowPrivileges(["root", "dev", "super", "admin"]), [
        checkbody('data.id').optional().isInt(),
        checkbody('data.value').optional().isInt(),
        checkbody('isNotice').optional().isBoolean(),
        checkbody('language').isIn(config.supportLanguages)
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.muteUser.ban.bad', message: validateErr.array()});
            if (req.body.data.value === undefined)
                return res.status(401).json({
                    error: 1,
                    code: 'admin.muteUser.ban.bad',
                    message: '"value" cannot be missing'
                });
            if (req.body.data.type === undefined)
                return res.status(401).json({
                    error: 1,
                    code: 'admin.muteUser.ban.bad',
                    message: '"type" cannot be missing'
                });
            if (req.body.isNotice === undefined)
                return res.status(401).json({
                    error: 1,
                    code: 'muteUser.ban.bad',
                    message: '"isNotice" cannot be missing'
                });

            const {id} = req.body.data;
            const userData = await db.select('*').from('users').where({id}).first();
            const disableOperateUser = ['super', 'dev', 'root', 'admin'] // Please be consistent with 'allowPrivileges' above
            const itemUser = disableOperateUser.some(item => userData.privilege.includes(item))

            // Check User authority
            if (itemUser) return res.status(402).json({
                error: 1,
                code: 'muteUser.ban.userUnauthorized',
                message: `this user cannot operate`
            });
            if (req.user.id === id) res.status(402).json({
                error: 1,
                code: 'muteUser.ban.userUnauthorized',
                message: `You can't shut yourself down`
            });

            let doEditUserData = {};
            switch (req.body.data.type) {
                case 'add': {
                    const min = 1000 * 60, hours = min * 60, day = hours * 24, month = day * 30
                    const type = [min * 10, hours * 1, 12 * hours, 1 * day, 7 * day, 1 * month]
                    const time = +(new Date()) + type[req.body.data.value]
                    const banTime = moment(time).format('YYYY-MM-DD HH:mm:ss')
                    userData.attr.mute = banTime

                    // Send notification or not
                    if (req.body.isNotice && req.body.language)
                        await sendMessage(req.user.id, id, 'warn', await localeMessage('notifications.beMuteUser', req.body.language, {}));
                    break
                }
                case 'remove': {
                    userData.attr.mute = ""
                    break
                }
            }

            doEditUserData.attr = JSON.stringify(userSetAttributes(userData.attr, userData.attr, true));

            await db('users').update(doEditUserData).where({id: userData.id});
            await db('operation_log').insert({
                byUserId: req.user.id,
                toUserId: userData.id,
                action: req.body.data.type,
                role: 'mute',
                createTime: new Date()
            });

            return res.status(200).json({success: 1, message: 'Successful operation', code: 'admin.muteUser.ok'});
        } catch (err) {
            next(err);
        }
    });

router.post('/delUser', verifyJWT, allowPrivileges(["root", "dev"]), [
        checkbody('data.id').optional().isInt(),
        checkbody('data.type').isIn(['logic', 'real', 'restore'])
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);

            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'admin.delUser.bad', message: validateErr.array()});
            if (req.body.data.type === undefined)
                return res.status(401).json({error: 1, code: 'admin.delUser.bad', message: '"type" cannot be missing'});
            if (req.body.data.id === req.user.id)
                return res.status(400).json({
                    error: 1,
                    code: 'admin.delUser.bad',
                    message: 'unable to operate oneself'
                });

            const {id, type} = req.body.data;
            const userDb = db('users');

            switch (type) {
                case "logic":
                    await userDb.update({
                        valid: 0,
                    }).where({id: id});
                    break;
                case "restore":
                    await userDb.update({
                        valid: 1,
                    }).where({id: id});
                    break;
                case "real":
                    await userDb.where({id: id}).delete();
                    break;
            }

            await db('operation_log').insert({
                byUserId: req.user.id,
                toUserId: id,
                action: `edit_${req.body.data.type}`,
                role: 'user',
                createTime: new Date()
            });

            return res.status(201).json({success: 1, code: 'admin.delUser.success', message: 'success'});
        } catch (err) {
            next(err);
        }
    });

router.get('/verifications', verifyJWT, allowPrivileges(['dev', 'root']), [
        checkquery('skip').optional().isInt({min: 0}),
        checkquery('limit').optional().isInt({min: 0, max: 100}),
        checkquery('order').optional().isIn(['asc', 'desc']),
    ],
    async (req, res, next) => {
        try {
            const validateErr = validationResult(req);
            if (!validateErr.isEmpty())
                return res.status(400).json({error: 1, code: 'verifications.bad', message: validateErr.array()});

            const skip = req.query.skip !== undefined ? req.query.skip : 0;
            const limit = req.query.limit !== undefined ? req.query.limit : 20;
            const order = req.query.order ? req.query.order : 'desc';

            const total = await db.count({num: 1}).from('verifications')
                .first().then(r => r.num);
            const result = await db.from('verifications')
                .orderBy('verifications.createTime', order)
                .offset(skip).limit(limit)
                .then(r => r.map(i => {
                    delete i.password;
                    return i
                }));

            return res.status(200).json({success: 1, code: 'verifications.ok', data: result, total});
        } catch (err) {
            next(err);
        }
    });

router.get('/msGraphStatus', verifyJWT, allowPrivileges(['root']),
    /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
    async (req, res, next) => {
        try {
            const svResponse = await got(`${config.services.msGraphAPI.url}/status`, {
                throwHttpErrors: false,
                resolveBodyOnly: true
            }).json();
            return res.status(200).json(svResponse);
        } catch (err) {
            next(err);
        }
    });

router.get('/msGraphInit', verifyJWT, allowPrivileges(['root']),
    /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
    async (req, res, next) => {
        try {
            const redirectUrl = await got(`${config.services.msGraphAPI.url}/msLogin`, {
                followRedirect: false,
            });
            return res.status(200).json({success: 1, code: 'msGraphInit.redirect', data: redirectUrl.headers.location});
        } catch (err) {
            next(err);
        }
    });

router.post('/msGraphAuthCode', verifyJWT, allowPrivileges(['root']), [
    checkbody('data.code').isString()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction) } */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'setUserAttr.bad', message: validateErr.array()});

        const svResponse = await got(`${config.services.msGraphAPI.url}/msAuthCallBack?code=${req.body.data.code}`, {
            throwHttpErrors: false,
            resolveBodyOnly: true,
        }).json();

        return res.status(svResponse.success ? 200 : 500).json(svResponse);
    } catch (err) {
        next(err);
    }
});

//router.post('/msGraphDeleteFile', verifyJWT, allowPrivileges(['root', 'super']));
//router.post('/msGraphModifyLink', verifyJWT, allowPrivileges(['root', 'super']));
export default router;
