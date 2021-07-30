"use strict";
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
    req.headers['REAL-IP'] = realIP;
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

app.get('/devRefreshConfig', (req, res, next)=> {
    origin.createAccounts();
    next();
});

app.get('/is', [checkbody('is').trim() ], (req, res, next)=>{
    console.log(validationResult(req));
    console.log(req.body.is);
    res.status(200).end('sadasd');
});

app.use((req, res, next)=> { res.status(404).json({error: 1, code: 'request.404'}); });

app.use((err, req, res, next)=> { // error handler
    res.status(500).json({error: 1, code:'server.error', message:misc.generateErrorHelper(err)});
    logger.error(err.stack);
});

app.listen(config.port, config.address, ()=> {
    console.log(`App start at ${config.address}:${config.port}`);
});

export default app;