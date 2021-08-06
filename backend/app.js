"use strict";
import fs from "fs";
import worker_threads from "worker_threads";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import * as origin from "./lib/origin.js"
import config from "./config.js";
import * as misc from "./lib/misc.js";
import { generateCaptcha } from "./lib/captcha.js";
import logger from "./logger.js";

import routes_user from "./routes/user.js";
import routes_index from "./routes/index.js";
import router_player from "./routes/player.js";
import router_message from "./routes/message.js";
//import router_services from "./routes/services.js";

import { query as checkquery, validationResult, body as checkbody } from "express-validator";
import { UserRateLimiter } from "./lib/user.js";
import { verifyJWT } from "./middleware/auth.js";

process.on('uncaughtException', (err)=> {
   logger.error('Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (err)=> {
    logger.error('Unhandled Rejection:', err.message, err.stack);
});

fs.watchFile('./config.js', async (eventType, filename)=> { // dynamic load config
    logger.info('Reading config...');                       // see https://github.com/nodejs/modules/issues/307#issuecomment-858729422
    const tmpenv = new worker_threads.Worker('      \
        const worker=require("worker_threads");     \
        import("./config.js").then(m=>worker.parentPort.postMessage(m.default));', {eval: true});
    tmpenv.once('message', (v)=> {
        for(let i of Object.keys(config))
            delete config[i];
        for(let i of Object.keys(v))
            config[i] = v[i];
        logger.success('Config update success.', config);
        origin.createAccounts();
    });
    tmpenv.once('error', (err)=> {
        logger.error('Config update fail!', err.message, err.stack)
    });
});

origin.createAccounts();
const app = express();

app.use((req, res, next)=> {
    let realIP = '';
    switch(true) {
    case !!req.get('CF-Connecting-IP')&&config.cloudflare:
        realIP = req.get('CF-Connecting-IP'); break;
    case !!req.get('X-Forwarded-For')&&config.behindProxy:
        realIP = req.get('X-Forwarded-For').split(',').reverse()[config.behindProxy]; break;
    default:
        realIP = req.ip; break;
    }
    req.REAL_IP = realIP;
    next();
});

app.use(cookieParser());
app.use(morgan(':date[clf] :status :method :url :res[content-length] :response-time ms  :remote-addr'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next)=> {console.log(req.body); next();})

app.use('/static', express.static('./test'));
app.use('/api', routes_index);
app.use('/api/user', routes_user);
app.use('/api/player', router_player);
app.use('/api/message', router_message);

app.get('/api/captcha', (req, res, next)=>{
    res.status(200).json({success: 1, code: 'captcha.gen', data: generateCaptcha()});
});

app.get('/is', [checkbody('is').trim() ], (req, res, next)=>{
    console.log(validationResult(req));
    console.log(req.body.is);
    res.status(200).end('sadasd');
});

const limiter =  new UserRateLimiter(5000, 100);
app.get('/rate', verifyJWT ,limiter.limiter(50), (req, res, next)=> {
    res.status(200).json({hello:'world'});
});

app.use((req, res, next)=> { res.status(404).json({error: 1, code: 'request.404'}); });

app.use((err, req, res, next)=> { // error handler
    logger.error(err.message, err.stack);
    res.status(500).json({error: 1, code:'server.error', message:misc.generateErrorHelper(err)});
});

app.listen(config.port, config.address, ()=> {
    console.log(`App start at ${config.address}:${config.port}`);
});



export default app;