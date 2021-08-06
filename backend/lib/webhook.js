import got from "got";
import * as uuid from "uuid";
import config from "../config.js";
import logger from "../logger.js";
import { siteEvent } from "./bfban.js";

const webhookSupportEvent = Object.keys(webhookPayload); // ['stateChange', 'register', 'banAppeal','playerUpdate']
const webhookSubscriber = {
    /** @type {Map<string, {url: string, event: string, userId: number, key: string}>} */
    urls: new Map(),
    /** @type {Map<string, Set<string>>} */
    events: new Map(),
    /** @type {Map<number, Set<string>>} */
    users: new Map(),
    /** @param {string} url @param {number} userId @param {string} event @param {string} keys */
    set(userId, event, url, key) {
        const urlId = uuid.v4();
        this.urls.set(urlId, {url, event, userId, key});
        const eventSubs = this.events.get(event);
        this.events.set(event, eventSubs? eventSubs.add(urlId) : new Set([urlId]) );
        const userSubs = this.users.get(userId);
        this.users.set(userId, userSubs? userSubs.add(urlId) : new Set([urlId]) );
        return urlId;
    },
    /** @param {string} urlId */
    delete(urlId) {
        const {userId, event} = this.urls.get(urlId);
        this.urls.delete(urlId);
        this.events.get(event).delete(urlId);
        this.users.get(userId).delete(urlId);
    },
    /** @param {string} urlId */
    getByUrlId(urlId) {
        return this.urls.get(urlId);
    },
    /** @param {string[]|Set<string>} urlIds */
    getByUrlIds(urlIds) {
        if(urlIds instanceof Set)
            urlIds = Array.from(urlIds);
        return urlIds.map(i=>this.getByUrlId(i));
    },
    /** @param {number} userId */
    getByUserId(userId) {
        return this.users.get(userId);
    },
    /** @param {string} event */
    getByEvent(event) {
        return this.events.get(event);
    }
};

const webhookPayload = {
    stateChange:    [],
    register:       [],
    banAppeal:      [],
    playerUpdate:   [],
};


async function webhookPlayerStateChange(params) {
    /** @type {import("../typedef.js").Player} */
    const player = params.player;
    /** @type {{prev: ?number, next: number}} */
    const stateChange = params.stateChange;
    if(stateChange.prev != stateChange.next)
        webhookPayload.stateChange.push({
            id: player.id,
            originUserId: player.originUserId,
            originPersonaId: player.originPersonaId,
            originName: player.originName,
            prevState: stateChange.prev,
            nextState: stateChange.next,
            updateTime: player.updateTime,
        });
}

async function webhookUserRegister(params) {
    /** @type {import("../typedef.js").User} */
    const user = params.user;
    webhookPayload.register.push({
        id: user.createTime,
        createTime: user.createTime,
    });
}

async function webhookbanAppeal(params) {
    /** @type {import("../typedef.js").BanAppeal} */
    const ban_appeal = params.ban_appeal;
    webhookPayload.banAppeal.push({
        id: ban_appeal.id,
        toPlayerId: ban_appeal.toPlayerId,
        content: ban_appeal.content,
        createTime: ban_appeal.createTime
    });
}

async function webhookSender() {
    await Promise.all(Object.keys(webhookPayload).map((i)=> {
        const p = undefined;
        /*const p = got.post(config.webhook.senderUrl, {
            headers: {
                "x-access-token": config.webhook.token,
            },
            json: {
                event: i,
                feed_urls: webhookSubscriber.getByUrlIds(webhookSubscriber.getByEvent(i)),
                data: webhookPayload[i]
            }
        });*/ // DEBUG
        logger.info(`webhook event[${i}] is sending`);
        webhookPayload[i] = '';
        return p;
    })/* Obj.keys.map()->Promise[] */ ).catch((err)=> {
        logger.error('Webhook sender error: '+ err.message, err.stack);
    });
}

const webhookTimer = setInterval(webhookSender, 30000);

/** @param {import("../typedef.js").SiteEvent} event */
async function webhookOnSiteEvent(event) {
    try {
    switch(event.method) {
    case 'report':
        webhookPlayerStateChange(event.params); break;
    case 'judge':
        webhookPlayerStateChange(event.params); break;
    case 'register':
        webhookUserRegister(event.params); break;
    case 'banAppeal':
        webhookbanAppeal(event.params); break;
    case 'playerUpdate':
        webhookPayload.playerUpdate.push(event.params.profile); break;
    }
    } catch(err) {
        logger.error(`webhookOnSiteEvent: `+err.message, err.stack);
    } 
}

siteEvent.on('data', webhookOnSiteEvent);

export {
    webhookSubscriber,
    webhookSupportEvent,
    webhookSender,
    webhookTimer,
}