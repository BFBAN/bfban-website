"use strict";
import {promises as fs} from "fs";
import {SMTPClient, Message} from "emailjs";
import config from "../config.js";
import serviceApi from "./serviceAPI.js";

const domain = config.mail.domain.origin;
/*
* https://bfban.com/
*/

const sender = {}
Object.keys(config.mail).forEach(key => {
    const mail = config.mail[key]
    sender[key] = new SMTPClient({
        user: mail.user,
        password: mail.password,
        host: mail.host,
        port: mail.port,
        ssl: mail.secure
    })
})

/*
async function sendMail(content, from, to, cc, subject, attachment = undefined, language) {
    const message = new Message({
        text: content,
        from: from,
        to: to,
        cc: cc,
        subject: subject,
        attachment: attachment
    });
    return await sender[language].sendAsync(message);
}
*/

/** 
 * @param {string} content 
 * @param {'Text'|'HTML'} type 
 * @param {string} from
 * @param {string} to
 * @param {string} subject
 */
async function sendMail_ms(content, type, from, to, subject) {
    return await serviceApi('msGraphAPI', '/sendMail').post({
        data: {
            subject,
            type,
            content,
            from,
            to
        }
    });
}

// !!! TEMPORARY FIX
async function sendMail(content, from, to, cc, subject, attachment = undefined, language) {
    return await sendMail_ms(
        attachment?.[0].data || content,
        attachment?.[0].alternative? "HTML" : "Text",
        "register@bfban.com" || from,   
        to,
        subject
    );
}

async function sendRegisterVerify(username, originName, address, language, code) {
    let subject = {
        'zh-CN': 'BFBan注册',
        'en-US': 'BFBan Registration',
    }[language];
    subject = subject ? subject : 'BFBan Registration';
    const html = await fs.readFile(`./media/mail_register_${language}.html`).then(buf => buf.toString());
    const origin = new URL(domain).origin;

    await sendMail(
        "Hello " + username + "!\n" +
        "   You are now signing up for BFBan as " + originName + " in game.\n" +
        "   Pease click the link below to complete your registration: \n" +
        "       " +  origin + "/signupComplete?code=" + code + "&lang=" + language,
        config.mail[language].user, address, '', subject, [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replace(/\$\{originName\}/g, originName)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true
            }
        ],
        language
    );
}

async function sendForgetPasswordVerify(username, address, language, code) {
    let subject = {
        'zh-CN': 'BFBan密码重置',
        'en-US': 'BFBan Password Reset',
    }[language];
    subject = subject ? subject : 'BFBan Password Reset';
    const html = await fs.readFile(`./media/mail_forgetPasswordVerify_${language}.html`).then(buf => buf.toString());
    const origin = new URL(domain).origin;

    await sendMail(
        "Hello " + username + "!\n" +
        "   You are now reseting your password for bfban.com.\n" +
        "   Please click the link below to reset your password: \n" +
        "       " + origin + "/forgetPasswordVerify?code=" + code,
        config.mail[language].user, address, '', subject, [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true
            }
        ],
        language
    );
}

async function sendBindingOriginVerify(username, address, language, code) {
    let subject = {
        'zh-CN': 'BFBan账户绑定',
        'en-US': 'BFBan - Connecting your e-mail address',
    }[language];
    subject = subject ? subject : 'BFBan - Connecting your e-mail address';
    const html = await fs.readFile(`./media/mail_bindEmail_${language}.html`).then(buf => buf.toString());
    const origin = new URL(domain).origin;

    await sendMail(
        "Hello " + username + "!\n" +
        "   You are now binding this email to your bfban.com account.\n" +
        "   Please click the link below to finish the verification: \n" +
        "       " + origin + "/bindOrigin?code=" + code,
        config.mail[language].user, address, '', subject, [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true
            }
        ],
        language
    );
}

export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
    sendBindingOriginVerify,
}
