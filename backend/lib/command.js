import got from "got";
import uuid from "uuid";
import db from "../mysql";
import { sendMessage } from "../routes/message";
import { userHasRoles } from "./auth";
import { privilegeGranter, privilegeRevoker, userAttributes } from "./user";


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
    /** @param {number} userId */
    getByUserId(userId) {
        return this.users.get(userId);
    },
    /** @param {string} event */
    getByEvent(event) {
        return this.events.get(event);
    }
};


const commands = {
    "webhook": { permission: ['dev', 'bot', 'root'], exec: commandWebhook },
    "user": { permission: ['dev','admin','root','super'], exec: commandUser },
    "comment": { permission: ['root','super'], exec: commandComment },
    "attr": { permission: ['dev','root','super'], exec: commandAttr },
};

/** @param {string[]} args @param {import('../typedef.js').ReqUser} user */
async function commandAttr(args, user) { 
    if(!Number.isInteger(parseInt(args[2])))
        return await sendMessage(null, user.id, 'command', 'attr: incorrect params.');
    /** @type {import("../typedef.js").User} */
    const target = (await db.select('*').from('users').where({id: parseInt(args[2])}) )[0];
    if(!target)
        return await sendMessage(null, user.id, 'command', 'attr: user notfound.');

    if(args[1]=='show') {   // attr show id [path]
        if(args[3])
            return await sendMessage(null, user.id, 'command', `attr: user ${target.username} ${args[3]}:${JSON.stringify(target.attr[args[3]])}`);
        else
            return await sendMessage(null, user.id, 'command', `attr: user ${target.username} ${JSON.stringify(target.attr)}`);
    } else if(args[1]=='set') { // attr set id path [val]
        if(args[4] && userAttributes[args[3]] != undefined) { // set value, if args[4] exist, then args[3] exist
            let val;
            switch(userAttributes[args[3]].type) { // parse value into required format
            case 'string':
                val = args[4]; break;
            case 'boolean':
                val = args[4]=='true'? true : false; break;
            case 'number':
                val = isNaN(args[4]-0)? args[4]-0 : 0; break;
            default:
                val = undefined; break;
            }
            target.attr[args[3]] = val;
        } else {
            delete target.attr[args[3]];
        }
        await db('users').update('attr', JSON.stringify(target.attr)).where({id: target.id});
        return await sendMessage(null, user.id, `command', 'attr: user ${target.username} ${JSON.stringify(target.attr)}`);
    } else
        return await sendMessage(null, user.id, 'command', 'attr: incorrect params.');
}


/** @param {string[]} args @param {import('../typedef.js').ReqUser} user */
async function commandComment(args, user) { // comment reply|report|judgement|banappeal id content
    if( !!args[3] || // if args[3] exist, it must be string 
        args[3].length>=65535 || // not too long
        !Number.isInteger(parseInt(args[2])) || // not a valid id
        !['reply','report','judgement','banappeal'].includes(args[1]) )
        return await sendMessage(null, user.id, 'command', 'comment: incorrect params.');
    const dbname = {reply:'replies', report:'reports', judgement:'judgements', banappeal:'ban_appeals'}[args[1]];
    const contentName = {reply:'content', report:'description', judgement:'content', banappeal:'content'}[args[1]];
    const updateObj = {}; updateObj[contentName] = args[3]; // set content
    if(args[1]=='report' && !!args[4] && args[4].length<256)
        updateObj['videoLink'] = args[4]; // set videolink for report if it provided
    const changed = await db(dbname).update(updateObj).where({id: parseInt(args[2])});
    return await sendMessage(null, user.id, 'command', `comment: update ${args[1]}:${args[2]} ${changed? 'success':'fail'}.`);
}

/** @param {string[]} args @param {import('../typedef.js').ReqUser} user */
async function commandUser(args, user) {            //  [0]  [1]  [2]  [3]
    if(!Number.isInteger(parseInt(args[2])))
        return await sendMessage(null, user.id, 'command', 'user: incorrect params.');
    /** @type {import("../typedef.js").User} */
    const target = (await db.select('*').from('users').where({id: parseInt(args[2])}) )[0];
    if(!target)
        return await sendMessage(null, user.id, 'command', 'user: no such user.');

    const devCan=['normal','bot','blacklisted','freezed'],
          superCan=['normal','admin','blacklisted','freezed'], 
          rootCan=['normal','admin','bot','super','dev','blacklisted','freezed'];
    if(args[1]=='grant'||args[1]=='revoke') {       //  [0]  [1]  [2]  [3]
        let flag = false;                           // user grant who role
        const executor = args[1]=='grant'? privilegeGranter : privilegeRevoker;
        // check if current user can grant such permission
        flag = (userHasRoles(user, ['dev']) && devCan.includes(args[3]) )? true : flag;
        flag = (userHasRoles(user, ['super']) && superCan.includes(args[3]) )? true : flag;
        flag = (userHasRoles(user, ['root']) && rootCan.includes(args[3]) )? true : flag;
        if(flag) {
            target.privilege = executor(target.privilege, args[3]);
            await db('users').update({privilege: target.privilege}).where({id: target.id});
            return await sendMessage(null, user.id, 'command', `user: grant ${target.username} with ${target.privilege} success`);
        } else {
            return await sendMessage(null, user.id, 'command', 'user: permission denied.');
        }
    } else if(args[1]=='ban') {
        if(userHasRoles(user, ['dev','admin','super','root'])) {
            target.privilege = privilegeRevoker(target.privilege, 'blacklisted');
            await db('users').update({privilege: target.privilege}).where({id: target.id});
            return await sendMessage(null, user.id, 'command', `user: grant ${target.username} with ${target.privilege} success`);
        } else {
            return await sendMessage(null, user.id, 'command', 'user: permission denied.');
        }
    }
    return await sendMessage(null, user.id, 'command', 'user: unknown operation.');
}


/** @param {string[]} args @param {import('../typedef.js').ReqUser} user */
async function commandWebhook(args, user) { 
    switch(args[1]) {                       //   [0]      [1]     [2]  [3] [4]
    case 'subscribe':                       // webhook subscribe event url key
        if(webhookSubscriber.getByUserId(user).size >= 5)
            return await sendMessage(null, user.id, 'command', 'webhook: maximum subscribe amount exceeded.');
        if( ['stateChange', 'register'].includes(args[2]) && 
            /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(args[3]) &&
            args[4].length <= 128 )
            return await sendMessage(null, user.id, 'command', `webhook: subscribe success, id: 
                ${webhookSubscriber.set(user.id, args[2], args[3], args[4])} .`);
        else
            return await sendMessage(null, user.id, 'command', 'webhook: incorrect params.');
    case 'unsubscribe':                     // webhook unsubscribe id
        if(webhookSubscriber.getByUserId(user.id).has(args[2])) {
            webhookSubscriber.delete(args[2]);
            return await sendMessage(null, user.id, 'command', 'webhook: unsubscribe success.');
        } else 
            return await sendMessage(null, user.id, 'command', 'webhook: no such subscription.');
    case 'ls':
        return await sendMessage(null, user.id, 'command', `webhook: current subscription:\n    
            ${Array.from(webhookSubscriber.getByUserId(user.id)).join('\n    ')} 
            .`);
    default:
        return await sendMessage(null, user.id, 'command', 'webhook: unknown operation.');
    }
}


async function handleCommand(command, user) {
    const args = command.split(',', 50);
    if(commands[args[0]] == undefined)
        return 'command.notFound';
    if(!userHasRoles(user, commands[args[0]].permission))
        return 'command.permissionDenied';
    return await commands[args[0]].exec(args);
}

