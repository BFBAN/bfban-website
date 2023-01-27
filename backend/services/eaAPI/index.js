import express from "express";
import morgan from 'morgan';
import bodyParser from "body-parser";

import { query as checkquery, validationResult, body as checkbody, oneOf as checkOneOf, header as checkheader } from "express-validator";

import { svcConfig, logger, configUpdated } from "./infrastruc.js";
import { OriginClient, OriginClientCluster, EaApiMethods, EaApiError } from "./originAPI.js";
import "./private/privateAPIs.js";    // inject private methods to OriginClient

process.on('uncaughtException', (err)=> {
   logger.error('Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (err)=> {
    logger.error('Unhandled Rejection:', err.message, err.stack);
});

const app = express();

app.use(bodyParser.json());
app.use(morgan((tokens, req, res)=>{
    const status = tokens.status(req, res);
    const base = `${tokens.status(req, res)} ${tokens.method(req, res)} ${tokens.url(req, res)} in ${tokens['response-time'](req, res)}ms`;
    const verbose = svcConfig.logLevel>=3? ` RequestBody: ${JSON.stringify(req.body)}` : '';
    if(svcConfig.logLevel<0)
        return undefined;
    if(status >= 500)
        return logger.toText.error(base+verbose);
    else if(status >= 400)
        return logger.toText.warn(base+verbose);
    else 
        return logger.toText.info(base+verbose);
}));

/** @type {Map<string, OriginClient>} */
const clients = new Map();
const cluster = new OriginClientCluster();
function initClients() {
    for(const i of clients.values()) 
        i.init().then(selfinfo=> {
            logger.info(`OriginClient ${i.tag} init complete: ${selfinfo.username} uid:${selfinfo.userId} pid:${selfinfo.personaId}`);
            cluster.set(i.tag, i);
        }).catch(err=> {
            if(err instanceof EaApiError && err.message.includes('Cookies Expired'))
                logger.warn(`OriginClient ${i.tag} init fail: Cookies Expired`);
            else if(err instanceof EaApiError)
                logger.error(`OriginClient ${i.tag} init fail: ${err.statusCode} ${err.message}`, err.body, err.statusCode>0? err.stack:'');
            else
                logger.error(`OriginClient ${i.tag} init fail: ${err.message}`, err.stack);
        });
}
for(const i of svcConfig.accounts)    // create accounts
    clients.set(i.name, new OriginClient({tag: i.name, remid: i.remid, sid: i.sid}));
initClients();


configUpdated.on('updated', ()=>{
    for(const i of clients.keys())      // find those accounts that does not exist in config file
        if(!svcConfig.accounts.find(j=>j.name==i))
            clients.delete(i);          // then delete them
    for(const i of svcConfig.accounts) {    // add accounts
        if(clients.has(i.name) && clients.get(i.name).cookies.remid==i.remid && clients.get(i.name).cookies.sid==i.sid)
            continue;   // if the account has nothing changed to its previous state, then ignore the change
        clients.set(i.name, new OriginClient({tag: i.name, remid: i.remid, sid: i.sid}));   // add new accounts or refresh old one
    }
    cluster.clear();
    initClients();
});


app.get('/searchUser', [
    checkOneOf([
        checkquery('name').isString().isLength({min: 0, max: 64}).isAlphanumeric('en-US', {ignore: '_-'}),
        checkquery('email').isEmail()
    ])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'searchUser.bad', message: validateErr.array()});
    try {
        let userId;
        if(req.query.name) {
            if(EaApiMethods.searchUserNameEA)
                userId = await cluster.invokeMethod(EaApiMethods.searchUserNameEA, req.query.name).then(r=>r[0]?.pidId);
            else
                userId = await cluster.invokeMethod(EaApiMethods.searchUserName, req.query.name).then(r=>r[0]);        
        } else
            userId = await cluster.invokeMethod(EaApiMethods.searchUserEmail, req.query.email);

        if(!userId)
            return res.status(404).json({error: 1, code: 'searchUser.notFound', message: 'no user found by this criteria.'});
        return res.status(200).json({success: 1, code: 'searchUser.ok', data: userId+''})
    } catch(err) {
        next(err);
    }
});

app.get('/searchUsers', [
    checkquery('name').isString().isLength({min: 0, max: 64}).isAlphanumeric('en-US', {ignore: '_-*'}),
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'searchUsers.bad', message: validateErr.array()});
    if(!EaApiMethods.searchUserNameEA)
        return res.status(501).json({error: 1, code: 'searchUsers.notImplement', message: 'not implement feature'});
    try {
        const users = await cluster.invokeMethod(EaApiMethods.searchUserNameEA, req.query.name)
        .then(r=>r.map(i=>{
            return {personaId: i.personaId, userId: i.pidId, name: i.displayName};
        }));
        return res.status(200).json({success: 1, code: 'searchUsers.ok', data: users})
    } catch(err) {
        next(err);
    }
});

app.get('/userInfo', [
    checkquery('userId').isInt()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'userInfo.bad', message: validateErr.array()});
    try {
        const info = await cluster.invokeMethod(EaApiMethods.getInfoByUserId, req.query.userId);
        return res.status(200).json({success: 1, code: 'userInfo.ok', data: info});
    } catch(err) {
        if(err instanceof EaApiError && err.statusCode==404)
            return res.status(404).json({error: 1, code: 'userGames.notFound', message: 'not found'});
        next(err);
    }
});

app.get('/userAvatar', [
    checkquery('userId').isInt()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'userAvatar.bad', message: validateErr.array()});
    try {
        const info = await cluster.invokeMethod(EaApiMethods.getUserAvatar, req.query.userId);
        return res.status(200).json({success: 1, code: 'userAvatar.ok', data: info});
    } catch(err) {
        if(err instanceof EaApiError && err.statusCode==404)
            return res.status(404).json({error: 1, code: 'userAvatar.notFound', message: 'not found'});
        next(err);
    }
});

app.get('/userGames', [
    checkquery('userId').isInt()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=>{
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'userGames.bad', message: validateErr.array()});
    try {
        const info = await cluster.invokeMethod(EaApiMethods.getUserGames, req.query.userId);
        return res.status(200).json({success: 1, code: 'userGames.ok', data: info});
    } catch(err) {
        if(err instanceof EaApiError && (err.statusCode==404 || err.statusCode==403))
            return res.status(404).json({error: 1, code: 'userGames.notFound', message: 'not found or user did not set it public'});
        next(err);
    }
});

app.get('/status', async (req, res, next)=>{
    const status = [];
    for(const i of clients.entries())
        status.push({tag: i[0], client: {status: i[1].cur_state, info: i[1].self_prop}});
    res.status(200).json({success: 1, code: 'status.ok', data: status});
});

app.use((err, req, res, next)=>{    // error handler
    if(err instanceof EaApiError) {
        logger.error(`EaApiError: ${err.statusCode} ${err.message}`, err.body, err.stack);
        switch(err.statusCode) {
        case 400:
            return res.status(400).json({error: 1, code: 'server.reqestError', message: err.body});
        default:
            return res.status(500).json({error: 1, code: 'server.error', message: err.message});
        }
    } else {
        logger.error(err.message, err.stack);
        return res.status(500).json({error: 1, code: 'server.error', message: err.message});
    }
});

app.use((req, res, next)=> { res.status(404).json({error: 1, code: 'request.404'}); });

app.listen(svcConfig.port, ()=>{
    logger.success(`Service start at ${svcConfig.address}:${svcConfig.port}`)
});
