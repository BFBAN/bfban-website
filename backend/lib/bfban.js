import config from "../config.js";
import db from "../mysql.js";
import { userHasRoles } from "./auth.js";

const states_map = [ // from one status to another status, by specified path:{action, privilege}, if no such path, stay still
    // no cheater profile, report
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
    { from: 6,      to: 1,  action: 'gulit',    privilege: toConfirm }, // to confirm ban, must supported by at least $config.personsToConfirm person
    { from: 6,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 6,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 6,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to discuss
    { from: 6,      to: 1,  action: 'kill',     privilege: ['super', 'root'] }, // DIRECT confirm ban
    // confirmed ban, wont change status for report, gulit, kill
    { from: 1,      to: 2,  action: 'suspect',  privilege: ['admin', 'super', 'root'] }, // to suspect
    { from: 1,      to: 3,  action: 'innocent', privilege: ['admin', 'super', 'root'] }, // to innocent
    { from: 1,      to: 4,  action: 'trash',    privilege: ['admin', 'super', 'root'] }, // to discuss
];

/** @param {{id:number, username:string, privilege: string[]}} user @param {{id:number,originName:string,originUserId:string,originPersonaId:string}} cheater */
async function toConfirm(cheater, user) {
    try { // iterate each judgement desc, if $config.personsToConfirm think the guy is gulity without any objection in them, then confirm
        if(!userHasRoles(user, ['admin', 'super', 'root']))
            return false; // permission not enough
        const prev = await db.select('byUserId', 'action').from('judgements').where({toCheaterId: cheater.id}).orderBy('createTime','desc')
        const supportJudge = new Set();
        for(let i of prev) {
            if(i.action!='gulity' || i.action!='kill')
                break; // objection! exit support judgement count
            else
                supportJudge.add(i.byUserId);
        }
        if(supportJudge.size > config.personsToConfirm)
            return true;
        return false;
    } catch(err) {
        throw(err);
    }
}

async function stateMachine(cheater, user, action) { // write action to DB first!
    // TODO: utilize states_map
}