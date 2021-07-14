import express from "express";
import validator from "validator";
import jwt from "jsonwebtoken";
import { check, body as checkbody, query as checkquery, validationResult } from "express-validator";

import db from "../mysql.js";
import config from "../config.js";
import * as misc from "../lib/misc.js";
import verifyCaptcha from "../middleware/captcha.js";
import { allowPrivileges, forbidPrivileges, verifyJWT } from "../middleware/auth.js";
import router from "./user.js";

const router = express.Router();

router.get('/messages')

router.post('/message')

router.post('/mark')

/** @param {import("../typedef.js").SiteEvent} event */
async function onSiteEvent(event) {
    try {
        switch(event.method) {
        case 'report': {
            const user = (await db.select('id').from('users')
            .where({originUserId: event.params.report.toOriginUserId}))[0];
            if(!userId) // that player being reported hasnt registered our site
                return;
            await sendMessage(undefined, user.id, 'warn', 'You were reported by someone.');
            break;
        }
        case 'reply': {
            const {toCommentType, toCommentId, content} = event.params.reply;
            if(!(toCommentType && toCommentId))
                return;
            const dbname = ['replies', 'reports', 'judgements', 'ban_appeals'];
            const toCommentUser = (await db.select('byUserId').from(dbname[toCommentType]).where({id: toCommentId}))[0].byUserId;
            await sendMessage(event.params.reply.byUserId, toCommentUser, 'reply', content);
            break;
        }
        case 'judge': {
            const user = (await db.select('id').from('users')
            .where({originUserId: event.params.judgement.toOriginUserId}))[0];
            if(!userId) // that player being reported hasnt registered our site
                return;
            await sendMessage(undefined, user.id, 'warn', `You were judge as ${event.params.judgement.action}`);
            break;
        }
        case 'banappeal': {
            await sendMessage(event.params.banappeal.byUserId, undefined, 'toAdmins', 'You recieved a ban appeal');
            break;
        }
        default:
            break;
        } 
    } catch(err) {

    }
}

/** 
 * @param {number|null} from @param {number|null} to @param {string} content
 * @param {'direct'|'reply'|'info'|'warn'|'fatal'|'toAll'|'toAdmins'|'toNormals'} type 
 * */
async function sendMessage(from, to, type, content) {
    await db('messages').insert({
        byUserId: from,
        toUserId: to,
        type: type,
        content: content,
        haveRead: 0,
        createTime: new Date()
    });
}


export default router;