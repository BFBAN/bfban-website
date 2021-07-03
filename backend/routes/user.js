import express from "express";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { sendRegisterVerify } from "../lib/mail.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import { generatePassword, comparePassword } from "../lib/auth.js";
import { originClients } from "../lib/origin.js";

const router = express.Router();

router.post('/signup', verifyCaptcha, [ 
    checkbody("data.username").isString().trim().isLength({min:1, max:40}),
    checkbody('data.password').isString().trim().isLength({min:1, max:40}),
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().unescape().trim().notEmpty()
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: errors.array()});
        
        // all data well-formed, ready to flight
        /** @type {{username:string, password:string, originName:string, originEmail:string}} */
        const { username, password, originName, originEmail } = req.body.data;

        // does anyone occupied?
        if( (await db.select('username').from('registers').where({username: username}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExsist'});
    
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
            return res.status(400).json({error: 1, code: 'signup.originBindingExsist'});
        if(''.concat(await originClient.getUserGames(originUserId)).indexOf('Battlefield') == -1) // does the user have battlefield?
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
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: errors.array()});

        const code = req.query.code;
        const registrant = (await db.select('*').from('registers').where({uniqCode: code}))[0];
        if(!registrant)
            return res.status(404).json({error: 1, code: 'signup.notfound'});
        await db('users').insert({
            username: registrant.username,
            password: registrant.password,
            originName: registrant.originName,
            originEmail: registrant.originEmail,
            originUserId: registrant.originUserId,
            originPersonaId: registrant.originPersonaId,
            privilege: 'normal',
            createTime: new Date(),
        });
        await db('registers').where({uniqCode: code}).delete();
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
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'signup.bad', message: errors.array()});
        
        // all data well-formed, ready to flight
        /** @type {{username:string, password:string, originName:string, originEmail:string}} */
        const { username, password, originName, originEmail } = req.body.data;
        
        // does anyone occupied?
        if( (await db.select('username').from('registers').where({username: username}).union([
            db.select('username').from('users').where({username: username})
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'signup.usernameExsist'});
        const passwdHash = await generatePassword(password);
        await db('users').insert({
            username: username,
            password: passwdHash, 
            originName: originName,
            originEmail: originEmail,
            privilege: 'normal',
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
    checkbody('data.EXPIRES_IN').optional({nullable:true}).isNumeric({no_symbols: true})
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'signin.bad', message: errors.array()});
        
        const { username, password, EXPIRES_IN } = req.body.data;
        const user = (await db.select('*').from('users').where({username: username}))[0];
        
        if(user && user.valid!=0 && await comparePassword(password, user.password)) {
            let expiresIn = 1000*60*60*24*7; // 7 day
            if(EXPIRES_IN>0 && (user.privilege.indexOf('dev')!=-1 || user.privilege.indexOf('bot')!=-1))
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

router.post('bindOrigin', verifyJWT, forbidPrivileges(['blacklisted']), verifyCaptcha, [
    checkbody('data.originEmail').isString().trim().isEmail(),
    checkbody('data.originName').isString().trim().notEmpty()
],  /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)=>void} */ 
async (req, res, next)=> {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.status(400).json({error: 1, code: 'bindOrigin.bad', message: errors.array()});

        const { originEmail, originName } = req.body.data;
        const originClient = originClients.getOne()
        const originUserId = await originClient.searchUserEmail(originEmail);
        if(!originUserId)
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        const originUserInfo = await originClient.getInfoByUserId(originUserId);
        if(originUserInfo.username !== originName) // verify again
            return res.status(400).json({error: 1, code:'bindOrigin.originNotFound'});
        if( (await db.select('originUserId').from('registers').where({originUserId: originUserId}).union([
            db.select('originUserId').from('users').where({originUserId: originUserId}) // check duplicated binding
        ]) ).length != 0 )
            return res.status(400).json({error: 1, code: 'bindOrigin.originBindingExsist'});
        if(''.concat(await originClient.getUserGames(originUserId)).indexOf('Battlefield') == -1) // does the user have battlefield?
            return res.status(400).json({error: 1, code: 'bindOrigin.gameNotOwned'});

        // no mistakes detected, change db record
        await db('users').update({
            originName: originName,
            originUserId: originUserId,
            originPersonaId: originUserInfo.personaId,
            originEmail: originEmail,
        }).where({id: req.user.id});
    } catch(err) {
        next(err);
    }
})


// TODO: signout (db(logoutTime))
// TODO: /account
// TODO: /me
// TODO: resetPasswd
// TODO: setPreferrence

export default router;