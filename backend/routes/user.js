"use strict";
import express from "express";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { sendRegisterVerify, sendForgetPasswordVerify, sendBindingOriginVerify } from "../lib/mail.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { generatePassword, comparePassword, userHasRoles, privilegeRevoker } from "../lib/auth.js";
import { OriginClient, originClients } from "../lib/origin.js";
import { handleRichTextInput, userDefaultAttribute, userSetAttributes, userShowAttributes } from "../lib/user.js";
import { siteEvent } from "../lib/bfban.js";
import logger from "../logger.js";
import serviceApi, { ServiceApiError } from "../lib/serviceAPI.js";

const router = express.Router();

router.post('/signup', verifyCaptcha, [ 
    checkbody('data.username').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min:1, max:40}),
    checkbody('data.password').isString().trim().isLength({min:1, max:40}),
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().unescape().trim().notEmpty(),
    checkbody('data.language').isIn(config.supportLanguages)
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});
        
        // all data well-formed, ready to flight
        /** @type {{username:string, password:string, originName:string, originEmail:string}} */
        const { username, password, originName, originEmail } = req.body.data;

        // does anyone occupied?
        if( (await db.select('username').from('verifications').where({username: username, type: 'register'}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExist'});
    
        // now check the origin account user binded
        const originUserId = await serviceApi('eaAPI', '/searchUser').query({email: originEmail}).get().then(r=>r.data);
        if(!originUserId)
            return res.status(400).json({error: 1, code:'signup.originNotFound'});
        const originUserInfo = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r=>r.data);
        if(originUserInfo.username !== originName) // verify again
            return res.status(400).json({error: 1, code:'signup.originNotFound'});
        if( (await db.select('originUserId').from('verifications').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.originBindingExist'});
        // check whether the user has at least 1 battlefield game
        /** @type {string[]} */
        const userGames = await serviceApi('eaAPI', '/userGames', false).query({userId: originUserId}).get().then(r=>r.data);
        if(userGames && userGames.concat(' ').includes('Battlefield') == false)
            return res.status(400).json({error: 1, code: 'signup.gameNotShowed'});
        
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
            expiresTime: new Date(Date.now()+1000*60*60*4), // 4h
            createTime: new Date()
        });
        await sendRegisterVerify(username, originName, originEmail, req.body.data.language, randomStr);
        logger.info('users.signup Success:', {username,originName,originEmail,randomStr});
        return res.status(201).json({success: 1, code:'signup.needVerify', message: 'Verify Email to join BFBan!'});
    } catch(err) {
        if(err instanceof ServiceApiError) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode>0? err.stack:'');
            return res.status(err.statusCode==501? 501:500).json({
                error: 1, 
                code: err.statusCode==501? 'signup.notImplement':'signup.error', 
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
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});

        const code = req.query.code;
        const registrant = await db.select('*').from('verifications').where({uniqCode: code}).first();
        if(!registrant)
            return res.status(404).json({error: 1, code: 'signup.notFound'});
        if(registrant.expiresTime < new Date())
            return res.status(400).json({error: 1, code: 'signup.expired'});
        
        const data = {
            username: registrant.username,
            password: registrant.password,
            originName: registrant.originName,
            originEmail: registrant.originEmail,
            originUserId: registrant.originUserId,
            originPersonaId: registrant.originPersonaId,
            privilege: JSON.stringify(['normal']),
            attr: JSON.stringify(userDefaultAttribute(req.REAL_IP, req.query.lang)),
            createTime: new Date(),
            updateTime: new Date(),
        };
        await db('users').insert(data);
        await db('verifications').where({uniqCode: code}).delete();
        logger.info('users.signupVerify Success:', {name: data.username});
        
        siteEvent.emit('action', {method: 'register', params: {user: data}});
        return res.status(201).json({success: 1, code:'signup.success', message: 'Welcome to BFBan!'});
    } catch(err) {
        next(err);
    }
});

router.post('/signup4dev', verifyJWT, allowPrivileges(['dev']), [
    checkbody("data.username").isString().trim().isLength({min:1, max:40}),
    checkbody('data.password').isString().trim().isLength({min:1, max:40}),
    checkbody('data.originEmail').isString().trim(),
    checkbody('data.originName').isString().trim()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});
        
        // all data well-formed, ready to flight
        /** @type {{username:string, password:string, originName:string, originEmail:string}} */
        const { username, password, originName, originEmail } = req.body.data;
        
        // does anyone occupied?
        if( (await db.select('username').from('verifications').where({username: username, type: 'register'}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExist'});
        const passwdHash = await generatePassword(password);
        await db('users').insert({
            username: username,
            password: passwdHash, 
            originName: originName,
            originEmail: originEmail,
            privilege: JSON.stringify(['normal']),
            attr: JSON.stringify(userDefaultAttribute()),
            createTime: new Date(),
        });
        return res.status(201).json({success: 1, code:'signup.success', message: 'Welcome to BFBan!'});
    } catch(err) {
        next(err);
    }
});

router.post('/signin', verifyCaptcha, [
    checkbody("data.username").isString().trim().isLength({min:1, max:40}),
    checkbody('data.password').isString().trim().isLength({min:1, max:40}),
    checkbody('data.EXPIRES_IN').optional({nullable:true}).isInt({min: 0})
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signin.bad', message: validateErr.array()});
        
        const { username, password, EXPIRES_IN } = req.body.data;
        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({username: username}).first();
        
        if(user && user.valid!=0 && await comparePassword(password, user.password)) {
            let expiresIn = config.userTokenExpiresIn;
            if(EXPIRES_IN && userHasRoles(user, ['dev','bot']))
                expiresIn = EXPIRES_IN-0;
            const jwtpayload = {
                username: username,
                userId: user.id,
                privilege: user.privilege,
                signWhen: Date.now(),
                expiresIn: expiresIn,
            };
            const jwttoken = jwt.sign(jwtpayload, config.secret, {
                expiresIn: expiresIn/1000,  // second
            });
            user.attr.lastSigninIP = req.REAL_IP;
            await db('users').update({updateTime: new Date(), attr: JSON.stringify(user.attr)}).where({id: user.id});
            logger.info('users.login Success:', {name: user.username, ip: req.REAL_IP, token: jwttoken});

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
    } catch(err) {
        next(err);
    }
});

router.post('/bindOrigin', verifyJWT, forbidPrivileges(['blacklisted']), verifyCaptcha, [
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().trim().notEmpty()
],  /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: validateErr.array()});

        const { originEmail, originName } = req.body.data;
        const originUserId = await serviceApi('eaAPI', '/searchUser').query({email: originEmail}).get().then(r=>r.data);
        if(!originUserId)
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        const originUserInfo = await serviceApi('eaAPI', '/userInfo').query({userId: originUserId}).get().then(r=>r.data);
        if(originUserInfo.username.toLowerCase() !== originName.toLowerCase()) // verify
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        if( (await db.select('originUserId').from('verifications').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'bindOrigin.originBindingExist'});

        const userGames = await serviceApi('eaAPI', '/userGames', false).query({userId: originUserId}).get().then(r=>r.data);
        if(userGames && userGames.concat(' ').includes('Battlefield') == false) // does the user have battlefield?
            return res.status(400).json({error: 1, code: 'bindOrigin.gameNotShowed'});
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
            expiresTime: new Date(Date.now()+1000*60*60*4), // 4h
            createTime: new Date()
        });
        await sendBindingOriginVerify(req.user.username, originEmail, req.user.attr.language, encodeURIComponent(code));

        logger.info('users.bindOrigin#1 Success:', {name: req.user.username, email: originEmail});
        res.status(200).json({success: 1, code:'bindOrigin.needVerify', message:'check your email to complete the verification.'});
    } catch(err) {
        if(err instanceof ServiceApiError) {
            logger.error(`ServiceApiError ${err.statusCode} ${err.message}`, err.body, err.statusCode>0? err.stack:'');
            return res.status(err.statusCode==501? 501:500).json({
                error: 1, 
                code: err.statusCode==501? 'bindOrigin.notImplement':'bindOrigin.error', 
                message: err.message
            });
        }
        next(err);
    }
});

router.get('/bindOriginVerify', verifyJWT, [
    checkquery('code').isString()
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: validateErr.array()});

        const code = req.query.code;
        const binding = await db.select('*').from('verifications').where({uniqCode: code, userId: req.user.id}).first();
        if(!binding)
            return res.status(400).json({error:1, code: 'bindOrigin.notFound'});
        if(binding.expiresTime < new Date())
            return res.status(400).json({error:1, code: 'bindOrigin.expired'});
        
        await db('users').update({
            originName: binding.originName,
            originUserId: binding.originUserId,
            originPersonaId: binding.originPersonaId,
            originEmail: binding.originEmail,
            privilege: JSON.stringify(privilegeRevoker(req.user.privilege, req.user.attr.freezeOfNoBinding? 'freezed':'')),
        }).where({id: req.user.id});
        await db('verifications').delete().where({uniqCode: code});

        logger.info('users.bindOrigin#2 Success:', {name: req.user.username, email: binding.originEmail});
        res.status(200).json({success: 1, code: 'bindOrigin.success', message:'bind origin successfully.'});
    } catch(err) {
        next(err);
    } 
});


router.post('/signout', verifyJWT, /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=>{
    try {
        await db('users').update({signoutTime: new Date()}).where({id: req.user.id});
        return res.status(200).json({success: 1, code: 'logout.success', message: 'bye~'});
    } catch(err) {
        next(err);
    }
});

/** @param {express.Request} req @param {express.Response} res @param {express.NextFunction} next */
async function showUserInfo(req, res, next) {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'userInfo.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.query.id}).first();
        if(!user)
            return res.status(404).json({error: 1, code: 'userInfo.notFound', message: 'no such user.'});
        const reportnum = await db('reports').count({num: 'id'}).where({byUserId: user.id}).first().then(r=>r.num);
        const data = {
            id: user.id,
            username: user.username,
            privilege: user.privilege,
            introduction: user.introduction,
            joinTime: user.createTime,
            lastOnlineTime: user.updateTime,
            origin: user.attr.showOrigin===true // user set it public
                    || (req.user && userHasRoles(req.user, ['admin','super','root','dev'])) // no limit for admin
                    || (req.user && req.user.id===user.id)? // for self
                        {originName: user.originName,originUserId: user.originUserId} : null,
            attr: userShowAttributes(user.attr, 
                (req.user && req.user.id===user.id), // self, show private info
                (req.user && userHasRoles(req.user, ['admin','super','root','dev'])) ), // no limit for admin
            reportnum: reportnum,
        };

        return res.status(200).json({success: 1, code: 'userInfo.success', data: data});
    } catch(err) {
        next(err);
    }
}

router.get('/info', [ checkquery('id').isInt({min: 0}) ],  showUserInfo);
router.get('/info4admin', verifyJWT, allowPrivileges(['admin','super','root','dev']), [ 
    checkquery('id').isInt({min: 0})
], showUserInfo);
router.get('/me', verifyJWT, (req, res, next)=>{
    req.query.id = ''+req.user.id; return next();
}, showUserInfo);

router.get('/reports', [
    checkquery('id').isInt({min: 0}),
    checkquery('skip').optional().isInt({min: 0}),
    checkquery('limit').optional().isInt({min: 0, max: 100}),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'userReports.bad', message: validateErr.array()});

        const skip = req.query.skip? req.query.skip : 0;
        const limit = req.query.limit? req.query.limit : 0;

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({id: req.query.id}).first();
        if(!user)
            return res.status(404).json({error: 1, code: 'userReports.notFound', message: 'no such user.'});
        const reports = await db('comments').join('players', 'comments.toPlayerId', 'players.id')
        .select('players.originName as originName', 'players.originUserId as originuserId',
                'players.originPersonaId as originPersonaId', 'players.status as status',
                'players.updateTime as updateTime', 'comments.createTime as createTime')
        .where({'comments.byUserId': user.id, type: 'report'}).orderBy('comments.createTime', 'desc').offset(skip).limit(limit);

        res.status(200).json({success: 1, code: 'userReports.success', data: reports});
    } catch(err) {
        next(err);
    }
});

router.post('/me', verifyJWT, forbidPrivileges(['blacklisted']), [
    checkbody('data').isObject(),
    checkbody('data.introduction').optional({nullable: true}).isString().isLength({max: 510}),
    checkbody('data.attr').optional({nullable: true}).isObject(),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'me.bad', message: validateErr.array()});

        const update = {};
        if(req.body.data.introduction)
            update.introduction = handleRichTextInput(req.body.data.introduction);
        if(req.body.data.attr)
            update.attr = JSON.stringify(userSetAttributes(req.user.attr, req.body.data.attr));
        await db('users').update(update).where({id: req.user.id});
        update.attr = userSetAttributes({}, req.body.data.attr);
        res.status(200).json({success: 1, code: 'me.success', data: update});
    } catch(err) {
        next(err);
    }
});

router.post('/changeName', verifyJWT, forbidPrivileges(['blacklisted']), verifyCaptcha, [
    checkbody('data.newname').isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min: 1, max: 40}),
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'changeName.bad', message: validateErr.array()});

        const attr = req.user.attr;
        if(!attr.changeNameLeft && attr.changeNameLeft<=0)
            return res.status(403).json({error: 1, code: 'changeName.noChance', message: 'you have used up all your change name chances.'});
        const occupy = await db.select('createTime').from('users').where({username: req.body.data.newname}).union([
            db.select('createTime').from('registers').where({username: req.body.data.newname})
        ]);
        if(occupy.length > 0)
            return res.status(403).json({error: 1, code: 'changeName.occupied', message: 'someone already occupied your new name.'});
        --attr.changeNameLeft;
        await db('users').update({username: req.body.data.newname, attr: JSON.stringify(attr)}).where({id: req.user.id});
        return res.status(200).json({success: 1, code: 'changeName.success', data: {
            chancesLeft: attr.changeNameLeft
        } });
    } catch(err) {
        next(err);
    }
});

router.post('/changePassword', verifyJWT, [
    checkbody('data.newpassword').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.oldpassword').isString().trim().isLength({min: 1, max: 40})
], /** @type {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'changePassword.bad', message: validateErr.array()});
        
        const user = req.user
        if(!comparePassword(req.body.data.oldpassword, user.password))
            return res.status(400).json({error: 1, code: 'changePassword.notMatch', message: 'original password incorrect.'});
        await db('users').update({
            password: await generatePassword(req.body.data.newpassword),
            signoutTime: new Date()
        }).where({id: user.id});

        return res.status(200).json({success: 1, code: 'changePassword.success', message: 'You need a Re-login to finish this process'});
    } catch(err) {
        next(err);
    }
});

/*
router.post('/batch', [
    checkbody('data').isArray({max: 100})
],
async (req, res, next)=>{
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'userBatch.bad', message: validateErr.array()});
        
        const query = req.body.data.filter(i=>{
            if(Number.isInteger(i-0))
                return i-0;
            return undefined;
        });
        const qres = await db.select('id','username','privilege').from('users').whereIn('id', query).andWhere({valid: 1});
        res.status(200).json({
            success: 1,
            code: 'userBatch.success',
            data: qres.map(i=>{return [i.id, i]})
        });
    } catch(err) {
        next(err);
    }
});
*/

router.post('/forgetPassword', verifyCaptcha, [
    checkbody('data.username').isString().trim().isLength({min: 1, max: 40}),
    checkbody('data.originEmail').trim().isEmail()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: validateErr.array()});

        /** @type {import("../typedef.js").User} */
        const user = await db.select('*').from('users').where({username: req.body.data.username}).first();
        if(userHasRoles(user, ['blacklisted']))
            return res.status(403).json({error: 1, code: 'forgetPassword.permissionDenied', message: 'you are not allow to do so.'});
        if(!user || user.originEmail != req.body.data.originEmail)
            return res.status(404).json({error: 1, code: 'forgetPassword.notFound', message: 'no such user or you didnt bind an email.'});
        
        const code = misc.generateRandomString(127);
        await db('verifications').insert({
            type: 'reset',
            userId: user.id,
            uniqCode: code,
            expiresTime: new Date(Date.now()+1000*60*60*4), // 4h
            createTime: new Date()
        });
        await sendForgetPasswordVerify(user.username, user.originEmail, encodeURIComponent(code)); // user verify the code->save new password into db
        // check /forgetPasswordVerify below
        res.status(200).json({success: 1, code: 'forgetPassword.needVerify', message: 'check your email to reset the password.'});
    } catch(err) {
        next(err);
    }
});

router.post('/forgetPasswordVerify', [
    checkbody('data.code').isString(),
    checkbody('data.newpassword').isString().trim().isLength({min: 1, max: 40})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: validateErr.array()});

        const { code, newpassword } = req.body.data;

        /** @type {import("../typedef").Verification} */
        const verification = await db.select('*').from('verifications').where({uniqCode: code}).first();
        if(!verification)
            return res.status(400).json({error: 1, code: 'forgetPassword.bad'});
        
        const passwdHash = await generatePassword(newpassword);
        await db('users').update({password: passwdHash}).where({id: verification.userId}); // store the new password into db

        return res.status(200).json({success: 1, code: 'forgetPassword.success'});
    } catch(err) {
        next(err);
    }
});


export default router;