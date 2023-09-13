import assert from "assert";
import got, {HTTPError} from "got";
import config from "../config.js";
import Config from "../config.js";

class ServiceApiError extends Error {
    constructor(statusCode, body, msg) {
        super(msg instanceof Error ? JSON.parse(msg.message) : JSON.parse(msg));
        if (msg instanceof Error)
            this.stack = msg.stack;
        if (!Config.__DEBUG__)
            delete this.message;
        this.statusCode = statusCode;
        this.body = body;
    }

    statusCode = 0;
    body = '';
}

class ServiceApiContext {
    constructor(base, path = '/', {exception = false, username = undefined, password = undefined}) {
        this.#urlbase = base;
        this.#urlpath = path;
        this.#throwHttpErrors = exception;
        this.#username = username;
        this.#password = password;
    }

    #url = '';
    #urlbase = '';
    #urlpath = '';
    #username = '';
    #password = '';
    #reqheaders = {};
    #urlquery = new URLSearchParams();
    #throwHttpErrors = true;
    /** @type {'GET'|'POST'|'PUT'|'DELETE'} */
    #reqmethod = '';

    #execute(body) {
        this.#url = this.#urlbase + this.#urlpath;
        this.#url += this.#urlquery.toString() ? '?' + this.#urlquery.toString() : '';

        return got(this.#url, {
            method: this.#reqmethod,
            throwHttpErrors: this.#throwHttpErrors,
            json: this.#reqmethod == 'POST' || this.#reqmethod == 'DELETE' ? body : undefined,
            body: this.#reqmethod == 'PUT' ? body : undefined,
            headers: this.#reqheaders,
            username: this.#username,
            password: this.#password,
        }).json().catch(err => {
            if (err instanceof HTTPError)
                throw new ServiceApiError(err.response.statusCode, JSON.parse(err.response.body), err);
            throw new ServiceApiError(-1, null, err);
        }).then(r => {    // DEBUG
            return r;
        });
    }

    get() {
        this.#reqmethod = 'GET';
        return this.#execute(undefined);
    }

    post(body = undefined) {
        this.#reqmethod = 'POST';
        return this.#execute(body);
    }

    put(content = undefined) {
        this.#reqmethod = 'PUT';
        return this.#execute(content);
    }

    delete(body = undefined) {
        this.#reqmethod = 'DELETE';
        return this.#execute(body)
    }

    /** @param {Record<string, string>} qobj */
    query(qobj) {
        for (const i of Object.keys(qobj))
            this.#urlquery.set(i, qobj[i]);
        return this;
    }

    /** @param {Record<string, string>} hobj */
    header(hobj) {
        Object.assign(this.#reqheaders, hobj);
        return this;
    }
}

/** @param {'eaAPI'|'msGraphAPI'} svcName */
function serviceApi(svcName, path = '/', exception = true, auth = false) {
    assert(config.services[svcName] && config.services[svcName].url, 'serviceAPI: Cannot find such service');
    return new ServiceApiContext(config.services[svcName].url, path, {
        exception,
        username: auth ? config.services[svcName].username : '',
        password: auth ? config.services[svcName].password : ''
    });
}

export default serviceApi;
export {
    ServiceApiError,
}
