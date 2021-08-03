"use strict";

const logger = {
    success: (...msg)=>{
        const str = prettyLogPrinter(
            `\x1B[32m[SUCCESS] \x1B[0m`,
            msg.map(i=>typeof(i)=='object'? JSON.stringify(i,null,2):i+'').join('\n')
        );
        console.log(`\x1B[34m[${new Date().toLocaleString()}]\x1B[0m `+str);
    },
    info: (...msg)=>{
        const str = prettyLogPrinter(
            `\x1B[37m[INFO] \x1B[0m`,
            msg.map(i=>typeof(i)=='object'? JSON.stringify(i,null,2):i+'').join('\n')
        );
        console.log(`\x1B[34m[${new Date().toLocaleString()}]\x1B[0m `+str);
    },
    warn: (...msg)=>{
        const str = prettyLogPrinter(
            `\x1B[33m[WARN] \x1B[0m`,
            msg.map(i=>typeof(i)=='object'? JSON.stringify(i,null,2):i+'').join('\n')
        );
        console.log(`\x1B[34m[${new Date().toLocaleString()}]\x1B[0m `+str);
    },
    error: (...msg)=>{
        const str = prettyLogPrinter(
            `\x1B[31m[ERROR] \x1B[0m`,
            msg.map(i=>typeof(i)=='object'? JSON.stringify(i,null,2):i+'').join('\n')
        );
        console.log(`\x1B[34m[${new Date().toLocaleString()}]\x1B[0m `+str);
    },
};

/** @param {string} tag @param {string} message */
function prettyLogPrinter(tag, message, intent=4) {
    if(intent < 0) intent = tag.length;
    const padding = ' '.repeat(intent);
    const ttyWidth = process.stdout.columns;
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