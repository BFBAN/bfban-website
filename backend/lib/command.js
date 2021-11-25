import db from "../mysql.js";
import { sendMessage } from "../routes/message.js";
import { userHasRoles, privilegeGranter, privilegeRevoker } from "./auth.js";
import { userAttributes } from "./user.js";
import { webhookSubscriber, webhookSupportEvent } from "./webhook.js";

const commands = {
    "webhook": { permission: ['dev', 'bot', 'root'], exec: commandWebhook },
};

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