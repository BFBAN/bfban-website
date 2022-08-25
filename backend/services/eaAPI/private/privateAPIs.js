import got, { HTTPError, ParseError } from "got";
import { OriginClient, EaApiError, OriginClientCluster, EaApiMethods } from "../originAPI.js";
import { logger } from "../infrastruc.js";

/** @this OriginClient @returns {{personaId:number,pidId:number,displayName:string}[]}*/
async function searchUserNameEA(username) {
    username = encodeURIComponent(username);
    const url = `https://gateway.ea.com/proxy/identity/personas?displayName=${username}&namespaceName=cem_ea_id`;
    const t_start = Date.now();
    try {
        await this.checkSelfTokenValid(true);
        const response = await got.get(url, {
            headers: {
                'Authorization': `Bearer ${this.tokens.access_token}`,
                'Upgrade-Insecure-Requests': 1,
                'X-Expand-Results': 'true',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
            }
        }).json();

        if(!response.personas.persona)
            return [];
        return response.personas.persona;
    } catch(err) {
        if(err instanceof HTTPError || err instanceof ParseError)
            throw new EaApiError(err.response.statusCode, err.response.body, `${this.tag} Bad Response`);    
        throw new EaApiError(-1, null, err);
    } finally {
        logger.info(`OriginClient.searchUserNameEA spent ${(Date.now()-t_start)/1000}s`);
    }
}

// inject methods
OriginClient.prototype.searchUserNameEA = searchUserNameEA;
EaApiMethods.searchUserNameEA = searchUserNameEA;