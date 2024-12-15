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
 * @param {string} htmlContent 邮件HTML内容
 * @param {string} from 发件人邮箱地址
 * @param {string} to 收件人邮箱地址
 * @param {string} cc 抄送邮箱地址
 * @param {string} subject 邮件主题
 * @param {Array} attachments 附件
 * @returns {Promise<void>}
 */
async function sendMail(htmlContent, from, to, cc, subject, attachments = []) {
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
        html: htmlContent,
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

    const emailContent = html
        .replace(/\$\{username\}/g, username)
        .replace(/\$\{originName\}/g, originName)
        .replace(/\$\{website\}/g, origin)
        .replace(/\$\{code\}/g, code);

    await sendMail(
        emailContent,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject
    );
}

async function sendForgetPasswordVerify(username, address, language, code) {
    const subject = language === "zh-CN" ? "BFBAN密码重置" : "BFBAN Password Reset";
    const html = await getTemplateContent("mail_forgetPasswordVerify", language);
    const origin = new URL(domain).origin;

    const emailContent = html
        .replace(/\$\{username\}/g, username)
        .replace(/\$\{website\}/g, origin)
        .replace(/\$\{code\}/g, code);

    await sendMail(
        emailContent,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject
    );
}

async function sendBindingOriginVerify(username, address, language, code) {
    const subject =
        language === "zh-CN"
            ? "BFBAN账户绑定"
            : "BFBAN - Connecting your e-mail address";
    const html = await getTemplateContent("mail_bindEmail", language);
    const origin = new URL(domain).origin;

    const emailContent = html
        .replace(/\$\{username\}/g, username)
        .replace(/\$\{website\}/g, origin)
        .replace(/\$\{code\}/g, code);

    await sendMail(
        emailContent,
        `"BFBAN Account Service" <no-reply@bfban.com>`,
        address,
        "",
        subject
    );
}

async function sendUserAuthVerify(username, address, appname, appid, language, code) {
    const subject =
        language === "zh-CN"
            ? "BFBAN应用授权"
            : "BFBAN Application authorization";
    const html = await getTemplateContent("mail_userAuth", language);
    const origin = new URL(domain).origin;

    const emailContent = html
        .replace(/\$\{username\}/g, username)
        .replace(/\$\{appname\}/g, appname)
        .replace(/\$\{appid\}/g, appid)
        .replace(/\$\{website\}/g, origin)
        .replace(/\$\{code\}/g, code);

    await sendMail(
        emailContent,
        `"BFBAN Auth App Service" <no-reply@bfban.com>`,
        address,
        "",
        subject
    );
}


export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
    sendBindingOriginVerify,
    sendUserAuthVerify,
};
