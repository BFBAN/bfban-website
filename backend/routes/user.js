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
import { generatePassword, comparePassword, userHasRoles } from "../lib/auth.js";
import { OriginClient, originClients } from "../lib/origin.js";
import { handleRichTextInput, privilegeRevoker, userDefaultAttribute, userSetAttributes, userShowAttributes } from "../lib/user.js";
import { siteEvent } from "../lib/bfban.js";
import logger from "../logger.js";

const router = express.Router();

router.post('/signup', verifyCaptcha, [ 
    checkbody("data.username").isString().trim().isAlphanumeric('en-US', {ignore: '-_'}).isLength({min:1, max:40}),
    checkbody('data.password').isString().trim().isLength({min:1, max:40}),
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().unescape().trim().notEmpty()
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
        if( (await db.select('username').from('registers').where({username: username}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExist'});
    
        // now check the origin account user binded
        const originClient = originClients.getOne()
        const originUserId = await originClient.searchUserEmail(originEmail);
        if(!originUserId)
            return res.status(400).json({error: 1, code:'signup.originNotFound'});
        const originUserInfo = await originClient.getInfoByUserId(originUserId);
        if(originUserInfo.username !== originName) // verify again
            return res.status(400).json({error: 1, code:'signup.originNotFound'});
        if( (await db.select('originUserId').from('registers').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.originBindingExist'});
        if(''.concat(await originClient.getUserGames(originUserId)).includes('Battlefield') == false) // does the user have battlefield?
            return res.status(400).json({error: 1, code: 'signup.gameNotOwned'});
        
        // no mistakes detected, generate a unique string for register validation
        const randomStr = misc.generateRandomString(127);
        const passwdHash = await generatePassword(password);
        await db('registers').insert({
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
        await sendRegisterVerify(username, originName, originEmail, randomStr);
        logger.info('users.signup Success:', {username,originName,originEmail,randomStr});
        return res.status(201).json({success: 1, code:'signup.needVerify', message: 'Verify Email to join BFBan!'});
    } catch(err) {
        next(err);
    }
});

router.get('/signupVerify', [ 
    checkquery("code").isString().notEmpty() 
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: validateErr.array()});

        const code = req.query.code;
        const registrant = await db.select('*').from('registers').where({uniqCode: code}).first();
        if(!registrant)
            return res.status(404).json({error: 1, code: 'signup.notfound'});
        const data = {
            username: registrant.username,
            password: registrant.password,
            originName: registrant.originName,
            originEmail: registrant.originEmail,
            originUserId: registrant.originUserId,
            originPersonaId: registrant.originPersonaId,
            privilege: 'normal',
            attr: JSON.stringify(userDefaultAttribute(req.REAL_IP)),
            createTime: new Date(),
            updateTime: new Date(),
        };
        await db('users').insert(data);
        await db('registers').where({uniqCode: code}).delete();
        logger.info('users.signupVerify Success:', {name: data.username});
        
        siteEvent.emit('data', {method: 'register', params: {user: data}});
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
        if( (await db.select('username').from('registers').where({username: username}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExist'});
        const passwdHash = await generatePassword(password);
        await db('users').insert({
            username: username,
            password: passwdHash, 
            originName: originName,
            originEmail: originEmail,
            privilege: 'normal',
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
            let expiresIn = 1000*60*60*24*7; // 7 day
            if(EXPIRES_IN>0 && userHasRoles(user, ['dev','bot']))
                expiresIn = parseInt(EXPIRES_IN);
            const jwtpayload = {
                username: username,
                userId: user.id,
                privilege: user.privilege,
                signWhen: Date.now(),
                expiresIn: expiresIn,
            };
            const jwttoken = jwt.sign(jwtpayload, config.secret, {
                expiresIn: expiresIn,
            });
            user.attr.lastSigninIP = req.REAL_IP;
            await db('users').update({updateTime: new Date(), attr: JSON.stringify(user.attr)}).where({id: user.id});
            logger.info('users.login Success:',{name: user.username, ip: req.REAL_IP, token: jwttoken});

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
        const originClient = originClients.getOne()
        const originUserId = await originClient.searchUserEmail(originEmail);
        if(!originUserId)
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        const originUserInfo = await originClient.getInfoByUserId(originUserId);
        if(originUserInfo.username.toLowerCase() !== originName.toLowerCase()) // verify
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        if( (await db.select('originUserId').from('registers').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'bindOrigin.originBindingExist'});
        if(''.concat(await originClient.getUserGames(originUserId)).includes('Battlefield') == false) // does the user have battlefield?
            return res.status(400).json({error: 1, code: 'bindOrigin.gameNotOwned'});
        // no mistakes detected, generate code for verify
        const code = misc.encrypt(JSON.stringify({      // we send encrypted payload to user by email
            userId: req.user.id,                        // which contains userId, originEmail, originuserId
            email: originEmail,                         // when we get this payload again, we can know who is binding which email
            originUserId: originUserId                  // without the help of any temporary db table
        }), config.secret).toString('base64');
        await sendBindingOriginVerify(req.user.username, originEmail, encodeURIComponent(code));

        logger.info('users.bindOrigin#1 Success:', {name: req.user.username, email: originEmail});
        res.status(200).json({success: 1, code:'bindOrigin.needVerify', message:'check your email to complete the verification.'});
    } catch(err) {
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

        const code = decodeURIComponent(req.query.code);
        let payload = {};
        try { // be warn: we might get meaningless obj if the code is not encrypted by us
            payload = JSON.parse(misc.decrypt(Buffer.from(code, 'base64'), config.secret).toString('utf8'));
            if(payload.userId != req.user.id)
                throw(new Error('bad payload'));
        } catch(err) {
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: 'no such code.'}); // bad payload
        }
        const originClient = originClients.getOne();
        const originUserInfo = await originClient.getInfoByUserId(payload.originUserId);
        // no mistakes detected, change db record
        await db('users').update({
            originName: originUserInfo.username,
            originUserId: originUserInfo.userId,
            originPersonaId: originUserInfo.personaId,
            originEmail: payload.email,
            privilege: privilegeRevoker(req.user.privilege, req.user.attr.freezeOfNoBinding? 'freezed':''),
        }).where({id: req.user.id});
        
        logger.info('users.bindOrigin#2 Success:', {name: req.user.username, email: payload.email});
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
        const reportnum = await db('reports').count({num: 'id'}).where({byUserId: user.id}).first().num;
        const data = {
            id: user.id,
            username: user.username,
            privilege: user.privilege,
            introduction: user.introduction,
            joinTime: user.createTime,
            lastOnlineTime: user.updateTime,
            origin: user.attr.showOrigin===true || // user set it public
                    (req.user&&userHasRoles(req.user, ['admin','super','root','dev'])) || // no limit for admin
                    (req.user&&req.user.id===user.id)? // for self
                        {originName: user.originName,originUserId: user.originUserId} : null,
            attr: userShowAttributes(user.attr, 
                (req.user&&req.user.id===user.id), // self, show private info
                (req.user&&userHasRoles(req.user, ['admin','super','root','dev'])) ), // no limit for admin
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
        const reports = await db('reports').join('players', 'reports.toPlayerId', 'players.id')
        .select('players.originName as originName', 'players.originUserId as originuserId',
                    'players.originPersonaId as originPersonaId', 'players.status as status',
                    'players.updateTime as updateTime', 'reports.createTime as createTime')
        .where('reports.byUserId', '=', user.id).orderBy('reports.createTime', 'desc').offset(skip).limit(limit);

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
            return res.status(404).json({error: 1, code: 'forgetPassword.notFound', message: 'no such user.'});
        const newpassword = misc.generateRandomString(16);  // what we are doing here is:
        const code = misc.encrypt(JSON.stringify({          // generate new password for user
            i: 'YesINeedResetMyPassword',                   // but update it into db when user confirm it by email
            password: newpassword,                          // we do so to avoid some bay guys who know user's email address
            userid: user.id                                 // and directly change the user password though they dont know the new one
        }), config.secret).toString('base64');              // we send encrypted password to user, so we dont use db, like jwt
        await sendForgetPasswordVerify(user.username, user.originEmail, encodeURIComponent(code)); // user verify the code->save new password into db
        // check /forgetPasswordVerify below
        res.status(200).json({success: 1, code: 'forgetPassword.needVerify', message: 'check your email to reset the password.'});
    } catch(err) {
        next(err);
    }
});

router.get('/forgetPasswordVerify', [
    checkquery('code').isString()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const validateErr = validationResult(req);
        if(!validateErr.isEmpty())
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: validateErr.array()});

        const code = decodeURIComponent(req.query.code);
        let payload = {};
        try { // be warn: we might get meaningless obj if the code is not encrypted by us
            payload = JSON.parse(misc.decrypt(Buffer.from(code, 'base64'), config.secret).toString('utf8'));
            if(payload.i != 'YesINeedResetMyPassword') // if this patten match, there is no probability to have a bad payload
                throw(new Error('bad payload'));
        } catch(err) {
            return res.status(400).json({error: 1, code: 'forgetPassword.bad', message: 'no such code.'}); // bad payload
        }
        const passwdHash = generatePassword(payload.password);
        await db('users').update({password: passwdHash}).where({id: payload.userid}); // store the new password into db

        return res.status(200).json({success: 1, code: 'forgetPassword.success', data: {
            newpassword: payload.password, // send new password to user, leave them change it later
        }});
    } catch(err) {
        next(err);
    }
});


export default router;