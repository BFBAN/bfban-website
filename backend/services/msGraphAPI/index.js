import fetch from 'cross-fetch';
import * as msgraph from "@microsoft/microsoft-graph-client";
import * as msal from "@azure/msal-node";
import fs from "fs";
import crypto from "crypto";
import express from "express";
import morgan from 'morgan';
import bodyParser from "body-parser";
import { query as checkquery, validationResult, body as checkbody, oneOf as checkOneOf, header as checkheader } from "express-validator";
import { Logger } from "../../logger.js";
import { validateFileName, validatePath } from "../../lib/misc.js";

global.fetch = fetch;   // polyfill for msgraph client

/** 
 * @typedef msAppConfig
 * @property {string|number} port
 * @property {string} address
 * @property {number} logLevel
 * 
 * @property {string} APP_ID
 * @property {string} APP_SECRET
 * @property {string} APP_REDIRECT_URI
 * @property {string} APP_SCOPES
 * @property {string} OAUTH_AUTHORITY
 * 
 * @property {string} driveId
 * @property {string} workerKey
 * @property {string} workerAddress
 */

/** @type {msAppConfig} */
const svcConfig = JSON.parse(fs.readFileSync("./services/msGraphAPI/config.json"));

const logger = new Logger('graph', svcConfig.logLevel);

process.on('uncaughtException', (err)=> {
   logger.error('Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (err)=> {
    logger.error('Unhandled Rejection:', err.message, err.stack);
});

const tokenCachePath = './services/msGraphAPI/tokenCache.json';
const msalConfig = {
    auth: {
        clientId: svcConfig.APP_ID,
        authority: svcConfig.OAUTH_AUTHORITY,
        clientSecret: svcConfig.APP_SECRET,
    },
    cache: {
        cachePlugin: {
            beforeCacheAccess: async (context) => {
                context.tokenCache.deserialize(await fs.promises.readFile(tokenCachePath).catch((err)=>""));
            },
            afterCacheAccess : async (context) => {
                if(context.cacheHasChanged)
                    await fs.promises.writeFile(tokenCachePath, context.tokenCache.serialize());
            }
        }
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                switch(loglevel) {
                case msal.LogLevel.Error:
                    logger.error(message); break;
                case msal.LogLevel.Warning:
                    logger.warn(message); break;
                default:
                    logger.info(message); break;
                }
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Info,
        }
    }
};

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
const msalClient = new msal.ConfidentialClientApplication(msalConfig);
//let msUserHomeId = undefined;

/** @param {msal.ConfidentialClientApplication} msalClient */
function getAuthenticatedClient(msalClient) { // Initialize Graph client
    const client = msgraph.Client.init({ // Implement an auth provider that gets a token
        authProvider: async (done) => {
            try { // Get the user's account
                const account = await msalClient
                    .getTokenCache().getAllAccounts().then(r=>r[0]);
                if (account) { // Attempt to get the token silently
                    const response = await msalClient.acquireTokenSilent({
                        scopes: svcConfig.APP_SCOPES,
                        redirectUri: svcConfig.APP_REDIRECT_URI,
                        account: account
                    });
                    done(null, response.accessToken);
                }
                else
                    throw new Error("GraphAPI: No logged in msal account found");
            } catch (err) {
                done(err, null);
            }
        }
    });
    return client;
}

app.get('/status', async (req, res, next)=> {
    try {
        const msResponse = await getAuthenticatedClient(msalClient).api('/me').get().then((res)=>{
            return { code: 'status.success', data: { user: res.displayName } };
        }).catch((err)=> {
            if(!(err instanceof msgraph.GraphError) || err.statusCode <= 0)
                return { code: `status.badState`, data: err.stack };
            return { code: `status.api#${err.statusCode}`, data: err.body };
        });

        return res.status(200).json({success: 1, code: msResponse.code, data: msResponse.data});
    } catch(err) {
        next(err);
    }
})

app.get('/msLogin', async (req, res, next)=> {
    try {
        const authUrl = await msalClient.getAuthCodeUrl({
            scopes: svcConfig.APP_SCOPES,
            redirectUri: svcConfig.APP_REDIRECT_URI
        });
        logger.info(`auth url:${authUrl}`);
        res.redirect(authUrl);
    } catch(err) {
        logger.error('msLogin:', err.stack);
        res.status(500).json({error: 1, code: 'msLogin.error', message: err.stack});
    }
});

app.get('/msAuthCallback', async (req, res, next)=> {
    try {
        const msResponse = await msalClient.acquireTokenByCode({
            code: req.query.code,
            scopes: svcConfig.APP_SCOPES,
            redirectUri: svcConfig.APP_REDIRECT_URI
        });
        let msUserHomeId;
        if(msResponse.account)
            msUserHomeId = msResponse.account.homeAccountId;
        else
            throw new Error("no account info found in msLoginCallback");
        logger.info(`msLoginCallback userId:${msUserHomeId} accessToken:${msResponse.accessToken}`);
        res.status(200).json({success: 1, data: { userId: msUserHomeId, accessToken: msResponse.accessToken }});
    } catch(err) {
        logger.error('msLoginCallback:', err.stack)
        res.status(500).json({error: 1, code: 'msLoginCb.error', message: err.stack});
    }
});

app.get('/file', [
    checkOneOf([
        checkquery('id').isAlphanumeric('en-US', {ignore: '-_'}),
        checkquery('path').isString().custom((val)=> {
            if(validatePath(val) && val!='/')
                return true;
            throw new Error('path malformed');
        })
    ])
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=> {
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'msGetFile.bad', message: validateErr.array()});
    try {
        const fileId = req.query.id;
        const path = req.query.path;
        const url = fileId? `/drives/${svcConfig.driveId}/items/${fileId}` : `/drives/${svcConfig.driveId}/root:/${path}`;
        const msResponse = await getAuthenticatedClient(msalClient)
        .api(url)
        .get()
        .catch((err)=> {
            if(!(err instanceof msgraph.GraphError) || err.statusCode <= 0)
                throw(err);
            return { status: err.statusCode, error: err.body };
        });
        if(!msResponse.error)
            return res.status(200).json({success: 1, code: 'msGetFile.ok', data: {
                downloadURL: msResponse['@microsoft.graph.downloadUrl'],
                createTime: msResponse.createdDateTime,
                size: msResponse.size,
                id: msResponse.id,
                filename: msResponse.name,
                mimeType: msResponse.file.mimeType
            }});
        else
            return res.status(msResponse.status).json({error: 1, code: 'msGetFile.error', message: msResponse.error});
    } catch(err) {
        logger.error('getFile:', err.stack)
        res.status(500).json({error: 1, code: 'msGetFile.error', message: err.message});
    }
});

app.put('/uploadSmall', [
    checkOneOf([
        checkquery('id').isAlphanumeric('en-US', {ignore: '-_'}),
        checkquery('path').isString().custom((val)=> {
            if(validatePath(val) && val!='/')
                return true;
            throw new Error('path malformed');
        })
    ]),
    checkquery('name').isString().isLength({min: 1, max:255}).custom((val)=> {
        if(validateFileName(val))
            return true;
        throw new Error('bad filename');
    }),
    checkheader('Content-Length').isInt({min: 0, max: 4000*1000})
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=> {
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'msUploadSmall.bad', message: validateErr.array()});
    try {
        const parentId = req.query.id;
        const parentPath = req.query.path;
        const filename = req.query.name;
        const url = parentId? 
            `drives/${svcConfig.driveId}/items/${parentId}:/${filename}:/content`:`drives/${svcConfig.driveId}/root:/${parentPath}/${filename}:/content`;
        
        const msResponse = await getAuthenticatedClient(msalClient)
        .api(url)
        .putStream(req)
        .catch((err)=> {
            if(!(err instanceof msgraph.GraphError) || err.statusCode <= 0)
                throw(err);
            return { status: err.statusCode, error: err.body };
        });
        if(!msResponse.error)
            return res.status(201).json({success: 1, code: 'msUploadSmall.ok', data: {
                size: msResponse.size,
                id: msResponse.id,
                filename: msResponse.name,
            }});
        else
            return res.status(msResponse.status).json({error: 1, code: 'msUploadSmall.bad', message: msResponse.error.message});
    } catch(err) {
        logger.error('uploadSmall:', err.stack)
        return res.status(500).json({error: 1, code: 'msUploadSmall.error', message: err.message});
    }
});

app.post('/uploadBig', [
    checkOneOf([
        checkbody('data.id').isAlphanumeric('en-US', {ignore: '-_'}),
        checkbody('data.path').isString().custom((val)=> {
            if(validatePath(val) && val!='/')
                return true;
            throw new Error('path malformed');
        })
    ]),
    checkbody('data.name').isString().isLength({min: 1, max:255}).custom((val)=> {
        if(validateFileName(val))
            return true;
        throw new Error('bad filename');
    }),
    checkbody('data.size').isInt({min: 0, max: 2048*1024*1024})
],/** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=> {
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'msUploadBig.bad', message: validateErr.array()});
    try {
        const filesize = req.body.data.size;
        const parentId = req.body.data.id;
        const parentPath = req.body.data.path;
        const filename = req.body.data.name;
        const url = parentId? 
            `drives/${svcConfig.driveId}/items/${parentId}:/${
                encodeURIComponent(filename)
            }:/createUploadSession` : `drives/${svcConfig.driveId}/root:/${
                encodeURIComponent(parentPath)}/${
                encodeURIComponent(filename)
            }:/createUploadSession`
        const msResponse = await getAuthenticatedClient(msalClient)
        .api(url)
        .post({
            item: {
                "@microsoft.graph.conflictBehavior": "rename",
                name: filename
            }
        }).catch((err)=> {
            if(!(err instanceof msgraph.GraphError) || err.statusCode <= 0)
                throw(err);
            return { status: err.statusCode, error: err.body};
        });
        if(!msResponse.error) {
            const fileId = /\/items\/[0-9a-zA-Z]+\//.exec(msResponse.uploadUrl)[0].split('/')[2];
            const payload = JSON.stringify({size: filesize, url: msResponse.uploadUrl});
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes256', svcConfig.workerKey, iv);
            const encrypted = Buffer.concat([iv, cipher.update(payload), cipher.final()]).toString('base64');
            return res.status(200).json({success: 1, code: 'msUploadBig.ready', data: {
                size: filesize,
                id: fileId,
                filename: filename,
                expiredAt: msResponse.expirationDateTime,
                uploadUrl: `${svcConfig.workerAddress}msGraph/upload?code=${encodeURIComponent(encrypted)}`
            }});
        } else 
            return res.status(msResponse.status).json({error: 1, code: 'msUploadBig.error', message: msResponse.error.message});
    } catch(err) {
        logger.error('msUploadBig:', err.stack)
        return res.status(500).json({error: 1, code: 'msUploadBig.error', message: err.message});
    }
});

app.post('/sendMail', [
    checkbody('data.type').isIn(['Text', 'HTML']),
    checkbody('data.subject').isString(),
    checkbody('data.content').isString(),
    checkbody('data.to').isEmail(),
    checkbody('data.from').optional().isEmail()
], /** @type {(req:express.Request, res:express.Response, next:express.NextFunction)} */
async (req, res, next)=> {
    const validateErr = validationResult(req);
    if(!validateErr.isEmpty())
        return res.status(400).json({error: 1, code: 'msSendMail.bad', message: validateErr.array()});
    try {
        const { type, subject, content, to, from } = req.body.data;
        const payload = {
            subject: subject,
            body: {
                contentType: type,
                content: content,
            },
            toRecipients: [{
                emailAddress: { address: to }
            }],
        }
        if(from)
            Object.assign(payload, {
                sender: {
                    emailAddress: { address: from }
                },
                from: {
                    emailAddress: { address: from }
                }
            });
        const msResponse = await getAuthenticatedClient(msalClient)
        .api('/me/sendMail')
        .post(payload)
        .catch(err=> {
            if(!(err instanceof msgraph.GraphError) || err.statusCode <= 0)
                throw(err);
            return { status: err.statusCode, error: err.body};
        });
        if(!msResponse.error)
            return res.status(202).json({success: 1, code: 'msSendMail.success', message: 'mail successfully sent.'});
        else
            return res.status(msResponse.status).json({success: 1, code: 'msSendMail.error', message: msResponse.error.message});
    } catch(err) {
        logger.error('msSendMail:', err.stack);
        return res.status(500).json({error: 1, code: 'msSendMail.error', message: err.message});
    }
});

app.use((req, res, next)=> { res.status(404).json({error: 1, code: 'request.404'}); });

app.use((err, req, res, next)=> { // error handler
    logger.error(err.message, err.stack);
    res.status(500).json({error: 1, code:'server.error', message: err.message});
});

app.listen(svcConfig.port, ()=>{
    logger.success(`Service start at ${svcConfig.address}:${svcConfig.port}`);
});
