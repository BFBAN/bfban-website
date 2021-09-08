"use strict";
import got from "got";
import xmldom from "xmldom";
import * as xpath from "xpath";
import config from "../config.js";
import logger from "../logger.js";

const origin_api_urls = [
  "api1.origin.com",
//    "api2.origin.com",
//    "api3.origin.com",
//    "api4.origin.com",
];

class OriginClient {
  /** @param {{tag:string,remid:string, sid:string}} cookies */
  constructor(cookies) {
    this.tag = cookies.tag;
    this.cookies = cookies;
    this.cur_state = OriginClient.STATE.OK;
  }

  static STATE = {
    'UNDEFINED': 0, 'OK': 1, 'INVALID_COOKIE': 2, 'INITIALIZING': 3, 'UNKNOWN_ERROR': 255,
    0: 'UNDEFINED', 1: 'OK', 2: 'INVALID_COOKIE', 3: 'INITIALIZING', 255: 'UNKNOWN_ERROR'
  };
  cur_state = 0;
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
    if (!this.tokens.access_token || Date.now() + 30000 > this.tokens.expires_when) // treat it as expired when we will be expired in 30s
      if (thenRefresh)
        await this.getSelfAccessToken();
      else
        return false;
    return true; // if no error throwed, it will be always true here
  }

  /** @returns {Promise<{access_token:string, expires_in:number}> */
  async getSelfAccessToken() {
    const url = 'https://accounts.ea.com/connect/auth?client_id=ORIGIN_JS_SDK&response_type=token&redirect_uri=nucleus:rest&prompt=none&release_type=prod';
    const t_start = Date.now();
    try {
      let body;
      try {
        const response = await got.get(url, {
          throwHttpErrors: false,
          timeout: 30000,
          retry: 2,
          headers: {
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            'Cookie': `sid=${this.cookies.sid}; remid=${this.cookies.remid}`
          },
        });
        body = JSON.parse(response.body);
      } catch (err) { // Handle request error or parse error
        this.cur_state = OriginClient.STATE.UNKNOWN_ERROR;
        throw(new Error('Request Failed: ' + err.message));
      }
      switch (body.error_code) {
        case undefined:
          if (body.access_token && body.expires_in) { // reponse correct?
            this.tokens.access_token = body.access_token;
            this.tokens.expires_when = Date.now() + body.expires_in * 1000;
            logger.info('originClient.getSelfAccessToken Success:', {
              access_token: body.access_token,
              expires_in: body.expires_in
            });
            return {access_token: body.access_token, expires_in: body.expires_in}; // Return here
          }
          this.cur_state = OriginClient.STATE.UNKNOWN_ERROR;
          throw(new Error('Bad Response: ' + JSON.stringify(body)));
        case 'login_required':
          this.cur_state = OriginClient.STATE.INVALID_COOKIE;
          throw(new Error('Cookie expired'));
        default:
          this.cur_state = OriginClient.STATE.UNKNOWN_ERROR;
          throw(new Error('Bad Response: ' + JSON.stringify(body)));
      }
    } catch (err) {
      throw(new Error('OriginCient.getSelfAccessToken() > ' + err.message));
    } finally {
      logger.info(`originClient.getSelfAccessToken spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  /** @returns {Promise<{username:string, personaId:string, userId:string>}} */
  async getSelfInfo() {
    const t_start = Date.now();
    const url = 'https://gateway.ea.com/proxy/identity/pids/me';
    try {
      await this.checkSelfTokenValid(true);
      const response = await got.get(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
        headers: {
          'Authorization': `Bearer ${this.tokens.access_token}`,
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
          'X-Extended-Pids': 'true',
          'X-Include-UnderAge': 'true'
        }
      });
      const body = JSON.parse(response.body);
      if (!(body.pid && body.pid.externalRefValue))
        throw(new Error('Bad Response: ' + JSON.stringify(body)));
      const selfUserId = body.pid.externalRefValue;
      const {username, personaId} = await this.getInfoByUserId(selfUserId);
      this.self_prop.username = username;
      this.self_prop.userId = selfUserId;
      this.self_prop.personaId = personaId;
      logger.info('originClient.getSelfInfo Success:', {username, selfUserId, personaId});
    } catch (err) {
      throw(new Error('OriginCient.getSelfInfo() > ' + err.message));
    } finally {
      logger.info(`originClient.getSelfInfo spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  /** @returns {Promise<string|null>} userId */
  async searchUserName(username, api_urls = origin_api_urls) {
    username = encodeURIComponent(username); // avoid url injection
    const url = `https://${api_urls[Math.floor(Math.random() * api_urls.length)]}/xsearch/users?userId=${this.self_prop.userId}&searchTerm=${username}&start=0`;
    const t_start = Date.now();
    try {
      await this.checkSelfTokenValid(true);
      const response = await got.get(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
        headers: {
          'authtoken': `${this.tokens.access_token}`,
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        }
      });
      const body = JSON.parse(response.body);
      if (body.totalCount >= 1 && body.infoList && body.infoList.length)
        return body.infoList[0].friendUserId;
      else if (body.totalCount == 0)
        return null;
      else
        throw(new Error('Bad Response: ' + response.body));
    } catch (err) {
      throw(new Error('OriginClient.searchUserName() > ' + err.message));
    } finally {
      logger.info(`originClient.searchUserName spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  /** @returns {Promise<string|null>} userId */
  async searchUserEmail(userEmail, api_urls = origin_api_urls) {
    const url = `https://${api_urls[Math.floor(Math.random() * api_urls.length)]}/xsearch/users?userId=${this.self_prop.userId}&start=0`;
    const t_start = Date.now();
    try {
      await this.checkSelfTokenValid(true);
      const response = await got.post(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
        headers: {
          'authtoken': `${this.tokens.access_token}`,
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        },
        body: userEmail,
      });
      const body = JSON.parse(response.body);
      if (body.totalCount >= 1 && body.infoList && body.infoList.length)
        return body.infoList[0].friendUserId;
      else if (body.totalCount == 0)
        return null;
      else
        throw(new Error('Bad Response: ' + response.body));
    } catch (err) {
      throw(new Error('OriginClient.searchUserEmail() > ' + err.message));
    } finally {
      logger.info(`originClient.searchUserEmail spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  /** @returns {Promise<{username:string, personaId:string, userId:string}>} */
  async getInfoByUserId(userId, api_urls = origin_api_urls) {
    const url = `https://${api_urls[Math.floor(Math.random() * api_urls.length)]}/atom/users?userIds=${userId}`;
    const t_start = Date.now();
    try {
      await this.checkSelfTokenValid(true);
      const response = await got.get(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
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
      if (!username && !personaId && !userId)
        throw(new Error('Bad Response: ' + response.body));
      return {username, personaId, userId};
    } catch (err) {
      throw(new Error('OriginClient.getInfoByUserId() > ' + err.message));
    } finally {
      logger.info(`originClient.getInfoByUserId spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  /** @returns {Promise<void>} */
  async reportUser(userId, content) {
  }

  /** @returns {Promise<string>} */
  async getUserAvatar(userId, api_urls = origin_api_urls) {
    const t_start = Date.now();
    const url = `https://${api_urls[Math.floor(Math.random() * api_urls.length)]}/avatar/user/${userId}/avatars?size=1`;
    const patten = /<link>(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])<\/link>/
    try {
      await this.checkSelfTokenValid(true);
      const response = await got.get(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
        headers: {
          'authtoken': `${this.tokens.access_token}`,
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        }
      });
      const link = patten.exec(response.body);
      if (link)
        return link[1];
      else
        throw(new Error('Bad Response: ' + response.body));
    } catch (err) {
      throw(new Error('OriginClient.getUserAvatar() > ' + err.message));
    } finally {
      logger.info(`originClient.getUserAvatar spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

  async getUserGames(userId, api_urls = origin_api_urls) {
    const t_start = Date.now();
    try {
      const url = `https://${api_urls[Math.floor(Math.random() * api_urls.length)]}/atom/users/${this.self_prop.userId}/other/${userId}/games`;
      const response = await got.get(url, {
        throwHttpErrors: true,
        timeout: 30000,
        retry: 2,
        headers: {
          'authtoken': `${this.tokens.access_token}`,
          'Upgrade-Insecure-Requests': 1,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        }
      });

      const xmlres = new xmldom.DOMParser().parseFromString(response.body);
      /** @type {string[]} */
      const result = xpath.select('//displayProductName', xmlres).map(i => {
        return i.firstChild.data
      }); // pure game names
      return result;
    } catch (err) {
      throw(new Error('OriginClient.getUserGames() > ' + err.message));
    } finally {
      logger.info(`originClient.getUserGames spent ${(Date.now() - t_start) / 1000}s`);
    }
  }

}

class OriginClientCluster {
  /** @param {OriginClient[]} clients */
  constructor(clients) {
    this.clients = clients;
  }

  /** @type {OriginClient[]} */
  clients = [];
  _index = 0;

  getOne() {
    while (this.clients.length || 0) {
      this._index %= this.clients.length // ensure the index is in the range of array
      if (this.clients[this._index].cur_state == OriginClient.STATE.OK) {
        logger.info('OriginClientCluster.getOne: using ' + this.clients[this._index].tag)
        return this.clients[this._index++];
      } else // remove the failed one
        this.clients = this.clients.slice(0, this._index).concat(this.clients.slice(this._index + 1));
    } // we have ran up all the clients here
    throw(new Error('OriginCientCluster > get(): No Working Clients'));
  }

  /** @param {OriginClient[]} clients */
  set(clients) {
    this.clients = clients;
  }

  getAliveNum() {
    return this.clients.length;
  }
}

async function getUserProfileByName(originName) {
  const client = originClients.getOne();
  const originUserId = await client.searchUserName(originName); // be aware, this origin name is not case-sesitive
  if (!originUserId)
    throw new Error('origin: User not found.');
  const profile = await client.getInfoByUserId(originUserId); // use it for later db operations
  if (profile.username.toLowerCase() !== originName.toLowerCase())
    throw new Error('origin: Found user do not match.');
  return profile;
}

const originClients = new OriginClientCluster();

async function createAccounts() {
  const accounts = config.originAccounts;
  const clients = [];
  for (let i of accounts)
    clients.push(new OriginClient({tag: i.tag, remid: i.remid, sid: i.sid}));
  await Promise.all(clients.map(i => {
    return i.getSelfInfo()
  }));
  originClients.set(clients);
}

export {
  OriginClient,
  OriginClientCluster,
  originClients,
  createAccounts,
  getUserProfileByName,
};
