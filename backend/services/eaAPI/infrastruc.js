import EventEmitter from "events";
import fs from "fs"
import { Logger } from "../../logger.js";

/** @type {{address:string, port:string, logLevel: number, accounts:{name:string,sid:string,remid:string}[]}} */
const svcConfig = JSON.parse(fs.readFileSync("./services/eaAPI/config.json"));
const staticConfigerKeys = [
    "address",
    "port",
];

const logger = new Logger('eaAPI', svcConfig.logLevel);
const configUpdated = new EventEmitter();

fs.watchFile('./services/eaAPI/config.json', (curr, prev)=>{
    logger.info('Reading config...');
    try {
        const tmp = JSON.parse(fs.readFileSync("./services/eaAPI/config.json"));
        for(let i of Object.keys(svcConfig))
            if(!staticConfigerKeys.includes(i))
                delete svcConfig[i];
        for(let i of Object.keys(tmp))
            if(!staticConfigerKeys.includes(i))
                svcConfig[i] = tmp[i];
        
        logger.logLevel = svcConfig.logLevel;
        configUpdated.emit('updated', svcConfig);
        logger.success('Config update success.', svcConfig);
    } catch(err) {
        logger.error('Config update fail!', err.message, err.stack);
    }
});

export {
    svcConfig,
    configUpdated,
    logger
}

