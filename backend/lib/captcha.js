import svgCaptcha from "svg-captcha-fixed";
import config from "../config.js";
import * as misc from "./misc.js";

function generateCaptcha() {
    const captcha = svgCaptcha.create({
        inverse: false,
        ignoreChars: 'aoil',
        color: false,
        fontSize: 40,
        noise: 1,
        width: 80,
        height: 40
    });
    const text = captcha.text.toLowerCase();
    const hash = misc.encrypt(`${text},${Date.now()}`, config.secret).toString('base64');
    return {hash: hash, content: captcha.data};
}

export {
    generateCaptcha
};