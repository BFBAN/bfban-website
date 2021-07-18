"use strict";
import xss from "xss";

/** @param {string} content */
function handleRichTextInput(content) {
    return xss(content);
}

function cheateMethodsSanitizer(val, {req}) {
    const cheateMethods = new Set();
    for(let i of val.split(','))
        if(config.possibleCheateMethods.includes(i))
            cheateMethods.add(i); // validate & remove duplicated
    if(cheateMethods.size == 0)
        throw new Error("No valid cheate method given.");
    req.body.data.cheateMethods = ''; // rewrite to sanitize
    for(let i of cheateMethods.keys())
    req.body.data.cheateMethods += i+',';
    req.body.data.cheateMethods = req.body.data.cheateMethods.slice(0,-1); // remove trailing comma
    return true;
}

/** @param {import("../typedef").User} user */
function parseUserAttribute(user) {
    try {
        const obj = JSON.parse(user.attr);
        if(obj instanceof Object)
            return obj;
    } catch(err) {
        return {};
    }
    return {};
}

const userAttributes = {
    "showOrigin": {type: "boolean", get: true, set: true, default: false},
    "allowDM": {type: "boolean", get: true, set: true, default: false},
    "certUser": {type: "string", get: true, set: false, default: ''},
    "freezeOfNoBinding": {type: "boolen", get: true, set: false, default: false},
    "changeNameLeft": {type: "number", get: true, set: false, isprivate: true, default: 3},
    "registerIP": {type: "string", get: false, set: false, default: ''},
    "lastSigninIP": {type: "string", get:false, set: false, default: ''},
}

function userShowAttributes(attr, isprivate=false, force=false) {
    const result = {};
    for(let i of Object.keys(userAttributes))
        if(typeof(attr[i])==userAttributes[i].type) 
            if(( userAttributes.get && isprivate|(!userAttributes[i].isprivate) )|| force)
                result[i] = attr[i];
    return result;
}

function userSetAttributes(attr, force=false) {
    const result = {};
    for(let i of Object.keys(userAttributes))
        if(typeof(attr[i])==userAttributes[i].type && (userAttributes.set || force))
            result[i] = attr[i];
    return result;
}

export {
    handleRichTextInput,
    cheateMethodsSanitizer,
    parseUserAttribute,
    userSetAttributes,
    userShowAttributes,
}