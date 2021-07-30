"use strict";
import express from "express";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import db from "../mysql.js";
import { userHasRoles } from "../lib/auth.js";
import { body as checkbody } from "express-validator";

/** @param {express.Request} req @param {express.Response} res @param {express.NextFunction} next */
async function verifyCaptcha(req, res, next) {
    try {
        if(req.body.SKIP_CAPTCHA === true && userHasRoles(req.user, ['dev','bot']) ) // we allow devs and bots to skip captcha
            return next();
        // validation
        if( !(await checkbody('encryptCaptcha').isBase64().run(req, {dryRun: true})).isEmpty() || 
            !(await checkbody('captcha').isAscii().isLength({min:4, max:4}).run(req, {dryRun: true})).isEmpty() )
            return res.status(400).json({ error: 1, code: 'captcha.bad' });

        const encryptCaptcha = req.body.encryptCaptcha;
        const submitCaptcha = req.body.captcha.toLowerCase();
        
        const decryptCaptcha = misc.decrypt(Buffer.from(encryptCaptcha, 'base64'), config.secret).toString('utf8'); // be warn: we might get meaningless str if the encryptCaptcha is not ours
        const [ rightCaptcha, timeStamp ] = decryptCaptcha.split(',', 2); // so .split here, the second param could be undefined or meaningless

        if(!Number.isInteger(parseInt(timeStamp))) // so here we check if it can be parse as int
            return res.status(400).json({ error: 1, code: 'captcha.bad' });
        if(Date.now() - parseInt(timeStamp) > config.captchaExpiresIn) // is captcha expired?
            return res.status(403).json({ error: 1, code: 'captcha.expired' });
        if(rightCaptcha !== submitCaptcha) // wrong captcha
            return res.status(403).json({ error: 1, code: 'captcha.wrong' });
        if( (await db.select('*').from('used_captchas').where({uniqHash: encryptCaptcha})).length > 0 ) // used captcha
            return res.status(403).json({ error: 1, code: 'captcha.expired' });

        await db('used_captchas').insert({uniqHash: encryptCaptcha, expiresTime: new Date(timeStamp-0+config.captchaExpiresIn)});
        next();
    } catch(err) {
        next(err);
    }
    
}

export default verifyCaptcha;