"use strict";
import express from "express";
import jwt from "jsonwebtoken";
import {body as checkbody, query as checkquery, validationResult} from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import {getGravatarAvatar} from "../lib/gravatar.js";
import {sendBindingOriginVerify, sendForgetPasswordVerify, sendRegisterVerify} from "../lib/mail.js";
import {
    allowPrivileges,
    forbidPrivileges,
    forbidVisitTypes,
    verifyAllowPrivilege,
    verifyJWT
} from "../middleware/auth.js";
import {comparePassword, generatePassword, privilegeRevoker, userHasRoles} from "../lib/auth.js";
import {userDefaultAttribute, userSetAttributes, userShowAttributes} from "../lib/user.js";
import {totalAachievementExp} from "./user_achievements.js"
import {siteEvent} from "../lib/bfban.js";
import logger from "../logger.js";
import serviceApi, {ServiceApiError} from "../lib/serviceAPI.js";

const router = express.Router();

/**
 * @swagger
 * /api/user/signup:
 *   post:
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: data.username
 *         required: true
 *         type: string
 *         value:
 *       - name: data.password
 *         required: true
 *         type: string
 *         value:
 *       - name: data.originEmail
 *         required: true
 *         type: string
 *         value:
 *       - name: data.originName
 *         required: true
 *         type: string
 *         value:
 */
router.post('/signup', [
    checkbody('data.username').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 1, max: 40}),
    checkbody('data.password').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().unescape().trim().notEmpty(),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});

        // all data well-formed, ready to flight
        /** @type {{username:string, password:string, originName:string, originEmail:string}} */
        const {username, password, originName, originEmail} = req.body.data;

        // does anyone occupy
        if ((await db.select('username').from('verifications').where({username: username, type: 'register'}).union([
            db.select('username').from('users').where({username: username})
        ])).length !== 0)
            return res.status(400).json({error: 1, code: 'signup.usernameExist'});

        // now check the origin account user bound
        const originUserId = await serviceApi('eaAPI', '/searchUser').query({email: originEmail}).get().then(r => r.data);
        if (!originUserId)
            return res.status(400).json({error: 1, code: 'signup.originNotFound'});
        const originUserInfo = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r => r.data);
        if (originUserInfo.username !== originName) // verify again
            return res.status(400).json({error: 1, code: 'signup.usernameMismatch'});
        if ((await db.select('originUserId').from('verifications').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ])).length !== 0)
            return res.status(400).json({error: 1, code: 'signup.originBindingExist'});

        // no mistakes detected, generate a unique string for register validation
        const randomStr = misc.generateRandomString(127);
        const passwdHash = await generatePassword(password);
        await db('verifications').insert({
            type: 'register',
            username: username,
            uniqCode: randomStr,
            password: passwdHash,
            originName: originName,
            originEmail: originEmail,
            originUserId: originUserId,
            originPersonaId: originUserInfo.personaId,
            expiresTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4h
            createTime: new Date()
        });
        let language = req.headers["accept-language"]
        language = language === 'zh-CN' ? language : 'en-US'
        await sendRegisterVerify(username, originName, originEmail, language, randomStr);
        logger.info('users.signup Success:', {username, originName, originEmail, randomStr});
        return res.status(201).json({success: 1, code: 'signup.needVerify', message: 'Verify Email to join BFBan!'});
    } catch (err) {
        if (err instanceof ServiceApiError) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
            // 检查是否是404错误并返回特定的400错误响应
            if (err.statusCode === 404) {
                return res.status(400).json({
                    error: 1,
                    code: 'signup.originNotFound'
                });
            }
            return res.status(err.statusCode === 501 ? 501 : 500).json({
                error: 1,
                code: err.statusCode === 501 ? 'signup.notImplement' : 'signup.error',
                message: err.message
            });
        }
        next(err);
    }
});

router.get('/signupVerify', [
    checkquery('code').isString().notEmpty(),
    checkquery('lang').isIn(config.supportLanguages)
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});

        const code = req.query.code;
        const registrant = await db.select('*').from('verifications').where({uniqCode: code}).first();
        if (!registrant)
            return res.status(404).json({error: 1, code: 'signup.notFound'});
        if (registrant.expiresTime < new Date()) {
            await db('verifications').where({uniqCode: code}).delete();
            return res.status(400).json({error: 1, code: 'signup.expired'});
        }
        let data
        if (registrant.userId) {
            data = {
                originName: registrant.originName,
                originEmail: registrant.originEmail,
                originUserId: registrant.originUserId,
                originPersonaId: registrant.originPersonaId,
                updateTime: new Date()
            };
            await db('users').update(data).where({id: registrant.userId});
        } else {
            data = {
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
            await db('users').insert(data);
        }

        await db('verifications').where({uniqCode: code}).delete();
        logger.info('users.signupVerify Success:', {name: data.username});

        siteEvent.emit('action', {method: 'register', params: {user: data}});
        return res.status(201).json({success: 1, code: 'signup.success', message: 'Welcome to BFBan!'});
    } catch (err) {
        next(err);
    }
});

router.post('/signin4comm', verifyCaptcha, verifyJWT, allowPrivileges(['dev']),
/** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signin.bad', message: validateErr.array()});

        const {username, password} = req.body.data;
        req.user = await db.select('*')
            .from('users')
            .where({username: username}).orWhere({originEmail: username}).first();
        const user = req.user;

        if (user && user.valid !== 0 && await comparePassword(password, user.password)) {
            return res.status(200).json({
                success: 1,
                code: 'signin.success',
                data: {
                    username: user.username,
                    userid: user.id,
                    usermail: user.originEmail
                },
                message: 'Login Verify Success',
            });
        } else {
            return res.status(401).json({
                error: 1,
                code: 'signin.noSuchUser',
                message: 'User not found or password mismatch'
            });
        }
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/user/signin:
 *   post:
 *     description: Account login
 *     tags:
 *       - user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             example:
 *               data:
 *                 username: admin
 *                 password: test
 *                 captcha: ABCD
 *                 encryptCaptcha: ABCD...ZY
 *             properties:
 *               data:
 *                 required: true
 *                 type: object
 *                 properties:
 *                   username:
 *                     required: true
 *                     type: string
 *                     description: User name, please note the required format
 *                     example: admin
 *                   password:
 *                     required: true
 *                     type: string
 *                     example: test
 *                   visitType:
 *                     required: false
 *                     example: websites
 *                     schema:
 *                       type: string
 *                       enum: [websites, client-phone, client-desktop, bot]
 *                     description: >
 *                       Sort order:
 *                        * `websites` - Default, website login, PWD, etc
 *                        * `client-phone` - Mobile device client
 *                        * `client-desktop` - Desktop device client
 *                        * `bot` - Bot
 *                   EXPIRES_IN:
 *                     required: false
 *                     description: Tells the server when the account token expires; it only takes effect for a specified number of account identities
 *                     type: number
 *                     example: 2.220446049250313e-16
 *                   captcha:
 *                     required: false
 *                     type: string
 *                   encryptCaptcha:
 *                     required: false
 *                     type: string
 *               SKIP_CAPTCHA:
 *                 required: false
 *                 type: boolean
 *                 description: Global parameter that allows specific identities to skip captCHA
 *                 value: false
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             example:
 *               success: 1
 *               code: signin.success
 *               message: Welcome back.
 *       400:
 *         description: signin.bad
 *       401:
 *         description: signin.noSuchUser
 */
router.post('/signin', verifyAllowPrivilege, verifyCaptcha, [
    checkbody("data.username").isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.password').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.visitType').optional().isIn(config.visitType ?? ['websites', 'client-phone', 'client-desktop', 'bot']),
    checkbody('data.EXPIRES_IN').optional({nullable: true}).isInt({min: 0})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signin.bad', message: validateErr.array()});

        const {username, password, EXPIRES_IN} = req.body.data;
        /** @type {import("../typedef.js").User} */
        const user = req.user;

        if (user && user.valid !== 0 && await comparePassword(password, user.password)) {
            let expiresIn = config.userTokenExpiresIn;
            if (EXPIRES_IN && userHasRoles(user, ['dev', 'bot']))
                expiresIn = EXPIRES_IN - 0;
            const jwtpayload = {
                username: user.username,
                userAvatar: user.originEmail ? getGravatarAvatar(user.originEmail) : null,
                userId: user.id,
                privilege: user.privilege,
                signWhen: Date.now(),
                visitType: req.body.data.visitType || config.defaultVisit || 'websites',
                expiresIn: expiresIn,
            };
            const jwttoken = jwt.sign(jwtpayload, config.secret, {
                expiresIn: expiresIn / 1000,  // second
            });
            user.attr.lastSigninIP = req.REAL_IP;
            await db('users').update({updateTime: new Date(), attr: JSON.stringify(user.attr)}).where({id: user.id});
            logger.info('users.login Success:', {
                name: user.username,
                ip: req.REAL_IP,
                visitType: jwtpayload.visitType,
                token: jwttoken
            });

            return res.status(200).json({
                success: 1,
                code: 'signin.success',
                data: {userinfo: jwtpayload, token: jwttoken},
                message: 'Welcome back.',
            });
        } else {
            return res.status(401).json({
                error: 1,
                code: 'signin.noSuchUser',
                message: 'User not found or password mismatch'
            });
        }
    } catch (err) {
        next(err);
    }
});

router.post('/bindOrigin', verifyJWT, forbidPrivileges(['blacklisted']), verifyCaptcha, [
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().trim().notEmpty()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: validateErr.array()});

        const {originEmail, originName} = req.body.data;
        const originUserId = await serviceApi('eaAPI', '/searchUser').query({email: originEmail}).get().then(r => r.data);
        if (!originUserId)
            return res.status(400).json({error: 1, code: 'bindOrigin.originNotFound'});
        const originUserInfo = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r => r.data);
        if (originUserInfo.username.toLowerCase() !== originName.toLowerCase()) // verify
            return res.status(400).json({error: 1, code: 'bindOrigin.originNotFound'});

        if ((await db.from('verifications').select('originUserId').where({originUserId: originUserId}).union([
            db.from('users').select('originUserId').where({originUserId: originUserId}) // check duplicated binding
        ])).length !== 0)
            return res.status(400).json({error: 1, code: 'bindOrigin.originBindingExist'});

        // check duplicated binding
        if (await db.from('verifications').select('originUserId').where({originUserId: originUserId}).first().length > 0) {
            return res.status(400).json({error: 1, code: 'bindOrigin.originBindingExist'});
        }

        // no mistakes detected, generate code for verify
        const code = misc.generateRandomString(127);
        await db('verifications').insert({
            type: 'binding',
            userId: req.user.id,
            uniqCode: code,
            originName: originName,
            originEmail: originEmail,
            originUserId: originUserId,
            originPersonaId: originUserInfo.personaId,
            expiresTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4h
            createTime: new Date()
        });
        let language = req.headers["accept-language"]
        language = language === 'zh-CN' ? language : 'en-US'
        await sendBindingOriginVerify(req.user.username, originEmail, language, encodeURIComponent(code));

        logger.info('users.bindOrigin#1 Success:', {name: req.user.username, email: originEmail});
        res.status(200).json({
            success: 1,
            code: 'bindOrigin.needVerify',
            message: 'check your email to complete the verification.'
        });
    } catch (err) {
        if (err instanceof ServiceApiError) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode > 0 ? err.stack : '');
            return res.status(err.statusCode === 501 ? 501 : 500).json({
                error: 1,
                code: err.statusCode === 501 ? 'bindOrigin.notImplement' : 'bindOrigin.error',
                message: err.message
            });
        }
        next(err);
    }
});

router.get('/bindOriginVerify', verifyJWT, [
    checkquery('code').isString()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: validateErr.array()});

        const code = req.query.code;
        const binding = await db.select('*').from('verifications').where({uniqCode: code, userId: req.user.id}).first();
        if (!binding)
            return res.status(400).json({error: 1, code: 'bindOrigin.notFound'});
        if (binding.expiresTime < new Date())
            return res.status(400).json({error: 1, code: 'bindOrigin.expired'});

        await db('users').update({
            originName: binding.originName,
            originUserId: binding.originUserId,
            originPersonaId: binding.originPersonaId,
            originEmail: binding.originEmail,
            privilege: JSON.stringify(privilegeRevoker(req.user.privilege, req.user.attr.freezeOfNoBinding ? 'freezed' : '')),
        }).where({id: req.user.id});
        await db('verifications').delete().where({uniqCode: code});

        logger.info('users.bindOrigin#2 Success:', {name: req.user.username, email: binding.originEmail});
        res.status(200).json({success: 1, code: 'bindOrigin.success', message: 'bind origin successfully.'});
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/user/signout:
 *   post:
 *     security:
 *       - appToken: []
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 */
router.post('/signout', verifyJWT, /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const result = await db('users').update({signoutTime: new Date()}).where({id: req.user.id});
        if (!result)
            return res.status(401).json({error: 1, code: 'logout.bad'});

        return res.status(200).json({success: 1, code: 'logout.success', message: 'bye~'});
    } catch (err) {
        next(err);
    }
});

/** @param {express.Request&import("../typedef.js").ReqUser?} req @param {express.Response} res @param {express.NextFunction} next
 * @param res
 * @param next
 */
async function showUserInfo(req, res, next) {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'userInfo.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.from('users').where({id: req.query.id, valid: 1}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'userInfo.notFound', message: 'no such user.'});
        const reportNum = await db('comments')
            .select('comments.byUserId', 'comments.type')
            .count({num: 'id'}, {method: 'estimate'})
            .where({byUserId: user.id, type: 'report'})
            .first().then(r => r.num);
        let statusNum = {};
        let promisesStatusNum = [];
        for (const status of [0, 1, 4]) {
            promisesStatusNum.push(db('comments')
                .join('players', 'comments.toPlayerId', 'players.id')
                .select('players.status as status')
                .countDistinct({num: 'players.id'})
                .where({'comments.byUserId': user.id, "comments.type": 'report', 'players.status': status})
                .first()
                .then(r => r.num)
                .then((r) => {
                    return {[status]: r}
                })
            )
        }
        const statusNumResult = await Promise.all(promisesStatusNum);
        statusNumResult.forEach(i => statusNum = Object.assign(statusNum, i));
        const data = {
            id: user.id,
            userAvatar: user.originEmail ? getGravatarAvatar(user.originEmail) : null,
            username: user.username,
            userAchievementExp: user.attr.showAchievement ? totalAachievementExp(req.user) : null,
            privilege: user.privilege,
            joinTime: user.createTime,
            lastOnlineTime: user.updateTime,
            subscribes: (req.user && req.user.id === user.id) ? user.subscribes : null,
            origin: user.attr.showOrigin === true // user set it public
            || (req.user && userHasRoles(req.user, ['admin', 'super', 'root', 'dev'])) // no limit for admin
            || (req.user && req.user.id === user.id) ? // for self
                {originName: user.originName, originUserId: user.originUserId} : null,
            attr: userShowAttributes(user.attr,
                (req.user && req.user.id === user.id), // self, show private info
                (req.user && userHasRoles(req.user, ['admin', 'super', 'root', 'dev']))), // no limit for admin
            reportNum: reportNum,
            statusNum: statusNum,
        };
        if (!user.attr.showAchievement) {
            delete data.attr.achievements;
            delete data.userAchievementExp;
        }

        return res.status(200).setHeader('Cache-Control', 'public, max-age=30').json({
            success: 1,
            code: 'userInfo.success',
            data: data
        });
    } catch (err) {
        next(err);
    }
}

/**
 * @swagger
 * /api/user/info:
 *   get:
 *     security:
 *       - appToken: []
 *     tags:
 *       - user
 *     description: Query and report player
 *     produces:
 *       - application/json
 */
router.get('/info', [checkquery('id').isInt({min: 0})], showUserInfo);
router.get('/info4admin', verifyJWT, allowPrivileges(['super', 'root', 'dev']), [
    checkquery('id').isInt({min: 0})
], showUserInfo);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     security:
 *       - appToken: []
 *     tags:
 *       - user
 *     produces:
 *       - application/json
 */
router.get('/me', verifyJWT, (req, res, next) => {
    req.query.id = '' + req.user.id;
    return next();
}, showUserInfo);

/**
 * @swagger
 * /api/user/reports:
 *   get:
 *     tags:
 *       - user
 *     description: Get a list of players reported by users on the site
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: id
 *         required: true
 *         type: string
 *         minLength: 0
 *       - name: skip
 *         type: integer
 *         in: query
 *         value: 0
 *         minimum: 0
 *       - name: limit
 *         type: integer
 *         in: query
 *         value: 20
 *         minimum: 0
 *         maximum: 100
 *     responses:
 *       200: userReports.notFound
 *       400: userReports.bad
 *       404: userReports.success
 */
router.get('/reports', [
    checkquery('id').isInt({min: 0}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'userReports.bad', message: validateErr.array()});

        const skip = req.query.skip ? req.query.skip : 0;
        const limit = req.query.limit ? req.query.limit : 0;

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.query.id}).first();
        if (!user)
            return res.status(404).json({error: 1, code: 'userReports.notFound', message: 'no such user.'});
        const total = await db('comments').count({num: 1})
            .where({'comments.byUserId': user.id, type: 'report'})
            .first().then(r => r.num);
        const reports = await db('comments').join('players', 'comments.toPlayerId', 'players.id')
            .select('players.originName as originName', 'players.originUserId as originuserId',
                'players.originPersonaId as originPersonaId', 'players.status as status',
                'players.updateTime as updateTime', 'comments.createTime as createTime',
                'players.avatarLink as avatarLink')
            .where({'comments.byUserId': user.id, type: 'report'})
            .orderBy('comments.createTime', 'desc').offset(skip * limit).limit(limit);

        res.status(200).json({success: 1, code: 'userReports.success', data: reports, total});
    } catch (err) {
        next(err);
    }
});

router.post('/me', verifyJWT, forbidPrivileges(['blacklisted']), forbidVisitTypes(['bot', 'external-auth']), [
    checkbody('data.subscribes').optional({nullable: true}).isArray().isLength({max: 100}).custom((val) => {
        for (const i of val)
            if (Number.isNaN(parseInt(i)) || parseInt(i) < 0)
                throw new Error('Bad input');
        return true;
    }),
    checkbody('data.attr').optional({nullable: true}).isObject(),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'me.bad', message: validateErr.array()});

        const update = {};

        if (req.body.data.subscribes)
            update.subscribes = JSON.stringify(req.body.data.subscribes.map(i => i - 0)); // to number
        if (req.body.data.attr)
            update.attr = JSON.stringify(userSetAttributes(req.user.attr, req.body.data.attr));

        await db('users').update(update).where({id: req.user.id});

        res.status(200).json({success: 1, code: 'me.success', data: update});
    } catch (err) {
        next(err);
    }
});

router.post('/changeName', verifyJWT, forbidPrivileges(['blacklisted']), forbidVisitTypes(['bot', 'external-auth']), verifyCaptcha, [
    checkbody('data.newname').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 1, max: 40}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'changeName.bad', message: validateErr.array()});

        const attr = req.user.attr;
        if (!attr.changeNameLeft && attr.changeNameLeft <= 0)
            return res.status(403).json({
                error: 1,
                code: 'changeName.noChance',
                message: 'you have used up all your change name chances.'
            });
        const occupy = await db.select('createTime').from('users').where({username: req.body.data.newname}).union([
            db.select('createTime').from('users').where({username: req.body.data.newname})
        ]);
        if (occupy.length > 0)
            return res.status(403).json({
                error: 1,
                code: 'changeName.occupied',
                message: 'someone already occupied your new name.'
            });
        --attr.changeNameLeft;
        await db('users').update({
            username: req.body.data.newname,
            attr: JSON.stringify(attr)
        }).where({id: req.user.id});
        return res.status(200).json({
            success: 1, code: 'changeName.success', data: {
                chancesLeft: attr.changeNameLeft
            }
        });
    } catch (err) {
        next(err);
    }
});

router.post('/changePassword', verifyJWT, forbidVisitTypes(['bot', 'external-auth']), [
    checkbody('data.newpassword').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.oldpassword').isString().trim().isLength({min: 1, max: 40})
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'changePassword.bad', message: validateErr.array()});

        const user = req.user
        if (!await comparePassword(req.body.data.oldpassword, user.password))
            return res.status(400).json({
                error: 1,
                code: 'changePassword.notMatch',
                message: 'original password incorrect.'
            });
        await db('users').update({
            password: await generatePassword(req.body.data.newpassword),
            signoutTime: new Date()
        }).where({id: user.id});

        return res.status(200).json({
            success: 1,
            code: 'changePassword.success',
            message: 'You need a Re-login to finish this process'
        });
    } catch (err) {
        next(err);
    }
});

router.post('/forgetPassword', verifyCaptcha, [
    checkbody('data.username').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.originEmail').trim().isEmail(),
    checkbody('data.language').isIn(config.supportLanguages)
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: validateErr.array()});
        const {username} = req.body.data;

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({username: username}).orWhere({originName: username}).first();
        if (userHasRoles(user, ['blacklisted']))
            return res.status(403).json({
                error: 1,
                code: 'forgetPassword.permissionDenied',
                message: 'you are not allow to do so.'
            });
        if (!user || user.originEmail !== req.body.data.originEmail)
            return res.status(404).json({
                error: 1,
                code: 'forgetPassword.notFound',
                message: 'no such user or you didnt bind an email.'
            });

        const code = misc.generateRandomString(127);
        await db('verifications').insert({
            type: 'reset',
            userId: user.id,
            uniqCode: code,
            expiresTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4h
            createTime: new Date()
        });
        await sendForgetPasswordVerify(user.username, user.originEmail, req.body.data.language, encodeURIComponent(code)); // user verify the code->save new password into db
        // check /forgetPasswordVerify below
        res.status(200).json({
            success: 1,
            code: 'forgetPassword.needVerify',
            message: 'check your email to reset the password.'
        });
    } catch (err) {
        next(err);
    }
});

router.post('/forgetPasswordVerify', [
    checkbody('data.code').isString(),
    checkbody('data.newpassword').isString().trim().isLength({min: 1, max: 40})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */
async (req, res, next) => {
    try {
        const validateErr = validationResult(req);
        if (!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: validateErr.array()});

        const {code, newpassword} = req.body.data;

        /** @type {import("../typedef").Verification} */
        const verification = await db.select('*').from('verifications').where({uniqCode: code}).first();
        if (!verification)
            return res.status(400).json({error: 1, code: 'forgetPassword.bad'});

        const passwdHash = await generatePassword(newpassword);

        await db('users').update({password: passwdHash}).where({id: verification.userId}); // store the new password into db

        return res.status(200).json({success: 1, code: 'forgetPassword.success'});
    } catch (err) {
        next(err);
    }
});

export default router;
