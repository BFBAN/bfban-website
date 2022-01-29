import fs from "fs";
import worker_threads from "worker_threads";
import config from "../config.js";
import logger from "../logger.js";

const staticConfigerKeys = [
    "secret",
    "captchaExpiresIn",
    "userTokenExpiresIn",
    "port",
    "address",
    "baseDir",
    "behindProxy",
    "mysql",
    "cloudflare",
    "github",
    "mail",
    "services",
];

fs.watchFile('./config.js', async (curr, prev)=> { // dynamic load config
    logger.info('Reading config...');                       // see https://github.com/nodejs/modules/issues/307#issuecomment-858729422
    const tmpenv = new worker_threads.Worker('      \
        const worker=require("worker_threads");     \
        import("./config.js").then(m=>worker.parentPort.postMessage(m.default));', {eval: true});
    tmpenv.once('message', (v)=> {
        for(let i of Object.keys(config))
            if(!staticConfigerKeys.includes(i))
                delete config[i];
        for(let i of Object.keys(v))
            if(!staticConfigerKeys.includes(i))
                config[i] = v[i];
        
        logger.logLevel = config.logLevel;
        logger.success('Config update success.', config);
    });
    tmpenv.once('error', (err)=> {
        logger.error('Config update fail!', err.message, err.stack)
    });
});