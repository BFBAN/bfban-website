"use strict";
import { promises as fs } from "fs";
import nodemailer from "nodemailer";
import config from "../config.js";

const domain = config.mail.domain.origin;
/*
 * https://bfban.com/
 */

const senders = [];
if (Array.isArray(config.mail)) {
    config.mail.forEach((mailConfig) => {
        senders.push(
            nodemailer.createTransport({
                host: mailConfig.host,
                port: mailConfig.port,
                secure: mailConfig.secure, // true for 465, false for other ports
                auth: {
                    user: mailConfig.user,
                    pass: mailConfig.password,
                },
                tls: mailConfig.tls ? { rejectUnauthorized: false } : undefined,
            })
        );
    });
} else {
    senders.push(
        nodemailer.createTransport({
            host: config.mail.host,
            port: config.mail.port,
            secure: config.mail.secure,
            auth: {
                user: config.mail.user,
                pass: config.mail.password,
            },
            tls: config.mail.tls ? { rejectUnauthorized: false } : undefined,
        })
    );
}

// 当前发送器索引，用于负载均衡
let currentSenderIndex = 0;

/**
 * 邮件发送方法
 * @param {string} content 邮件文本内容
 * @param {string} from 发件人邮箱地址
 * @param {string} to 收件人邮箱地址
 * @param {string} cc 抄送邮箱地址
 * @param {string} subject 邮件主题
 * @param {Array} attachments 附件
 * @returns {Promise<void>}
 */
async function sendMail(content, from, to, cc, subject, attachments = []) {
    if (senders.length === 0) {
        throw new Error("No SMTP configuration available");
    }

    // 根据当前索引选择发送器，支持负载均衡
    const transporter = senders[currentSenderIndex];
    currentSenderIndex = (currentSenderIndex + 1) % senders.length;

    const mailOptions = {
        from,
        to,
        cc,
        subject,
        text: content,
        attachments,
    };

    return transporter.sendMail(mailOptions);
}


// 动态读取模板文件
async function getTemplateContent(templateName, language) {
    const filePath = `./media/${templateName}_${language}.html`;
    try {
        return await fs.readFile(filePath, "utf-8");
    } catch (error) {
        throw new Error(`Failed to load email template: ${filePath}`);
    }
}

// 邮件模板方法
async function sendRegisterVerify(username, originName, address, language, code) {
    const subject = language === "zh-CN" ? "BFBAN注册" : "BFBAN Registration";
    const html = await getTemplateContent("mail_register", language);
    const origin = new URL(domain).origin;

    await sendMail(
        `Hello ${username}!\nYou are now signing up for BFBAN as ${originName} in game.\nPlease click the link below to complete your registration:\n${origin}/signupComplete?code=${code}&lang=${language}`,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject,
        [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replace(/\$\{originName\}/g, originName)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true,
            },
        ]
    );
}

async function sendForgetPasswordVerify(username, address, language, code) {
    const subject = language === "zh-CN" ? "BFBAN密码重置" : "BFBAN Password Reset";
    const html = await getTemplateContent("mail_forgetPasswordVerify", language);
    const origin = new URL(domain).origin;

    await sendMail(
        `Hello ${username}!\nYou are now resetting your password for bfban.com.\nPlease click the link below to reset your password:\n${origin}/forgetPasswordVerify?code=${code}&lang=${language}`,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject,
        [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true,
            },
        ]
    );
}

async function sendBindingOriginVerify(username, address, language, code) {
    const subject =
        language === "zh-CN"
            ? "BFBAN账户绑定"
            : "BFBAN - Connecting your e-mail address";
    const html = await getTemplateContent("mail_bindEmail", language);
    const origin = new URL(domain).origin;

    await sendMail(
        `Hello ${username}!\nYou are now binding this email to your bfban.com account.\nPlease click the link below to finish the verification:\n${origin}/bindOrigin?code=${code}&lang=${language}`,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject,
        [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replace(/\$\{code\}/g, code),
                alternative: true,
            },
        ]
    );
}

async function sendUserAuthVerify(username, address, appname, appid, language, code) {
    const subject =
        language === "zh-CN"
            ? "BFBAN应用授权"
            : "BFBAN Application authorization";
    const html = await getTemplateContent("mail_userAuth", language);
    const origin = new URL(domain).origin;

    await sendMail(
        `Hello ${username}!\n`,
        `"BFBAN Auth App Service" <no-reply@bfban.com>`,
        address,
        "",
        subject,
        [
            {
                data: html
                    .replace(/\$\{username\}/g, username)
                    .replace(/\$\{appname\}/g, appname)
                    .replace(/\$\{appid\}/g, appid)
                    .replaceAll(/\$\{website\}/g, origin)
                    .replaceAll(/\$\{code\}/g, code),
                alternative: true,
            },
        ]
    );
}
export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
    sendBindingOriginVerify,
    sendUserAuthVerify,
};
