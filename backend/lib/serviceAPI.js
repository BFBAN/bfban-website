import assert from "assert";
import got, { HTTPError } from "got";
import config from "../config.js";

class ServiceApiError extends Error {
    constructor(statusCode, body, msg) {
        super(msg instanceof Error? msg.message : msg);
        if(msg instanceof Error)
            this.stack = msg.stack;
        this.statusCode = statusCode;
        this.body = body;
    }
    statusCode = 0;
    body = '';
}

class serviceApiContext {
    constructor(base, path='/', exception=true) {
        this.#urlbase = base;
        this.#urlpath = path;
        this.#throwHttpErrors = exception;
    }
    /** @type {URL} */
    #url = {};
    #urlbase = '';
    #urlpath = '';
    #urlquery = new URLSearchParams();
    #throwHttpErrors = true;
    /** @type {'GET'|'POST'|'PUT'|'DELETE'} */
    #reqmethod = '';
    #execute(body) {
        this.#url = new URL(this.#urlpath, this.#urlbase);
        for(const i of this.#urlquery)
            this.#url.searchParams.set(i[0], i[1]);
        return got(this.#url, {method: this.#reqmethod, throwHttpErrors: this.#throwHttpErrors, body: body}).json().catch(err=> {
            if(err instanceof HTTPError)
                throw new ServiceApiError(err.response.statusCode, JSON.parse(err.response.body), err);
            throw new ServiceApiError(-1, null, err);
        });/*.then(r=>{    // DEBUG
            console.log(JSON.stringify(r)); 
            return r;
        });*/
    }
    get() {
        this.#reqmethod = 'GET';
        return this.#execute(undefined);
    }
    post(body=undefined) {
        this.#reqmethod = 'POST';
        return this.#execute(body);
    }
    put(content=undefined) {
        this.#reqmethod = 'PUT';
        return this.#execute(content);
    }
    delete(body=undefined) {
        this.#reqmethod = 'DELETE';
        return this.#execute(body)
    }
    /** @param {Record<string, string>} qobj */
    query(qobj) {
        for(const i of Object.keys(qobj))
            this.#urlquery.set(i, qobj[i]);
        return this;
    }

}

/** @param {'eaAPI'|'msGraphAPI'} svcName */
function serviceApi(svcName, path='/', exception=true) {
    assert(config.services[svcName] && config.services[svcName].url, 'serviceAPI: Cannot find such service');
    return new serviceApiContext(config.services[svcName].url, path, exception);
}

export default serviceApi;
export {
    ServiceApiError,
}