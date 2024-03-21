"use strict";
import express from "express";
import rateLimit from "express-rate-limit";
import config from "../config.js";
import { userHasRoles } from "../lib/auth.js";

class UserRateLimiter {
    /** @param {number} windowMs @param {number} max */
    constructor(windowMs, max) {
        this.max = max;
        this.interval = setInterval(()=>this.store.clear(), windowMs);
    }
    destroy() {
        clearInterval(this.interval);
    }

    max = 0;
    /** @type {Map<number,number>} */
    store = new Map();
    /** @type {NodeJS.Timer} */
    interval = undefined;
    
    /** 
     * @param {undefined|number|{roles:string[], value:number}[]} weight
     * @returns {(req:express.Request&import("../typedef.js").ReqUser, res:express.Response, next: express.NextFunction)=>void}
    **/
    limiter(weight) {
        if(Array.isArray(weight)) { // sort from low to high, make the weight the user get as low as possible
            weight.sort((a, b)=> {
                return b.value-a.value;
            });
            weight.push({roles: ['*'], value: 1}); // default value
        }
        return (req, res, next)=> {
            const cur = this.store.get(req.user.id);
            if((cur && cur>=this.max) || this.max<=0)
                return res.status(406).json({error: 1, code: 'request.rateLimited', message: 'slow down please.'});
            
            switch(typeof(weight)) {
            case 'number':
                this.store.set(req.user.id, cur? cur+weight : weight);
                break;
            case 'object': // array
                for(let i of weight)
                    if(userHasRoles(req.user, i.roles)) {
                        this.store.set(req.user.id, cur? cur+i.value : i.value);
                        break;
                    }
                break;
            default:
                this.store.set(req.user.id, cur? cur+1 : 1);
                break;
            }
            return next();
        };
    }
}

const commentRateLimiter = new UserRateLimiter(600*1000, 20);   // 20 comments per 10 minutes(allow brust comment)
const advSearchRateLimiter = new UserRateLimiter(15*1000, 1);   // 1 origin search request per 15s
const normalSearchRateLimiter = rateLimit({                     // 5 normal search request per 1s, 100 for des/admins 
    windowMs: 1000, 
    max: (req, res)=>{ 
        if(!!req.user && userHasRoles(req.user, ['dev','bot','admin','super','root']))
            return 100;
        else
            return 5;
    },
    message: {error: 1, code: 'request.rateLimited', message: 'slow down please.'}
});
const viewedRateLimiter = rateLimit({                             // 20 viewed per 10s(allow brust viewed)
    windowMs: 10000,
    max: 20,
    message: {error: 1, code: 'request.rateLimited', message: 'slow down please.'}
});
const captchaRateLimiter = rateLimit({
    windowMs: 1000,
    max: 5,
    message: {error: 1, code: 'request.rateLimited', message: 'slow down please.'}
});

const statisticsLimiter = rateLimit({
    windowMs: 10000,
    max: 5,
    message: {error: 1, code: 'request.rateLimited', message: 'slow down please.'}
});

export {
    UserRateLimiter,
    commentRateLimiter,
    advSearchRateLimiter,
    normalSearchRateLimiter,
    viewedRateLimiter,
    captchaRateLimiter,
    statisticsLimiter,
}