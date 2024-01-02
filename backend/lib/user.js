"use strict";
import xss from "xss";
import express from "express";
import db from "../mysql.js";
import config from "../config.js";
import {userHasRoles} from "./auth.js";

const xssConfig = {
    whiteList: {
        div: [],
        p: [],
        ul: [],
        oi: [],
        li: [],
        span: [],
        u: [],
        i: [],
        strong: [],
        br: [],
        hr: [],
        b: [],
        video: ["autoplay", "controls", "crossorigin", "loop", "muted", "playsinline", "poster", "preload", "src", "height", "width",],
        img: ["src", "alt", "style", "title", "width", "height"],
        a: ["href", "title", "target"],
    },
    css: false,
    allowCommentTag: false,
};

/** @param {string} content */
function handleRichTextInput(content) {
    return xss(content, xssConfig);
}

function cheatMethodsSanitizer(val, {req}) {
    const cheatMethods = new Set();
    for (let i of val)
        if (config.possiblecheatMethods.includes(i))
            cheatMethods.add(i); // validate & remove duplicated
    if (cheatMethods.size == 0)
        throw new Error("No valid cheate method given.");
    req.body.data.cheatMethods = Array.from(cheatMethods);
    return true;
}

const userAttributes = {
    "language": {type: "string", get: true, set: true, isprivate: true, default: 'en-US'},
    "showOrigin": {type: "boolean", get: true, set: true, default: false},
    "allowDM": {type: "boolean", get: true, set: true, default: false},     // allow direct message?
    "certUser": {type: "string", get: true, set: false, default: ''},
    "freezeOfNoBinding": {type: "boolean", get: true, set: false, default: false},
    "changeNameLeft": {type: "number", get: true, set: false, isprivate: true, default: 3},
    "registerIP": {type: "string", get: false, set: false, default: ''},
    "lastSigninIP": {type: "string", get: false, set: false, default: ''},
    "avatar": {type: "string", get: true, set: false, default: ''},
    "introduction": {type: "string", get: true, set: true, default: '', handleValue: (value) => xss(value, xssConfig)},
    "mute": {type: "string", get: true, set: true, default: ''},
    "showAchievement": {type: "boolean", get: true, set: true, default: true},
    "achievements": {type: "object", get: true, set: true, default: {}}
}

function userShowAttributes(attr, showprivate = false, force = false) {
    const result = {};
    for (let i of Object.keys(userAttributes))
        if ((userAttributes[i].get && showprivate | (!userAttributes[i].isprivate)) || force)
            result[i] = i.handleValue ? i.handleValue(attr[i]) : attr[i];
    return result;
}

function userSetAttributes(org, attr, force = false) {
    let result = org;
    for (let i of Object.keys(userAttributes))
        if (typeof (attr[i]) == userAttributes[i].type && (userAttributes[i].set || force))
            result[i] = i.handleValue ? i.handleValue(attr[i]) : attr[i];
    return result;
}

function userDefaultAttribute(registerIP = '', language = 'en-US') {
    const result = {};
    for (let i of Object.keys(userAttributes))
        result[i] = userAttributes[i].default;
    result.registerIP = registerIP;
    result.language = language;
    return result;
}

/** @param {import("../typedef.js").User} user */
function initUserStorageQuota(user, totalStorageQuota, maxTrafficQuota, maxFileNumber) {
    if (totalStorageQuota == undefined)
        if (userHasRoles(user, ['dev', 'admin', 'super', 'root']))
            totalStorageQuota = 10 * 1000 * 1000 * 1000; // 10 GB
        else if (userHasRoles(user, ['bot']))
            totalStorageQuota = 1 * 1000 * 1000 * 1000; // 1 GB
        else if (userHasRoles(user, ['normal']))
            totalStorageQuota = 250 * 1000 * 1000; // 250 MB
        else
            totalStorageQuota = 0;
    if (maxTrafficQuota == undefined)
        if (userHasRoles(user, ['dev', 'admin', 'super', 'root']))
            maxTrafficQuota = 2 * 1000 * 1000 * 1000; // 2 GB
        else if (userHasRoles(user, ['bot']))
            maxTrafficQuota = 1 * 1000 * 1000 * 1000; // 1 GB
        else if (userHasRoles(user, ['normal']))
            maxTrafficQuota = 200 * 1000 * 1000; // 200 MB
        else
            maxTrafficQuota = 0;
    if (maxFileNumber == undefined)
        if (userHasRoles(user, ['dev', 'admin', 'super', 'root']))
            maxFileNumber = 2000;
        else if (userHasRoles(user, ['bot']))
            maxFileNumber = 500;
        else if (userHasRoles(user, ['normal']))
            maxFileNumber = 50;
        else
            maxTrafficQuota = 0;
    const quota = {
        userId: user.id,
        totalStorageQuota,
        usedStorageQuota: 0,
        maxTrafficQuota,
        todayTrafficQuota: 0,
        maxFileNumber,
        todayFileNumber: 0,
        prevResetTime: new Date()
    };
    return quota;
}

/** @param {import("../typedef.js").StorageQuota} quota */
async function updateUserStorageQuota(quota, size) {
    if (Date.now() - quota.prevResetTime.getTime() > 24 * 60 * 60 * 1000) {
        quota.prevResetTime = new Date();
        quota.todayTrafficQuota = 0;
        quota.todayFileNumber = 0;
    }
    if (quota.todayTrafficQuota + size > quota.maxTrafficQuota
        || quota.usedStorageQuota + size > quota.totalStorageQuota)
        return undefined;
    quota.usedStorageQuota += size;
    quota.todayTrafficQuota += size;
    return quota;
}

export {
    handleRichTextInput,
    cheatMethodsSanitizer,
    userAttributes,
    userSetAttributes,
    userShowAttributes,
    userDefaultAttribute,
    initUserStorageQuota,
    updateUserStorageQuota
}
