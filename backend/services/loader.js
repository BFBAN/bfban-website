"use strict";
import fs from "fs";
import child_process from "child_process";
import worker_threads from "worker_threads";

import config from "../config.js";
import logger from "../logger.js";
import got from "got";
import {fileURLToPath} from "url";

const isStandalone = process.argv[1] == fileURLToPath(import.meta.url) || process.argv[2] == "-standalone";
const services = [];
if (isStandalone)
    logger.success('serviceLoader: started as Standalone mode.');

(async () => {
    for (const serviceName of Object.keys(config.services)) {
        try {
            if (!fs.existsSync(`./services/${serviceName}/index.js`)) {
                logger.error(`serviceLoader: cannot locate service: ${serviceName}, skipped.`);
                continue;
            }
            const deployment = isStandalone ? 'THREAD' : config.services[serviceName].deployment;
            switch (deployment) {
                case 'THREAD':
                    services.push({
                        name: serviceName,
                        deployment: 'THREAD',
                        worker: new worker_threads.Worker(`./services/${serviceName}/index.js`)
                    });
                    break;
                case 'PROCESS':
                    if (await got.get(config.services[serviceName].url, {
                        throwHttpErrors: false,
                    }).then(r => {
                        logger.success(`serviceLoader: service ${serviceName} is already running.`);
                        return true;
                    }).catch(e => { 
                        logger.info(`serviceLoader: service ${serviceName} is not found, starting it.`);
                        return false;
                    }))  // already running?
                        services.push({
                            name: serviceName,
                            deployment: 'PROCESS',
                            worker: undefined
                        });
                    else
                        services.push({
                            name: serviceName,
                            deployment: 'PROCESS',
                            worker: child_process.spawn(`node`, [`./services/${serviceName}/index.js`])
                        });
                    break;
                default:
                    services.push({
                        name: serviceName,
                        deployment: deployment,
                        worker: undefined
                    });
                    break;
            }
            logger.info(`serviceLoader: loaded ${serviceName} as ${deployment}.`);
        } catch (err) {
            logger.error(`serviceLoad: cannot load ${serviceName}, err:${err.stack}`);
        }
    }
})();

export default services;