import config from "../config.js";
import db from "../mysql.js";
import { userHasRoles } from "./auth.js";

const states_map = [ // from one status to another status, by specified path:{action, privilege}, if no such path, stay still
    // no player profile, report
    { from: null,   to: 0,  action: 'report',   notprivilege: ['freezed', 'blacklisted'] },
    // reported, wait for process
    { from: 0,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 0,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 0,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to trash
    { from: 0,      to: 5,  action: 'dicuss',   privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 0,      to: 6,  action: 'guilt',    privilege: ['admin', 'super', 'root'] }, // to pre-confirm ban
    { from: 0,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // suspect
    { from: 2,      to: 0,  action: 'report',   notprivilege: ['freezed', 'blacklisted'] }, // re-report, with new evidence, back to wait for process
    { from: 2,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 2,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to trash
    { from: 2,      to: 5,  action: 'dicuss',   privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 2,      to: 6,  action: 'guilt',    privilege: ['admin', 'super', 'root'] }, // to pre-confirm ban
    { from: 2,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // innocent
    { from: 3,      to: 0,  action: 'report',   notprivilege: ['freezed', 'blacklisted'] }, // re-report, with new evidence, back to wait for process
    { from: 3,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 3,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to trash
    { from: 3,      to: 5,  action: 'dicuss',   privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 3,      to: 6,  action: 'guilt',    privilege: ['admin', 'super', 'root'] }, // to pre-confirm ban
    { from: 3,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // trash
    { from: 4,      to: 0,  action: 'report',   notprivilege: ['freezed', 'blacklisted'] }, // re-report, with new evidence, back to wait for process
    { from: 4,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 4,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 4,      to: 5,  action: 'dicuss',   privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 4,      to: 6,  action: 'guilt',    privilege: ['admin', 'super', 'root'] }, // to pre-confirm ban
    { from: 4,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // discuss
    { from: 5,      to: 0,  action: 'report',   notprivilege: ['freezed', 'blacklisted'] }, // re-report, with new evidence, back to wait for process
    { from: 5,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 5,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 5,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 5,      to: 6,  action: 'guilt',    privilege: ['admin', 'super', 'root'] }, // to pre-confirm ban
    { from: 5,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // pre-confirm, dont handle re-report here
    { from: 6,      to: 1,  action: 'guilt',    privilege: toConfirm }, // to confirm ban, must supported by at least $config.personsToConfirm person
    { from: 6,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 6,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 6,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 6,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // confirmed ban, wont change status for report, guilt, kill
    { from: 1,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 1,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 1,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to discuss
];

/** 
 * @param {import("../typedef.js").Player} player 
 * @param {import("../typedef.js").ReqUser} user */
async function toConfirm(player, user) {
    try { // iterate each judgement desc, if $config.personsToConfirm people think the guy is guilty without any objection in them, then confirm
        if(!userHasRoles(user, ['admin', 'super', 'root'])) // well, we should have check that before, but anyway
            return false; // permission not enough
        const prev = await db.select('byUserId', 'action').from('judgements').where({toPlayerId: player.id}).orderBy('createTime','desc')
        const supportJudges = new Set();
        for(let i of prev) {
            if(i.action!='guilt' || i.action!='kill')
                break; // objection! exit support judgements count
            else
                supportJudges.add(i.byUserId);
        }
        if(supportJudges.size >= config.personsToConfirm)
            return true; // heeeeeeeeear~
        return false; // objection!
    } catch(err) {
        throw(err);
    }
}

/** 
 * @param {import('../typedef.js').Player} player 
 * @param {import('../typedef.js').ReqUser} user 
 * @param {'report'|'suspect'|'innocent'|'trash'|'discuss'|'guilt'|'kill'} action 
 * */
async function stateMachine(player, user, action) { // normally we should write action to DB first
    for(let i of states_map) { // iterate each path
        if(i.from == player.status && i.action == action) {
            switch(true) { // if all requires are satified, then go, no second chance.
            case Array.isArray(i.privilege):
                if(userHasRoles(user, i.privilege))
                    return i.to;
                break;
            case Array.isArray(i.notprivilege):
                if(!userHasRoles(user, i.notprivilege)) // uer has not roles
                    return i.to;
                break;
            case typeof(i.privilege)=='function':
                if(await i.privilege(player, user)) // maybe async here
                    return i.to;
                break;
            }
        }
    } // no valid path, dont go anywhere
    return player.status; // no changes
}

export {
    stateMachine,
}