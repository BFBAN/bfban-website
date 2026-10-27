import got, { HTTPError, ParseError } from "got";
import { OriginClient, EaApiError, OriginClientCluster, EaApiMethods } from "../originAPI.js";
import { logger } from "../infrastruc.js";
import { eaHeaders } from "../ea-headers.cjs";
import { SEARCH_PLAYER_QUERY } from "../player-email.js";

const graphql_url = 'https://service-aggregation-layer.juno.ea.com/graphql';
const EA_APP_UA = 'EAApp/PC/13.796.0.6309';

/**
 * 通过名称搜索玩家（GraphQL SearchPlayer 模糊搜索）。
 * 对应 robot-backend 的 searchGraphqlPlayers，返回去掉了 `*` 通配符
 * （GraphQL SearchPlayer 本身即为模糊搜索，无需通配符）。
 * @this OriginClient
 * @returns {Promise<{personaId:number,pidId:number,displayName:string}[]>}
 */
async function searchUserNameEA(username) {
    const t_start = Date.now();
    const searchText = String(username || '').trim().replace(/\*+$/g, '');
    try {
        if (!searchText) return [];
        await this.checkSelfTokenValid(true);
        const token = this.tokens.access_token;

        const { body } = await got.post(graphql_url, {
            headers: eaHeaders(graphql_url, {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'x-client-id': 'EAX-JUNO-CLIENT',
                'User-Agent': EA_APP_UA,
            }),
            json: {
                query: SEARCH_PLAYER_QUERY,
                variables: { searchText, pageNumber: 1, pageSize: 20 },
                operationName: 'SearchPlayer',
            },
            responseType: 'json',
            throwHttpErrors: false,
        });

        if (body.errors?.length)
            throw new EaApiError(500, body.errors, `${this.tag} GraphQL error`);

        const items = body.data?.players?.items;
        if (!Array.isArray(items) || items.length > 20)
            throw new EaApiError(500, body, `${this.tag} Bad Response`);

        return items.map(item => ({
            personaId: Number(item.psd),
            pidId: Number(item.pd),
            displayName: item.displayName,
        }));
    } catch (err) {
        if (err instanceof EaApiError)
            throw err;
        if (err instanceof HTTPError || err instanceof ParseError)
            throw new EaApiError(err.response?.statusCode, err.response?.body, `${this.tag} Bad Response`);
        throw new EaApiError(-1, null, err);
    } finally {
        logger.info(`OriginClient.searchUserNameEA spent ${(Date.now()-t_start)/1000}s`);
    }
}

// inject methods
OriginClient.prototype.searchUserNameEA = searchUserNameEA;
EaApiMethods.searchUserNameEA = searchUserNameEA;