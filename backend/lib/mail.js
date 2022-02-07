"use strict";
import { promises as fs } from "fs";
import { SMTPClient, Message } from "emailjs";
import config from "../config.js";
import serviceApi from "./serviceAPI.js";

const sender = new SMTPClient({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    port: config.mail.port,
    ssl: config.mail.secure,
});

async function sendMail(content, from, to, cc, subject,  attachment=undefined) {
    const message = new Message({
        text: content,
        from: from,
        to: to,
        cc: cc,
        subject: subject,
        attachment: attachment
    });
    return await sender.sendAsync(message);
}

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

async function sendRegisterVerify(username, originName, address, language, code) {
    let subject = {
        cn: 'BFBan注册',
        en: 'BFBan Registration',
    }[language];
    subject = subject? subject : 'BFBan Registration';
    const html = await fs.readFile(`./media/mail_register_${language}.html`).then(buf=>buf.toString());
    
    await sendMail(
        "Hello "+username+"!\n"+
        "   You are now signing up for BFBan as "+originName+" in game.\n"+
        "   Pease click the link below to complete your registration: \n"+
        "      htttps://bfban.com/#/signupComplete?code="+code+"&lang="+language,
        config.mail.user, address, '', subject, [
            {
                data: html.replace(/\$\{username\}/g, username).replace(/\$\{originName\}/g, originName).replace(/\$\{code\}/g, code), 
                alternative: true
            }
        ]
    );
}

async function sendForgetPasswordVerify(username, address, language, code) {
    let subject = {
        cn: 'BFBan密码重置',
        en: 'BFBan Password Reset',
    }[language];
    subject = subject? subject : 'BFBan Password Reset';
    const html = await fs.readFile(`./media/mail_forgetPasswordVerify_${language}.html`).then(buf=>buf.toString());

    await sendMail(
        "Hello "+username+"!\n"+
        "   You are now reseting your password for bfban.com.\n"+
        "   Please click the link below to reset your password: \n"+
        "      htttps://bfban.com/#/forgetPasswordVerify?code="+code,
        config.mail.user, address, '', subject, [
            {
                data: html.replace(/\$\{username\}/g, username).replace(/\$\{code\}/g, code), 
                alternative: true
            }
        ]
    );
}

async function sendBindingOriginVerify(username, address, language, code) {
    let subject = {
        cn: 'BFBan账户绑定',
        en: 'BFBan Account Binding',
    }[language];
    subject = subject? subject : 'BFBan Account Binding';
    const html = await fs.readFile(`./media/mail_bindEmail_${language}.html`).then(buf=>buf.toString());

    await sendMail(
        "Hello "+username+"!\n"+
        "   You are now binding this email to your bfban.com account.\n"+
        "   Please click the link below to finish the verification: \n"+
        "      htttps://bfban.com/#/bindOriginVerify?code="+code,
        config.mail.user, address, '', subject, [
            {
                data: html.replace(/\$\{username\}/g, username).replace(/\$\{code\}/g, code), 
                alternative: true
            }
        ]
    );
}


export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
    sendBindingOriginVerify,
}