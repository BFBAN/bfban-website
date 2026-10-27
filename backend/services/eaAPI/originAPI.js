"use strict";
import got, { HTTPError, ParseError } from "got";
import xmldom from "@xmldom/xmldom";
import * as xpath from "xpath";
import { logger } from "./infrastruc.js";
import { eaHeaders } from "./ea-headers.cjs";
import { authorizeJuno, refreshJuno, authorizeCookies, JunoError } from "./juno.js";
import { SEARCH_PLAYER_QUERY, emailSearchVariables, parseEmailPlayer } from "./player-email.js";

const graphql_url = 'https://service-aggregation-layer.juno.ea.com/graphql';
const gateway_url = 'https://gateway.ea.com';
const EA_APP_UA = 'EAApp/PC/13.796.0.6309';

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
        refresh_token: '',
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

    /**
     * 使用 remid/sid cookie 走 JUNO_PC_CLIENT 的 PKCE 授权流程换取 access token。
     * 优先尝试 refresh_token 续期，失败则回退到完整授权。
     * @returns {Promise<{access_token:string, expires_in:number}>}
     */
    async getSelfAccessToken() {
        const t_start = Date.now();
        try {
            // 1) 优先用 refresh_token 续期（成本更低）
            if (this.tokens.refresh_token) {
                try {
                    const refreshed = await refreshJuno(this.tokens.refresh_token);
                    this.tokens.access_token = refreshed.accessToken;
                    this.tokens.refresh_token = refreshed.refreshToken || this.tokens.refresh_token;
                    this.tokens.expires_when = Date.now() + refreshed.expiresIn * 1000;
                    this.cur_state = 'OK';
                    logger.info('OriginClient.getSelfAccessToken refreshed:', { expires_in: refreshed.expiresIn });
                    return { access_token: refreshed.accessToken, expires_in: refreshed.expiresIn };
                } catch (err) {
                    // 续期失败则回退到完整授权
                    if (!(err instanceof JunoError)) throw err;
                    logger.warn('OriginClient.getSelfAccessToken refresh failed, retrying with cookies:', err.message);
                }
            }

            // 2) 完整授权：PKCE 主路径，失败（cookie 过期）降级到 ORIGIN_JS_SDK 隐式流程
            let result;
            if (!this.cookies.remid && this.cookies.sid) {
                // 只有 sid 没有 remid → 直接走隐式流程
                result = await authorizeCookies({ remid: '', sid: this.cookies.sid });
            } else {
                try {
                    result = await authorizeJuno({ remid: this.cookies.remid, sid: this.cookies.sid });
                } catch (err) {
                    if (!(err instanceof JunoError && err.status === 401)) throw err;
                    logger.warn('OriginClient.getSelfAccessToken juno 401, fallback to authorizeCookies');
                    result = await authorizeCookies({ remid: this.cookies.remid, sid: this.cookies.sid });
                }
            }
            this.tokens.access_token = result.accessToken;
            this.tokens.refresh_token = result.refreshToken || '';
            this.tokens.expires_when = Date.now() + result.expiresIn * 1000;
            // 更新可能被 EA 刷新的 cookie
            if (result.cookies?.remid !== undefined) this.cookies.remid = result.cookies.remid;
            if (result.cookies?.sid !== undefined) this.cookies.sid = result.cookies.sid;

            this.cur_state = 'OK';
            logger.info('OriginClient.getSelfAccessToken Success:', { expires_in: result.expiresIn });
            return { access_token: result.accessToken, expires_in: result.expiresIn };
        } catch (err) {
            if (err instanceof JunoError && err.status === 401) {
                this.cur_state = 'COOKIE_EXPIRED';
                throw new EaApiError(401, err, `${this.tag} Cookies Expired`);
            }
            this.cur_state = 'UNKNOWN_ERROR';
            if (err instanceof EaApiError)
                throw err;
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

    /**
     * 通过 email 查询玩家，返回 userId（字符串）或 null。
     * 优先用 GraphQL SearchPlayer 搜索；搜不到时回退到 pids/me 自检邮箱。
     * @returns {Promise<string|null>} userId
     */
    async searchUserEmail(userEmail, api_urls=origin_api_urls) {
        const t_start = Date.now();
        let variables;
        try {
            variables = emailSearchVariables(userEmail);
        } catch (err) {
            throw new EaApiError(400, null, `${this.tag} Invalid Email`);
        }
        try {
            await this.checkSelfTokenValid(true);
            const token = this.tokens.access_token;

            // 1) GraphQL SearchPlayer 按 email 搜索
            const { body } = await got.post(graphql_url, {
                headers: eaHeaders(graphql_url, {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-client-id': 'EAX-JUNO-CLIENT',
                    'User-Agent': EA_APP_UA,
                }),
                json: { query: SEARCH_PLAYER_QUERY, variables, operationName: 'SearchPlayer' },
                responseType: 'json',
                throwHttpErrors: false,
            });

            if (body.errors?.length)
                throw new EaApiError(500, body.errors, `${this.tag} GraphQL error`);

            const player = parseEmailPlayer(body.data);
            if (player)
                return String(player.userId);

            // 2) 回退：自检当前账号邮箱（搜索目标可能就是账号本身）
            const selfResponse = await got.get(`${gateway_url}/proxy/identity/pids/me`, {
                headers: eaHeaders(gateway_url, {
                    'Authorization': `Bearer ${token}`,
                    'X-Origin-Platform': 'PCWIN',
                    'X-Expand-Results': 'true',
                }),
                throwHttpErrors: false,
                responseType: 'json',
            });
            const identity = selfResponse.body?.pid;
            if (typeof identity?.email === 'string' &&
                identity.email.toLowerCase() === variables.searchText.toLowerCase() &&
                /^[1-9]\d{0,15}$/.test(String(identity.pidId))) {
                return String(identity.pidId);
            }
            return null;
        } catch (err) {
            if (err instanceof EaApiError)
                throw err;
            if (err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response?.statusCode, err.response?.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.searchUserEmail spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    /** @returns {Promise<{username:string, personaId:string, userId:string}>} */
    async getInfoByPersonaId(personaId) {
        const url = `https://gateway.ea.com/proxy/identity/personas?personaUri=/personas/${personaId}`;
        const t_start = Date.now();
        try {
            await this.checkSelfTokenValid(true);
            const response = await got.get(url, {
                headers: eaHeaders(gateway_url, {
                    'Authorization': `Bearer ${this.tokens.access_token}`,
                    'X-Expand-Results': 'true',
                    'X-Origin-Platform': 'PCWIN',
                }),
            }).json();
            if (response.personas && response.personas.persona) {
                const result = response.personas.persona[0];
                if (result.namespaceName !== "cem_ea_id") {
                    throw new EaApiError(404, response, `${this.tag} Not Found Player In ea`);
                }

                const username = result.displayName
                const userId = result.pidId
                const personaId = result.personaId

                if(!username) {
                    throw new EaApiError(404, response, `${this.tag} Not Found`);
                }

                return { username, personaId, userId };

            } else {
                throw new EaApiError(404, response, `${this.tag} Not Found`);
            }
                
        } catch(err) {
            if(err instanceof EaApiError)
                throw err;
            if(err instanceof HTTPError || err instanceof ParseError)
                throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);
            throw new EaApiError(-1, null, err);
        } finally {
            logger.info(`OriginClient.getInfoByPersonaId spent ${(Date.now()-t_start)/1000}s`);
        }
    }

    /** @returns {Promise<{username:string, personaId:string, userId:string}>} */
    async getInfoByUserId(userId, api_urls=origin_api_urls) {
        const url     = 'https://service-aggregation-layer.juno.ea.com/graphql';
        const t_start = Date.now();

        // 确保 userId 是数字或数字字符串
        const pd = Number(userId);
        if (!Number.isFinite(pd)) {
            throw new EaApiError(500, null, `[${this.tag}] GraphQL error`);
        }
        try {
            // 确保 token 有效
            await this.checkSelfTokenValid(true);

            // 直接在 query 文本里插入数字 pd
            const query = `
      query {
        playerByPd(pd: ${pd}) {
          displayName
          pd
          psd
          uniqueName
          nickname
        }
      }
    `;

            const { body } = await got.post(url, {
                headers: eaHeaders(graphql_url, {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${this.tokens.access_token}`,
                    'x-client-id':   'EAX-JUNO-CLIENT',
                    'User-Agent':    EA_APP_UA,
                }),
                json: { query },
                responseType: 'json',
            });

            // GraphQL 层错误
            if (body.errors?.length) {
                throw new EaApiError(500, body.errors, `[${this.tag}] GraphQL error`);
            }

            const player = body.data?.playerByPd;
            if (!player || typeof player !== 'object') {
                throw new EaApiError(404, null, `[${this.tag}] Player ${pd} Not Found`);
            }

            const username  = player.displayName;
            const personaId = String(player.psd);
            const returnedPd= player.pd;  // 通常也是字符串或数字

            if (!username) {
                throw new EaApiError(404, null, `[${this.tag}] Player ${pd} has no displayName`);
            }

            return {
                username,
                personaId,
                userId: String(returnedPd)
            };
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
        const url = 'https://service-aggregation-layer.juno.ea.com/graphql';
        const pd = Number(userId);
        if (!Number.isFinite(pd)) {
            throw new EaApiError(500, null, `${this.tag} Bad Response`);
        }
        try {
            await this.checkSelfTokenValid(true);
            const query = `
      query {
        playerByPd(pd: ${pd}) {
          displayName
          pd
          psd
          avatar {
            medium {
                path
            }
          }
        }
      }
    `;

            const { body } = await got.post(url, {
                headers: eaHeaders(graphql_url, {
                    'Content-Type':  'application/json',
                    'Authorization': `Bearer ${this.tokens.access_token}`,
                    'x-client-id':   'EAX-JUNO-CLIENT',
                    'User-Agent':    EA_APP_UA,
                }),
                json: { query },
                responseType: 'json',
            });

            // GraphQL 层错误
            if (body.errors?.length) {
                throw new EaApiError(500, body.errors, `[${this.tag}] GraphQL error`);
            }

            const player = body.data?.playerByPd;
            if (!player || typeof player !== 'object') {
                throw new EaApiError(404, null, `[${this.tag}] Player ${pd} Not Found`);
            }

            const username  = player.displayName;
            const personaId = String(player.psd);
            const link= player.avatar.medium.path;  // 通常也是字符串或数字

            if(link)
                return link;
            else {
                throw new EaApiError(404, null, `${this.tag} Not Found`);
            }
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
    getInfoByPersonaId: OriginClient.prototype.getInfoByPersonaId,
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
