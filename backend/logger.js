"use strict";
import process from "process";
import { inspect } from "util";
import config from "./config.js";

class Logger {
    constructor(moduleName='', logLevel=2) {
        this.moduleName = moduleName;
        this.logLevel = logLevel;
    }
    moduleName = '';
    logLevel = 2;
    toText = {
        success: (...msg)=> {
            if(this.logLevel < 0)
                return;
            return [
                `\x1B[34m${this.moduleName? '['+this.moduleName+'] ':''}[${new Date().toLocaleString(undefined, {hour12: false})}]\x1B[0m `+`\x1B[32m[SUCCESS] \x1B[0m`,
                ...msg.map(i=>typeof(i)!='string'? inspect(i, false, null, true) : i)
            ].join(' ');
        },
        verbose: (...msg)=> {
            if(this.logLevel < 3)
                return;
            return [
                `\x1B[34m${this.moduleName? '['+this.moduleName+'] ':''}[${new Date().toLocaleString(undefined, {hour12: false})}]\x1B[0m `+`\x1B[37m[VERBOSE] \x1B[0m`,
                ...msg.map(i=>typeof(i)!='string'? inspect(i, false, null, true) : i)
            ].join(' ');
        },
        info: (...msg)=> {
            if(this.logLevel < 2)
                return;
            return [
                `\x1B[34m${this.moduleName? '['+this.moduleName+'] ':''}[${new Date().toLocaleString(undefined, {hour12: false})}]\x1B[0m `+`\x1B[37m[INFO] \x1B[0m`,
                ...msg.map(i=>typeof(i)!='string'? inspect(i, false, null, true) : i)
            ].join(' ');
        },
        warn: (...msg)=> {
            if(this.logLevel < 1)
                return;
            return [
                `\x1B[34m${this.moduleName? '['+this.moduleName+'] ':''}[${new Date().toLocaleString(undefined, {hour12: false})}]\x1B[0m `+`\x1B[33m[WARN] \x1B[0m`,
                ...msg.map(i=>typeof(i)!='string'? inspect(i, false, null, true) : i)
            ].join(' ');
        },
        error: (...msg)=> {
            if(this.logLevel < 0)
                return;
            return [
                `\x1B[34m${this.moduleName? '['+this.moduleName+'] ':''}[${new Date().toLocaleString(undefined, {hour12: false})}]\x1B[0m `+`\x1B[31m[ERROR] \x1B[0m`,
                ...msg.map(i=>typeof(i)!='string'? inspect(i, false, null, true) : i)
            ].join(' ');
        }
    };
    success = (...msg)=> {
        if(this.logLevel < 0)
            return;
        console.log(this.toText.success(...msg));
    };
    verbose = (...msg)=> {
        if(this.logLevel < 3)
            return;
        console.log(this.toText.verbose(...msg));
    };
    info = (...msg)=> {
        if(this.logLevel < 2)
            return;
        console.log(this.toText.info(...msg));
    };
    warn = (...msg)=> {
        if(this.logLevel < 1)
            return;
        console.log(this.toText.warn(...msg));
    };
    error = (...msg)=> {
        if(this.logLevel < 0)
            return;
        console.log(this.toText.error(...msg));
    }
}

const logger = new Logger('BFBAN', config.logLevel);

/** @param {string} tag @param {string} message */
function prettyLogPrinter(tag, message, intent=4) {
    if(intent < 0) intent = tag.length;
    const padding = ' '.repeat(intent);
    const ttyWidth = process.stdout.columns;
    if(ttyWidth==undefined || ttyWidth<1)
        return tag + message;
    let paragraphs = message.split('\n');
    /** @type {string[]} */
    let lines = [];
    lines.push(tag + paragraphs[0].slice(0, ttyWidth-tag.length%ttyWidth));
    paragraphs[0] = paragraphs[0].slice(ttyWidth-tag.length%ttyWidth);
    if(paragraphs[0].length == 0)
        paragraphs = paragraphs.slice(1);
    while(paragraphs.length) {
        while(paragraphs[0].length) {
            lines.push(padding+paragraphs[0].slice(0, ttyWidth-intent));
            paragraphs[0] = paragraphs[0].slice(ttyWidth-intent);
        }
        paragraphs = paragraphs.slice(1);
    }
    return lines.join('\n');
}

export default logger;
export {
    Logger,
};