"use strict";
import { SMTPClient, Message } from "emailjs";
import config from "../config.js";

const sender = new SMTPClient({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    port: config.mail.port,
    ssl: config.mail.secure,
});

async function sendMail(content, from, to, cc, subject) {
    const message = new Message({
        text: content,
        from: from,
        to: to,
        cc: cc,
        subject: subject
    });
    return await sender.sendAsync(message);
}

async function sendRegisterVerify(username, originName, address, code) {
    await sendMail(
        "Hello "+username+"!\n"+
        "    You are now signing up for BFBan as "+originName+" in game.\n"+
        "    Pease click the link below to complete your registration: \n"+
        "      htttps://bfban.com/#/signupComplete?code="+code,
        config.mail.user, address, '', "BFBan Registration"
    );
}

async function sendForgetPasswordVerify(username, address, code) {
    await sendMail(
        "Hello "+username+"!\n"+
        "   You are now reseting your password for bfban.com.\n"+
        "   Please click the link below to reset your password: \n"+
        "       htttps://bfban.com/#/forgetPasswordVerify?code="+code,
        config.mail.user, address, '', "BFBan Password Reset"
    );
}

export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
}