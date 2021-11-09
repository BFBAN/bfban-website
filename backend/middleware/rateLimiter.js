"use strict";
import express from "express";
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
     * @returns {(req:express.Request, res:express.Response, next: express.NextFunction)=>void}
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

export {
    UserRateLimiter,
}