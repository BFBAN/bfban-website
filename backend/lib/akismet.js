import {AkismetClient} from 'akismet-api'
import config from "../config.js";
import logger from "../logger.js";
import {handleRichTextInput} from "./user.js";

// https://github.com/chrisfosterelli/akismet-api/blob/HEAD/docs/comments.md
const key = config.akismet.key;
const domain = config.mail.domain.origin;
const client = config.akismet.isEnable ? new AkismetClient({
    key,
    blog: domain,
    isTest: config.akismet.debug
}) : null;

class SubmitSpamError extends Error {
    constructor() {
        super();
    }
}

class SubmitSpamResult {
    code = 404;
    status = false;
    message;

    /** @param {{result:Map}} @returns {Promise<SubmitSpamResult>} **/
    constructor(result = {}) {
        this.code = result.statusCode;
        if (result)
            this.status = this.code >= 200 && this.code < 300;
        this.message = result.text ??= "none"
    }
}

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
        let isSpam = false;

        if (!config.akismet.isEnable) return false;
        if (verifyDuplicateContent(comment.content)) return true;

        isSpam = await client.checkSpam(comment);

        return !isSpam;
    } catch (err) {
        logger.error('Something went wrong:' + err.message)
    }
}

/**
 * Submitting False Negatives
 * @param comment
 * @returns {Promise<SubmitSpamResult>}
 */
async function submitSpam(spamFormData = SpamFormData()) {
    try {
        if (!config.akismet.isEnable) return new SubmitSpamResult(result);

        var result = await client.submitSpam(spamFormData);

        return new SubmitSpamResult(result);
    } catch (err) {
        throw err;
    }
}

/**
 * Regular expressions are used to match repeated characters, numbers, or punctuation marks
 * @returns {Promise<boolean>}
 */
async function verifyDuplicateContent(text, repeatCount = 6) {
    const regex = new RegExp(`([a-zA-Z0-9\\p{P}])\\1{${repeatCount},}`, 'gu');
    return regex.test(text);
}

// packing
class SpamFormData {
    constructor(req, spamType = 'none', content = '') {
        let spam = {};

        if (!content) logger.info('Check content is missing, please check');
        if (content) spam.content = handleRichTextInput(content) || '';
        if (req.user.originEmail) spam.email = req.user.originEmail || '';
        if (req.user.username) spam.name = req.user.username || '';

        const ip = req.REAL_IP || req.user.attr.lastSigninIP || '0.0.0.0';

        spam = Object.assign({
            ip,
            bolg: domain,
            referer: req.headers['referer'] || '',
            useragent: req.headers['user-agent'] || '',
            // The type of comment (e.g. 'comment', 'reply', 'forum-post', 'blog-post')
            type: spamType,
            role: isAdmin(req.user.privilege),
            isTest: ['127.0.0.1', 'localhost'].includes(ip) ? true : config.akismet.debug,
        }, spam)

        return spam;
    }
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
    verifyDuplicateContent,
    SpamFormData,
    SubmitSpamError,
}
