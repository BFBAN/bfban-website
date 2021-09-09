"use strict";
import {Message, SMTPClient} from "emailjs";
import config from "../config.js";

const frontAddress = config.frontAddress;
const defaultLanguage = 'zh-CN';
const sender = new SMTPClient({
    user: config.mail.user,
    password: config.mail.password,
    host: config.mail.host,
    port: config.mail.port,
    ssl: config.mail.secure,
});

function onLangInfo(data = {}) {
    const {username, code, originName, lang, type} = data;
    const sends = {
        "sendRegisterVerify": {
            'zh-CN': {
                title: '联BAN 注册',
                content: `
您好 ${username}!\n
    您现在在游戏中以${originName}注册Bfban.\n
    请单击下面的链接完成注册: \n
    ${frontAddress}/signupComplete?code=${code}.
    
    欢迎👏🏻加入我们！
            `
            },
            'en-US': {
                title: 'BFBan Registration',
                content: `
Hello ${username}!\n
    You are now signing up for BFBan as ${originName} in game.\n
    Pease click the link below to complete your registration: \n
    ${frontAddress}/signupComplete?code=${code}.
            `
            }
        },
        "sendForgetPasswordVerify": {
            'zh-CN': {
                title: '联BAN 密码重置',
                content: `
您好 ${username}!\n
    您现在正在重置bfban.com的密码.\n
    请单击下面的链接重置密码: \n
    ${frontAddress}/forgetPasswordVerify?code=${code}
                `
            },
            'en-US': {
                title: 'BFBan Password Reset',
                content: `
Hello ${username}!\n
    You are now reseting your password for bfban.com.\n
    Please click the link below to reset your password: \n
    ${frontAddress}/forgetPasswordVerify?code=${code}
                `
            }
        },
        "sendBindingOriginVerify": {
            'zh-CN': {
                title: '联BAN 账户绑定',
                content: `
您好 ${username}!\n
    您现在正在重置bfban.com的密码.\n
    请单击下面的链接重置密码: \n
    ${frontAddress}/forgetPasswordVerify?code=${code}
                `
            },
            'en-US': {
                title: 'BFBan Account Binding',
                content: `
Hello ${username}!\n
   You are now binding this email to your bfban.com account.\n
   Please click the link below to finish the verification:\n
   ${frontAddress}/bindOriginVerify?code=${code}
                `
            }
        }
    };

    // 不支持客户端支持语言时 使用默认
    if (sends[type][lang] || sends[type][lang] == null || sends[type][lang] == undefined) {
        return sends[type][defaultLanguage];
    }

    return sends[type][lang || defaultLanguage];
}

async function sendMail(content, from, to, cc, subject) {
    const message = new Message({
        text: '',
        from: from,
        to: to,
        cc: cc,
        attachment: [
            {
                data: content,
                alternative: true,
            }
        ],
        subject: subject
    });
    return await sender.sendAsync(message);
}

/**
 * 拼接html
 * @param content
 * @param showHtml 是否使用html
 * @returns {string|*}
 */
function sendHtml(content, showHtml = true) {
    const header = `
        <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-collapse: collapse; background: #ffffff; border: 1px solid #E3EAEF; margin: 0 auto; min-width: 600px; border-radius: 3px; margin-top: 10px;">
            <tbody>
            <tr style="background-color: #401487;">
                <td style="border-collapse: collapse;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse;">
                    <tbody>
                        <tr>
                            <td valign="middle" class="header-left" style="border-collapse: collapse; padding: 12px 0 8px 25px; border-bottom-width: 1px; border-bottom-color: #f3f6f8; border-bottom-style: solid; text-align: left; width: 50%;">
                                <img src="https://i.loli.net/2018/11/03/5bdd8e977b10d.png" width="91" height="25" style="border: 0 none; height: auto; line-height: 100%; outline: none; text-decoration: none; display: inline-block;">
                            </td>
                            <td valign="middle" class="header-right" style="border-collapse: collapse;padding: 12px 25px 8px 0;border-bottom-width: 1px;border-bottom-color: #f3f6f8;border-bottom-style: solid;text-align: right;font-weight: bold;font-size: 1.2rem;color: #fff23b;width: 50%;">
                                <b>BFBAN</b>.com
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
            </tr>
    `;
    const main = `
            <tr colspan="2" style="font-family: Helvetica Neue, Helvetica, sans-serif;"><td class="jetpack-status-alert-body" align="left" style="border-collapse: collapse; background-color: #FFFFFF; padding: 4px 40px 4px 40px;">
                <div rowspan="2" style="direction: ltr;font-size: 16px;line-height: 24px;color: #23282D;white-space: pre-wrap;word-break: break-all;">
                    ${content}
                </div>
            </tr>
`;
    const footer = `
            </tbody>
        </table>
    `;

    return showHtml ? header + main + footer : content;
}

async function sendRegisterVerify(username, originName, address, code, lang = defaultLanguage) {
    let langData = onLangInfo({username, originName, address, code, lang, type: "sendRegisterVerify"});

    await sendMail(
        sendHtml(langData.content),
        config.mail.user,
        address,
        '',
        langData.title,
    );
}

async function sendForgetPasswordVerify(username, address, code, lang = defaultLanguage) {
    let langData = onLangInfo({username, address, code, lang, type: "sendForgetPasswordVerify"});

    await sendMail(
        sendHtml(langData.content),
        config.mail.user,
        address,
        '',
        langData.title,
    );
}

async function sendBindingOriginVerify(username, address, code, lang = defaultLanguage) {
    let langData = onLangInfo({username, address, code, lang, type: "sendBindingOriginVerify"});

    await sendMail(
        sendHtml(langData.content),
        config.mail.user,
        address,
        '',
        langData.title,
    );
}

export {
    sendMail,
    sendRegisterVerify,
    sendForgetPasswordVerify,
    sendBindingOriginVerify,
}