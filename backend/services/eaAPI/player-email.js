"use strict";

/**
 * EA GraphQL 玩家查询（按 email / 名称搜索）的帮助函数。
 * 移植自 robot-backend 的 apps/ea-account/src/player-email.js，
 * 与 apps/api/originToken/gateway.js 的 getEmailPlayer / searchGraphqlPlayers 保持一致。
 *
 * 注意：这里的错误统一抛出普通 Error，由 OriginClient 的各查询方法捕获后
 * 封装为 EaApiError，避免与 originAPI.js 产生循环依赖。
 */

// 邮件搜索与名称搜索共用同一 SearchPlayer 查询
export const SEARCH_PLAYER_QUERY =
    'query SearchPlayer($searchText: String!, $pageNumber: Int!, $pageSize: Int!) ' +
    '{ players(searchText: $searchText, paging: { pageNumber: $pageNumber, pageSize: $pageSize }) ' +
    '{ items { pd psd displayName avatar { avatarId large { path } } } } }';

// 兼容 robot-backend 的命名
export const EMAIL_PLAYER_QUERY = SEARCH_PLAYER_QUERY;

export function emailSearchVariables(email) {
    if (typeof email !== 'string' || email.trim().length > 320 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        throw new Error('invalid email');
    }
    return { searchText: email.trim(), pageNumber: 1, pageSize: 20 };
}

/**
 * 解析 SearchPlayer 的响应数据。
 * @param {any} data GraphQL data
 * @returns {{name:string, userId:number, personaId:number, avatar?:string, avatarId?:string}|null}
 */
export function parseEmailPlayer(data) {
    const items = data?.players?.items;
    if (!Array.isArray(items) || items.length > 1) throw new Error('upstream.invalid_response');
    if (!items.length) return null;
    const player = items[0];
    const validId = value =>
        ['string', 'number'].includes(typeof value) &&
        /^[1-9]\d{0,15}$/.test(String(value)) && Number.isSafeInteger(Number(value));
    if (!player || typeof player !== 'object' || Array.isArray(player) ||
        !validId(player.pd) || !validId(player.psd) ||
        typeof player.displayName !== 'string' || !player.displayName.trim() ||
        player.displayName.length > 128) {
        throw new Error('upstream.invalid_response');
    }
    const result = { name: player.displayName, userId: Number(player.pd), personaId: Number(player.psd) };
    try {
        const image = new URL(player.avatar?.large?.path);
        if (image.protocol === 'https:' && !image.username && !image.password) result.avatar = image.href;
    } catch { /* 忽略无效头像地址 */ }
    if (/^\d+$/.test(String(player.avatar?.avatarId))) result.avatarId = String(player.avatar.avatarId);
    return result;
}
