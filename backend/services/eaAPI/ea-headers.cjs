'use strict';
const { webcrypto } = require('node:crypto');

/**
 * EA 接口请求头处理：为目标 EA 域名随机伪造一个 X-Real-Ip 头，
 * 用于绕过 EA 网关对固定 IP 的限流/风控。
 * 与原 robot-backend 实现一致，但适配 Node 16（无全局 crypto/Headers）。
 *
 * @param {string|URL} url 请求地址
 * @param {Object} headers 原始请求头（普通对象）
 * @returns {Object} 处理后的请求头
 */
function eaHeaders(url, headers) {
    const address = new URL(url);
    const host = address.hostname.toLowerCase();
    if (!['http:', 'https:'].includes(address.protocol) ||
        ['www.ea.com', 'accounts.ea.com', 'signin.ea.com', 'gosredirector.ea.com'].includes(host) ||
        host.includes('blaze') || /blaze/i.test(address.searchParams.get('client_id') || '') ||
        !(host === 'ea.com' || host.endsWith('.ea.com') ||
            /^sparta-gw-[a-z0-9-]+\.battlelog\.com$/.test(host) || /^api[1-4]\.origin\.com$/.test(host))) {
        return headers;
    }

    const random = webcrypto.getRandomValues(new Uint32Array(2));
    const ranges = [[178, 100, 0x3ffff], [13, 212, 0x3ffff], [16, 156, 0x3ffff], [100, 128, 0x7fffff]];
    const [first, second, mask] = ranges[random[0] & 3];
    const value = random[1] & mask;

    const result = { ...(headers || {}) };
    for (const key of Object.keys(result)) {
        if (key.toLowerCase() === 'x-real-ip') delete result[key];
    }
    result['X-Real-Ip'] = `${first}.${second + (value >>> 16)}.${(value >>> 8) & 255}.${value & 255}`;
    return result;
}

module.exports = { eaHeaders };
