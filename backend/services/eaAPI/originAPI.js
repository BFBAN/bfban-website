"use strict";
import got, { HTTPError, ParseError } from "got";
import xmldom from "@xmldom/xmldom";
import * as xpath from "xpath";
import { logger } from "./infrastruc.js";

class EaApiError extends Error {
    constructor(statusCode, body, msg) {
        super(msg instanceof Error? msg.message : msg);
        if(msg instanceof Error)
            this.stack = msg.stack;
        this.statusCode = statusCode;
        this.body = body;
    }
    statusCode = 0;
    body = '';
}

const origin_api_urls = [
    "api1.origin.com",
//    "api2.origin.com",
//    "api3.origin.com",
//    "api4.origin.com",
];

class OriginClient {
    /** @param {{tag:string,remid:string, sid:string}} accountProp */
    constructor(accountProp) {
        this.tag = accountProp.tag;
        this.cookies.remid = accountProp.remid;
        this.cookies.sid = accountProp.sid;
        this.cur_state = 'UNDEFINED';
    }

    /** @type {'UNDEFINED'|'INITIALIZING'|'OK'|'RATELIMITED'|'COOKIE_EXPIRED'|'UNKNOWN_ERROR'} */
    cur_state = 'UNDEFINED';
    tag = '';
    cookies = {
        remid: '',
        sid: ''
    };
    tokens = {
        access_token: '',
        expires_when: 0,
    };
    self_prop = {
        username: '',
        personaId: '',
        userId: '',
    }

    /** @returns {Promise<true|false>} */
    async checkSelfTokenValid(thenRefresh = true) {
        if(!this.tokens.access_token || Date.now()+30000 > this.tokens.expires_when) // treat it as expired when we will be expired in 30s 
            if(thenRefresh) {
                await this.getSelfAccessToken();
            }
            else
                return false;
        return true; // if no error throwed, it will be always true here
    }

    /** @returns {Promise<{access_token:string, expires_in:number}> */
    async getSelfAccessToken() {
        const url = 'https://accounts.ea.com/connect/auth?client_id=ORIGIN_JS_SDK&response_type=token&redirect_uri=nucleus:rest&prompt=none&release_type=prod';
        const t_start = Date.now();
        try {
            const response = await got.get(url, {
                headers: {
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                    'Cookie': `sid=${this.cookies.sid}; remid=${this.cookies.remid}`
                },
            }).json();
            
            if(response.error_code == "login_required") {
                this.cur_state = 'COOKIE_EXPIRED';
                throw new EaApiError(401, response, `${this.tag} Cookies Expired`);
            } else if(response.error)
                throw new EaApiError(500, response, `${this.tag} Bad Response`);
            
            this.tokens.access_token = response.access_token;
            this.tokens.expires_when = Date.now() + response.expires_in*1000;

            this.cur_state = 'OK';
            logger.info('OriginClient.getSelfAccessToken Success:', {access_token: response.access_token, expires_in: response.expires_in});
            return {access_token: response.access_token, expires_in: response.expires_in};
        } catch(err) { // Handle request error or parse error
            this.cur_state = 'UNKNOWN_ERROR';
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.getSelfAccessToken spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    /** @returns {Promise<{username:string, personaId:string, userId:string>}} */
    async getSelfInfo() {
        const t_start = Date.now();
        const url = 'https://gateway.ea.com/proxy/identity/pids/me/personas';
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                throwHttpErrors: true,
                headers: {
                    'Authorization': `Bearer ${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                    'X-Extended-Pids': 'true',
                    'X-Expand-Results': 'true',
                }
            }).json();

            if(!response.personas.persona || !response.personas.persona[0])
                throw new EaApiError(500, response, `${this.tag} Bad Response`);

            this.self_prop.username = response.personas.persona[0].displayName;
            this.self_prop.userId = response.personas.persona[0].pidId;
            this.self_prop.personaId = response.personas.persona[0].personaId;
            this.cur_state = 'OK';

            logger.info('OriginClient.getSelfInfo Success:', {
                username: this.self_prop.username, 
                userId: this.self_prop.userId, 
                personaId: this.self_prop.personaId
            });
            return {
                username: this.self_prop.username, 
                userId: this.self_prop.userId, 
                personaId: this.self_prop.personaId
            };
        } catch(err) { 
            this.cur_state = 'UNKNOWN_ERROR';
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.getSelfInfo spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    async init() {
        this.cur_state = 'INITIALIZING';
        await this.getSelfAccessToken();
        const selfinfo = await this.getSelfInfo();
        this.cur_state = 'OK';
        return selfinfo;
    }

    /** @returns {Promise<string[]>} userIds */
    async searchUserName(username, api_urls=origin_api_urls) {
        username = encodeURIComponent(username); // avoid url injection
        const url = `https://${api_urls[Math.floor(Math.random()*api_urls.length)]}/xsearch/playersearch?userId=${this.self_prop.userId}&searchTerm=${username}&start=0&pageSize=50`;
        const t_start = Date.now();
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                headers: {
                    'authtoken': `${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                }
            }).json();

            if(typeof(response.totalCount) != 'number')
                throw new EaApiError(500, response, `${this.tag} Bad Response`);
            if(response.totalCount > 0) {
              const permises = []
              response.infoList.forEach(item => {
                const url = `https://${api_urls[Math.floor(Math.random()*api_urls.length)]}/atom/users?userIds=${item.friendUserId}`;
                permises.push(got.get(url, {
                  headers: {
                      'authtoken': `${this.tokens.access_token}`,
                      'Upgrade-Insecure-Requests': 1,
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                  }
                }))
              })
              const results = await Promise.all(permises)
              let item = results.filter(item => item).map(item => {
                const [ player = {} ] = item.users
                return player
              }).find(player => {
                return player.eaId.toLowerCase() == username.toLowerCase()
              })
              return [item.userId];

            }
            else
                return [];
        } catch(err) {
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.searchUserName spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    /** @returns {Promise<string|null>} userId */
    async searchUserEmail(userEmail, api_urls=origin_api_urls) {
        const url = `https://gateway.ea.com/proxy/identity/preferenceUser?email=${userEmail}`;
        const t_start = Date.now();
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'X-Expand-Results': true,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                },
                // body: userEmail,
            }).json();

            // if(typeof(response.totalCount) != 'number')
            //     throw new EaApiError(500, response, `${this.tag} Bad Response`);
            if(response.preferenceUser)
                return response.preferenceUser.nucleusUserUri.replace('/pids/', '')
            else
                return null;
        } catch(err) {
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError) {
                // 尝试解析 err.response.body 为 JSON 对象
                const errorBody = JSON.parse(err.response.body);
                // Check if the error message includes "NO_SUCH_PREFERENCE_USER"
                if(errorBody.error && errorBody.error.code === "NO_SUCH_PREFERENCE_USER") {
                    // throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Cannot Search User`); // Return null for this specific error
                    return null;
                } else {
                    throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
                }
            }
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.searchUserEmail spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    /** @returns {Promise<{username:string, personaId:string, userId:string}>} */
    async getInfoByUserId(userId, api_urls=origin_api_urls) {
        const url = `https://${api_urls[Math.floor(Math.random()*api_urls.length)]}/atom/users?userIds=${userId}`;
        const t_start = Date.now();
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                headers: {
                    'authtoken': `${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                }
            });
            const xmlres = new xmldom.DOMParser().parseFromString(response.body);
            const username = xpath.select1('string(/users[1]/user[1]/EAID[1])', xmlres);
            const personaId = xpath.select1('string(/users[1]/user[1]/personaId[1])', xmlres);
            const userId = xpath.select1('string(/users[1]/user[1]/userId[1])', xmlres);

            if(!username) {
                if(xpath.select1('/users', xmlres))
                    throw new EaApiError(404, response, `${this.tag} Not Found`);
                else
                    throw new EaApiError(500, response, `${this.tag} Bad Response`);
            }
                
            return { username, personaId, userId };
        } catch(err) {
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.getInfoByUserId spent ${(Date.now()-t_start)/1000}s`);
        }
    }
    /** @returns {Promise<void>} */
    async reportUser(userId, content) {}

    /** @returns {Promise<string>} */
    async getUserAvatar(userId, api_urls=origin_api_urls) {
        const t_start = Date.now();
        const url = `https://${api_urls[Math.floor(Math.random()*api_urls.length)]}/avatar/user/${userId}/avatars?size=1`;
        const patten = /<link>(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])<\/link>/
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                throwHttpErrors: true,
                headers: {
                    'authtoken': `${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                }
            });
            const link = patten.exec(response.body);
            if(link)
                return link[1];

            if(response.body.includes('<users/>'))
                throw new EaApiError(404, response, `${this.tag} Not Found`);
            else
                throw new EaApiError(500, response, `${this.tag} Bad Response`);
        } catch(err) {
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);    
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.getUserAvatar spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    async getUserGames(userId, api_urls=origin_api_urls) {
        const t_start = Date.now();
        try {
            const url = `https://${api_urls[Math.floor(Math.random()*api_urls.length)]}/atom/users/${this.self_prop.userId}/other/${userId}/games`;
            const response = await got.get(url, {
                throwHttpErrors: true,
                headers: {
                    'authtoken': `${this.tokens.access_token}`,
                    'Upgrade-Insecure-Requests': 1,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                }
            });
            
            const xmlres = new xmldom.DOMParser().parseFromString(response.body);
            /** @type {string[]} */
            const result = xpath.select('//displayProductName', xmlres).map(i=>i.firstChild.data); // pure game names
            return result;
        } catch(err) {
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);    
            throw new EaApiError(-1, null, err.message);
        } finally {
            logger.info(`OriginClient.getUserGames spent ${(Date.now()-t_start)/1000}s`);
        }
    } 

}

class OriginClientCluster extends Map {
    /** @argument {IterableIterator<[string, OriginClient]>} entries */
    constructor(entries) {
        super(entries);
    }

    #generator = this.entries();
    /** @returns {OriginClient} */
    #getOne() {
        while(this.size > 0) {
            /** @type {IteratorResult<[string, OriginClient]>} */
            const tmp = this.#generator.next();
            if(tmp.done) {
                this.#generator = this.entries();
                continue;
            }
            if(tmp.value[1].cur_state != 'OK') {
                this.delete(tmp.value[0]);
                continue;
            }
            return tmp.value[1];
        }
        throw(new Error('OriginClientCluster: No Working Clients'));
    }

    /** @type {<Func extends Function>(fn: Func, args: Parameters<Func>)=> ReturnType<Func>} */
    invokeMethod(method, ...args) {
        return method.apply(this.#getOne(), args);
    }
    /** @type {(string)=>OriginClient} */
    get;

}


const EaApiMethods = {
    checkSelfTokenValid: OriginClient.prototype.checkSelfTokenValid,
    getSelfAccessToken: OriginClient.prototype.getSelfAccessToken,
    getSelfInfo: OriginClient.prototype.getSelfInfo,
    initSelf: OriginClient.prototype.init,
    searchUserName: OriginClient.prototype.searchUserName,
    searchUserEmail: OriginClient.prototype.searchUserEmail,
    getInfoByUserId: OriginClient.prototype.getInfoByUserId,
    reportUser: OriginClient.prototype.reportUser,
    getUserAvatar: OriginClient.prototype.getUserAvatar,
    getUserGames: OriginClient.prototype.getUserGames
};

export {
    EaApiError,
    OriginClient,
    OriginClientCluster,
    EaApiMethods,
};
