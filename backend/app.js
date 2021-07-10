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
import { query as checkquery, validationResult, body as checkbody } from "express-validator";

const app = express();

app.use(cookieParser());
app.use(morgan(':date[clf] :status :method :url :res[content-length] :response-time ms  :remote-addr'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next)=> {console.log(req.body); next();})

app.use('/test', express.static('./test'));
app.use('/api/index', routes_index);
app.use('/api/user', routes_user);

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