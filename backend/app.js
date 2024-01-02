"use strict";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import config from "./config.js";
import docs_config from "./docs-config.js"
import "./lib/configLoader.js"; // to dynamic update config
import * as misc from "./lib/misc.js";
import {generateCaptcha} from "./lib/captcha.js";
import logger from "./logger.js";

import router_user from "./routes/user.js";
import {router as router_user_subscribes} from "./routes/user_subscribes.js";
import {router as router_user_achievement} from "./routes/user_achievements.js";
import router_admin from "./routes/admin.js"
import router_index from "./routes/index.js";
import router_player from "./routes/player.js";
import router_message from "./routes/message.js";
import router_services from "./routes/services.js";

import {query as checkquery, validationResult, body as checkbody} from "express-validator";
import {captchaRateLimiter, UserRateLimiter} from "./middleware/rateLimiter.js";
import {verifyJWT} from "./middleware/auth.js";

import "./services/loader.js";

// process
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err.message, err.stack);
});
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', err.message, err.stack);
});

const app = express();

// initialize swagger-jsdoc
// see swagger docs [https://swagger.io/specification/]
const swaggerSpec = swaggerJsDoc({
    // import swaggerDefinitions
    swaggerDefinition: docs_config,
    // path to the API docs
    apis: ['./routes/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.set('trust proxy', false);
app.use((req, res, next) => {
    let realIP = '';
    switch (true) {
        case !!req.get('CF-Connecting-IP') && config.cloudflare:
            realIP = req.get('CF-Connecting-IP');
            break;
        case !!req.get('X-Forwarded-For') && config.behindProxy:
            realIP = req.get('X-Forwarded-For').split(',').reverse()[config.behindProxy];
            break;
        default:
            realIP = req.ip;
            break;
    }
    req.REAL_IP = realIP;
    next();
});

app.use(cookieParser());    // should throw it into trash bin
app.use(morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const base = `${tokens.status(req, res)} ${tokens.method(req, res)} ${tokens.url(req, res)} in ${tokens['response-time'](req, res)}ms`;
    const verbose = config.logLevel >= 3 ? ` RequestBody: ${JSON.stringify(req.body)}` : '';
    if (config.logLevel < 0)
        return undefined;
    if (status >= 500)
        return logger.toText.error(base + verbose);
    else if (status >= 400)
        return logger.toText.warn(base + verbose);
    else
        return logger.toText.info(base + verbose);
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// cors options
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('Origin')); // better than wildcard *
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, x-access-token' + (config.__DEBUG__ ? ', x-whosdaddy, x-whosdaddy-p' : ''));  // DEBUG
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Cache-Control', "no-cache");
    next();
});

app.use('/static', express.static('./test'));   // debug only
app.use('/api', router_index);
app.use('/api/user', router_user, router_user_subscribes, router_user_achievement);
app.use('/api/admin', router_admin);
app.use('/api/player', router_player);
app.use('/api/message', router_message);
app.use('/api/service', router_services);

/**
 * @swagger
 * /api/captcha:
 *   get:
 *     tags:
 *       - captcha
 *     description: Get CAPTCHA
 */
app.get('/api/captcha', captchaRateLimiter, (req, res, next) => {
    res.status(200).json({success: 1, code: 'captcha.gen', data: generateCaptcha()});
});

app.get('/', (req, res, next) => {
    res.redirect('/static/SPA.html')
});

app.options('*', (req, res, next) => {  // for preflight requests
    res.status(200).send();
});

app.use((req, res, next) => {
    res.status(404).json({error: 1, code: 'request.404'});
});

app.use((err, req, res, next) => { // error handler
    logger.error(err.message, err.stack);
    res.status(500).json({error: 1, code: 'server.error', message: misc.generateErrorHelper(err)});
});

app.listen(config.port, config.address, () => {
    logger.success(`App start at ${config.address}:${config.port}`);
});


export default app;
