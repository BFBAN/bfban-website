import db from "../mysql.js";
import { sendMessage } from "../routes/message.js";
import { userHasRoles } from "./auth.js";
import { privilegeGranter, privilegeRevoker, userAttributes } from "./user.js";
import { webhookSubscriber, webhookSupportEvent } from "./webhook.js";

const commands = {
    "webhook": { permission: ['dev', 'bot', 'root'], exec: commandWebhook },
    "user": { permission: ['dev','admin','root','super'], exec: commandUser },
    "comment": { permission: ['root','super'], exec: commandComment },
    "attr": { permission: ['dev','root','super'], exec: commandAttr },
};

/** @param {string[]} args @param {import('../typedef.js').User} user */
async function commandAttr(args, user) { 
    if(!Number.isInteger(args[2]-0))
        return await sendMessage(null, user.id, 'command', 'attr: incorrect params.');
    /** @type {import("../typedef.js").User} */
    const target = await db.select('*').from('users').where({id: args[2]-0 }).first();
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


/** @param {string[]} args @param {import('../typedef.js').User} user */
async function commandComment(args, user) { // comment reply|report|judgement|banAppeal id content
    if( !!args[3] ||                            // if args[3] exist, it must be string 
        args[3].length>=65535 ||                // not too long
        !Number.isInteger(args[2]-0) ||         // not a valid id
        !['reply','report','judgement','banAppeal'].includes(args[1]) )
        return await sendMessage(null, user.id, 'command', 'comment: incorrect params.');
    const dbname = {reply:'replies', report:'reports', judgement:'judgements', banAppeal:'ban_appeals'}[args[1]];
    const contentName = {reply:'content', report:'description', judgement:'content', banAppeal:'content'}[args[1]];
    const updateObj = {}; updateObj[contentName] = args[3]; // set content
    if(args[1]=='report' && !!args[4] && args[4].length<256)
        updateObj['videoLink'] = args[4]; // set videolink for report if it provided
    const changed = await db(dbname).update(updateObj).where({id: parseInt(args[2])});
    return await sendMessage(null, user.id, 'command', `comment: update ${args[1]}:${args[2]} ${changed? 'success':'fail'}.`);
}

/** @param {string[]} args @param {import('../typedef.js').User} user */
async function commandUser(args, user) {            //  [0]  [1]  [2]  [3]
    if(!Number.isInteger(args[2]-0))
        return await sendMessage(null, user.id, 'command', 'user: incorrect params.');
    /** @type {import("../typedef.js").User} */
    const target = await db.select('*').from('users').where({id: args[2]-0 }).first();
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


/** @param {string[]} args @param {import('../typedef.js').User} user */
async function commandWebhook(args, user) { 
    const isEmpty = !webhookSubscriber.getByUserId(user.id);
    switch(args[1]) {                       //   [0]      [1]     [2]  [3] [4]
    case 'subscribe':                       // webhook subscribe event url key
        if(!isEmpty && webhookSubscriber.getByUserId(user.id).size >= 5)
            return await sendMessage(null, user.id, 'command', 'webhook: maximum subscribe amount exceeded.');
        if( args.length == 5 &&                                                     // is all params provided?
            webhookSupportEvent.includes(args[2]) &&                                // is support event?
            /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- ./?%&=]*)?/.test(args[3]) &&     // is valid webhook url?
            args[4].length <= 128 )                                                 // is key length suitable?
            return await sendMessage(null, user.id, 'command', `webhook: subscribe success, id: 
                ${webhookSubscriber.set(user.id, args[2], args[3], args[4])} .`);
        else
            return await sendMessage(null, user.id, 'command', 'webhook: incorrect params.');
    case 'unsubscribe':                     // webhook unsubscribe id
        if(!isEmpty && webhookSubscriber.getByUserId(user.id).has(args[2])) {
            webhookSubscriber.delete(args[2]);
            return await sendMessage(null, user.id, 'command', 'webhook: unsubscribe success.');
        } else 
            return await sendMessage(null, user.id, 'command', 'webhook: no such subscription.');
    case 'ls':
        if(isEmpty)
            return await sendMessage(null, user.id, 'command', `webhook: no subscriptions`);
        return await sendMessage(null, user.id, 'command', `webhook: current subscription:\n    
            ${Array.from(webhookSubscriber.getByUserId(user.id))
                .map(i=>{return i+' '+webhookSubscriber.getByUrlId(i).url})
                .join('\n')} .`);
    default:
        return await sendMessage(null, user.id, 'command', 'webhook: unknown operation.');
    }
}

/** @param {string} command @param {import("../typedef.js").User} user */
async function handleCommand(command, user) {
    const args = command.split(' ', 50);
    if(commands[args[0]] == undefined)
        return sendMessage(null, user.id, 'command', 'command Not found');
    if(!userHasRoles(user, commands[args[0]].permission))
        return sendMessage(null, user.id, 'command', 'permission denied');
    return await commands[args[0]].exec(args, user);
}

export {
    handleCommand,
}