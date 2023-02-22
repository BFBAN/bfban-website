import {AkismetClient} from 'akismet-api'
import config from "../config.js";
import logger from "../logger.js";
import {handleRichTextInput} from "./user.js";

// https://github.com/chrisfosterelli/akismet-api/blob/HEAD/docs/comments.md
const key = config.akismet.key;
const domain = config.mail.domain.origin;
const client = config.akismet.isEnable ? new AkismetClient({
    key,
    bolg: domain,
    isTest: config.akismet.debug
}) : null;

// Verifying your Key
async function verifyAkismetKey() {
    try {
        if (!config.akismet.isEnable) return false;

        const isValid = await client.verifyKey()

        if (isValid) {
            logger.success('Valid key!');
            return true;
        }

        logger.error('Invalid key!');
        return false
    } catch (err) {
        logger.error('Could not reach Akismet:' + err.message)
    }
}

// Checking for Spam
async function checkSpam(comment) {
    try {
        if (!config.akismet.isEnable) return false;

        const isSpam = await client.checkSpam(comment);

        return !isSpam;
    } catch (err) {
        logger.error('Something went wrong:' + err.message)
    }
}

// Submitting False Negatives
async function submitSpam(comment) {
    try {
        if (!config.akismet.isEnable) return false;

        await client.submitSpam(comment);

        return true
    } catch (err) {
        logger.error('Something went wrong:' + err.message)
    }
}

// packing
function toSpam(req, spamType = 'none', content = '') {
    let spam = {};

    if (!content) logger.info('Check content is missing, please check');
    if (content) spam.content = handleRichTextInput(content) || '';
    if (req.user.originEmail) spam.email = req.user.originEmail || '';
    if (req.user.username) spam.name = req.user.username || '';

    return Object.assign({
        ip: req.REAL_IP || req.user.attr.lastSigninIP || '0.0.0.0',
        referer: req.headers['referer'] || '',
        useragent: req.headers['user-agent'] || '',
        // The type of comment (e.g. 'comment', 'reply', 'forum-post', 'blog-post')
        type: spamType,
        role: isAdmin(req.user.privilege),
        isTest: config.akismet.debug,
    }, spam);
}

// The commentor's 'role'. If set to 'administrator', it will never be marked spam
function isAdmin(role = []) {
    if (role.includes(['admin', 'super', 'dev']))
        return 'administrator'
    return 'role'
}

export {
    checkSpam,
    submitSpam,
    verifyAkismetKey,
    toSpam
}