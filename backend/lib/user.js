import xss from "xss";

/** @param {string} content */
function handleRichTextInput(content) {
    return xss(content);
}

function cheateMethodsSanitizer(val, {req}) {
    const cheateMethods = new Set();
    for(let i of val.split(','))
        if(config.possibleCheateMethods.indexOf(i) != -1)
            cheateMethods.add(i); // validate & remove duplicated
    if(cheateMethods.size == 0)
        throw new Error("No valid cheate method given.");
    req.body.data.cheateMethods = ''; // rewrite to sanitize
    for(let i of cheateMethods.keys())
    req.body.data.cheateMethods += i+',';
    req.body.data.cheateMethods = req.body.data.cheateMethods.slice(0,-1); // remove trailing comma
    return true;
}

export {
    handleRichTextInput,
    cheateMethodsSanitizer,
}