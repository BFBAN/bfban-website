"use strict";
import got from "got";
import { webcrypto } from "node:crypto";
import { eaHeaders } from "./ea-headers.cjs";

/**
 * EA 账号授权（JUNO_PC_CLIENT，Authorization Code + PKCE）。
 * 使用 remid/sid cookie 换取 access_token/refresh_token。
 * 移植自 robot-backend 的 apps/ea-account/src/juno.js，
 * 针对 bfban-website（Node 16 + got）做了适配：
 *   - 使用 node:crypto 的 webcrypto 替代全局 crypto
 *   - 使用 Buffer 做 base64url 编码，替代 btoa
 *   - 使用 got 做 HTTP 请求，替代原生 fetch
 */

const authorizationEndpoint = 'https://accounts.ea.com/connect/auth';
const tokenEndpoint = 'https://accounts.ea.com/connect/token';
const redirectUri = 'qrc:///html/login_successful.html';
const clientId = 'JUNO_PC_CLIENT';
const clientSecret = '4mRLtYMb6vq9qglomWEaT4ChxsXWcyqbQpuBNfMPOYOiDmYYQmjuaBsF2Zp0RyVeWkfqhE9TuGgAw7te';
const signVersion = 'v1';
const signKey = 'ISa3dpGOc8wW7Adn4auACSQmaccrOyR2';
const encoder = new TextEncoder();

export class JunoError extends Error {
    constructor(code, status = 502, message = '账户授权暂不可用') {
        super(message);
        this.name = 'JunoError';
        this.code = code;
        this.status = status;
    }
}

const expired = () => new JunoError('account.expired', 401, '账户授权已过期');

function base64url(bytes) {
    return Buffer.from(bytes).toString('base64')
        .replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function credential(value) {
    if (typeof value !== 'string' || !value || value.length > 16384 || /\s/.test(value))
        throw new JunoError('invalid_body', 400, '请检查账户凭据');
    return value;
}

function cookieValue(value) {
    if (typeof value !== 'string' || !/^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]{1,8192}$/.test(value))
        throw new JunoError('invalid_body', 400, '请检查账户凭据');
    return value;
}

/** 从 got 响应中提取 Set-Cookie 原始字符串数组 */
function responseSetCookies(response) {
    const raw = response.rawHeaders || [];
    const header = response.headers['set-cookie'];
    const fromHeader = header === undefined ? [] : (Array.isArray(header) ? header : [header]);
    const out = [...fromHeader];
    if (out.length) return out;
    for (let i = 0; i + 1 < raw.length; i += 2) {
        if (String(raw[i]).toLowerCase() === 'set-cookie') out.push(String(raw[i + 1]));
    }
    return out;
}

/** 合并响应里的 remid/sid，处理删除（max-age<=0 / expires 已过期） */
function mergeCookies(response, cookies) {
    const merged = { ...cookies };
    for (const line of responseSetCookies(response)) {
        for (const part of line.split(/,(?=\s*[^\s;,=]+=[^;,]*)/)) {
            const match = /^\s*(remid|sid)=([^;]*)/i.exec(part);
            if (match) {
                const age = /;\s*max-age\s*=\s*(-?\d+)/i.exec(part);
                const expiry = /;\s*expires\s*=\s*([^;]+)/i.exec(part);
                const removed = !match[2] || (age ? Number(age[1]) <= 0 : expiry && Date.parse(expiry[1]) <= Date.now());
                merged[match[1].toLowerCase()] = removed ? '' : cookieValue(match[2]);
            }
        }
    }
    return merged;
}

/** 生成 JUNO_PC_CLIENT 所需的设备签名 pc_sign（HMAC-SHA256） */
async function pcSign() {
    let mid = 0xcbf29ce484222325n;
    for (const byte of encoder.encode('Microsoft CorporationNoneMicrosoft CorporationNone1970-01-0100:00:00.000000000+0000None'))
        mid = BigInt.asUintN(64, (mid ^ BigInt(byte)) * 0x100000001b3n);
    const payload = base64url(encoder.encode(JSON.stringify({
        av: 'v1', bsn: 'None', gid: 0, hsn: 'None', mid: String(mid), msn: 'None',
        sv: signVersion, ts: new Date().toISOString().replace('T', ' ').replace(/\.(\d{3})Z$/, ':$1'),
    })));
    const key = await webcrypto.subtle.importKey('raw', encoder.encode(signKey), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return `${payload}.${base64url(new Uint8Array(await webcrypto.subtle.sign('HMAC', key, encoder.encode(payload))))}`;
}

async function request(url, init) {
    try {
        const response = await got(url, {
            method: (init.method || 'GET').toUpperCase(),
            headers: eaHeaders(url, init.headers || {}),
            body: init.body,
            followRedirect: false,   // 关键：不自动跟随 302
            throwHttpErrors: false,
            retry: { limit: 0 },
            timeout: { request: 15000 },
        });

        const text = typeof response.body === 'string' ? response.body : '';
        let data = null;
        try { data = JSON.parse(text); } catch { /* 非 JSON 响应 */ }

        const errorCode = data?.error || data?.error_code;
        if (response.statusCode === 429) {
            const value = response.headers['retry-after'];
            const wait = value && /^\d+(?:\.\d+)?$/.test(String(value).trim())
                ? Number(value) * 1000
                : value ? Date.parse(value) - Date.now() : 60000;
            throw Object.assign(new JunoError('upstream.rate_limited', 429, 'EA 请求过于频繁，请稍后重试'),
                { retryAfterMs: Math.min(86400000, Number.isFinite(wait) && wait >= 0 ? wait : 60000) });
        }
        if (response.statusCode >= 500) throw new JunoError('upstream.unavailable');
        if (['login_required', 'invalid_grant', 'invalid_token'].includes(errorCode) || (!errorCode && response.statusCode === 401)) throw expired();
        if (['invalid_client', 'unauthorized_client'].includes(errorCode)) throw new JunoError('upstream.unavailable');
        if (response.statusCode >= 400) throw new JunoError('upstream.unavailable');
        return { response, data };
    } catch (error) {
        if (error instanceof JunoError) throw error;
        if (error?.name === 'TimeoutError') throw new JunoError('upstream.timeout', 504, '账户授权超时，请重试');
        throw new JunoError('upstream.unavailable');
    }
}

function tokenResult(data, response, cookies, refreshToken) {
    const expiresIn = Number(data?.expires_in);
    if (!data || ['error', 'error_code', 'error_number'].some(key => Object.prototype.hasOwnProperty.call(data, key)) ||
        typeof data.access_token !== 'string' || !data.access_token || /\s/.test(data.access_token) ||
        data.access_token.length > 16384 || !Number.isSafeInteger(expiresIn) || expiresIn <= 0 ||
        expiresIn > Math.floor((8640000000000000 - Date.now()) / 1000)) {
        throw new JunoError('account.token_unavailable');
    }
    if (data.refresh_token != null && (typeof data.refresh_token !== 'string' || data.refresh_token.length > 16384 || /\s/.test(data.refresh_token)))
        throw new JunoError('account.token_unavailable');
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        tokenType: typeof data.token_type === 'string' ? data.token_type : undefined,
        expiresIn,
        cookies: mergeCookies(response, cookies),
    };
}

async function exchange(parameters, cookies, refreshToken) {
    const body = new URLSearchParams({ ...parameters, client_id: clientId, client_secret: clientSecret });
    const { response, data } = await request(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
    });
    if (!(response.statusCode >= 200 && response.statusCode < 300)) throw new JunoError('account.token_unavailable');
    return tokenResult(data, response, cookies, refreshToken);
}

export async function prepareJunoAuthorization() {
    const verifier = base64url(webcrypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(new Uint8Array(await webcrypto.subtle.digest('SHA-256', encoder.encode(verifier))));
    const nonce = new DataView(webcrypto.getRandomValues(new Uint8Array(4)).buffer).getInt32(0, true);
    const url = new URL(authorizationEndpoint);
    url.search = new URLSearchParams({
        client_id: clientId,
        sbiod_enabled: 'false',
        response_type: 'code',
        locale: 'en_US',
        pc_sign: await pcSign(),
        nonce: String(nonce),
        code_challenge_method: 'S256',
        code_challenge: challenge,
    }).toString();
    return { url, verifier };
}

/**
 * 使用 remid/sid cookie 授权，返回 { accessToken, refreshToken, expiresIn, cookies }。
 * @param {{remid?:string, sid?:string}} cookies
 */
export async function authorizeJuno(cookies) {
    const supplied = {};
    for (const name of ['remid', 'sid']) if (cookies?.[name]) supplied[name] = cookieValue(cookies[name]);
    if (!Object.keys(supplied).length) throw expired();

    const { url, verifier } = await prepareJunoAuthorization();
    const { response } = await request(url.toString(), {
        headers: { Cookie: Object.entries(supplied).map(([name, value]) => `${name}=${value}`).join('; ') },
    });
    if (response.statusCode < 300 || response.statusCode >= 400) throw expired();
    return completeJunoAuthorization(response.headers.location, verifier, mergeCookies(response, supplied));
}

export async function completeJunoAuthorization(location, verifier, cookies = {}) {
    let callback;
    try { callback = new URL(location); } catch { throw new JunoError('account.invalid_redirect'); }
    if (callback.hostname === 'signin.ea.com' && callback.protocol === 'https:') throw expired();
    if (callback.protocol !== 'qrc:' || callback.hostname || callback.pathname.toLowerCase() !== '/html/login_successful.html')
        throw new JunoError('account.invalid_redirect');
    const query = callback.searchParams;
    const fragment = new URLSearchParams(callback.hash.slice(1));
    if (query.has('error') || query.has('error_code') || fragment.has('error') || fragment.has('error_code')) throw expired();
    const codes = [...query.getAll('code'), ...fragment.getAll('code')];
    if (codes.length !== 1 || !codes[0]) throw new JunoError('account.authorization_unavailable');
    return exchange({
        grant_type: 'authorization_code',
        code: credential(codes[0]),
        code_verifier: credential(verifier),
        redirect_uri: redirectUri,
        token_format: 'JWS',
    }, cookies);
}

/** 使用 refresh_token 刷新令牌 */
export async function refreshJuno(refreshToken) {
    const value = credential(refreshToken);
    return exchange({ grant_type: 'refresh_token', refresh_token: value }, {}, value);
}

/**
 * 降级授权：ORIGIN_JS_SDK 隐式流程（response_type=token）。
 * 直接 GET 带 remid/sid，成功时响应 body 即为 access_token/expires_in，无需 PKCE。
 * 对应 robot-backend 的 account.ts 里的 authorizeCookies。
 * @param {{remid?:string, sid?:string}} cookies
 * @returns {Promise<{accessToken:string, expiresIn:number, cookies:{remid?:string, sid?:string}}>}
 */
export async function authorizeCookies(cookies) {
    const supplied = {};
    for (const name of ['remid', 'sid']) if (cookies?.[name]) supplied[name] = cookieValue(cookies[name]);
    if (!Object.keys(supplied).length) throw expired();

    const url = new URL(authorizationEndpoint);
    url.search = new URLSearchParams({
        client_id: 'ORIGIN_JS_SDK',
        response_type: 'token',
        redirect_uri: 'nucleus:rest',
        prompt: 'none',
    }).toString();

    const { response, data } = await request(url.toString(), {
        headers: { Cookie: Object.entries(supplied).map(([name, value]) => `${name}=${value}`).join('; ') },
    });

    // 302 表示 EA 需要重新登录 → cookie 失效
    if (response.statusCode >= 300 && response.statusCode < 400) throw expired();

    const result = tokenResult(data, response, supplied);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, cookies: result.cookies };
}
