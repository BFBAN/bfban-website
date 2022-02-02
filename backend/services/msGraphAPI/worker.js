/* 
*   This script should deploy on cloudflare worker
*   to provide big file upload task for clients
*/

/** 
 * @typedef FetchEvent
 * @property {Request} request
 * @property {(response: Promise<Response>|Response)=>Promise<Response>} respondWith
*/

// eslint-disable-next-line no-undef
const key = Uint8Array.from(KEY || '0'.repeat(32), c=>c.charCodeAt(0));
// eslint-disable-next-line no-undef
const serverAddr = SERVER_ADDR || '';

/* eslint-disable no-undef */
addEventListener('fetch', (event)=> {
    event.respondWith(requestHandler(event));
});

function makeResponse(status=200, responseBody={}) {
    return new Response(JSON.stringify(responseBody), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Content-Range',
            'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
        }
    });
}

/** @param {FetchEvent} event */
async function requestHandler(event) {
    try {
        const url = new URL(event.request.url);
        const method = event.request.method;
        switch(`${method} ${url.pathname}`) {
        case 'PUT /msGraph/upload': 
            return await msGraphUpload(event.request);
        case 'GET /msGraph/upload':
            return await msGraphUploadStatus(event.request);
        default:
            if(method=='OPTIONS')
                return new Response('', {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Content-Range',
                        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT',
                    } 
                });
            return makeResponse(404, {error: 1, code: 'worker.notFound'});
        }
    } catch(err) {
        return makeResponse(500, {error: 1, code: 'worker.error', message: err.message});
    }
}

async function decryptBase64Content(b64str='') {
    try {
        const bindata = Uint8Array.from(atob(b64str), c=>c.charCodeAt(0));
        const keyObject = await crypto.subtle.importKey('raw', key, 'AES-CBC', false, ['decrypt']);
        const decrypted = await crypto.subtle.decrypt({
            name: 'AES-CBC',
            iv: bindata.slice(0, 16),
        }, keyObject, bindata.slice(16)).catch((err)=>{
            return new ArrayBuffer(0)
        });
        const dec = new TextDecoder('utf-8');
        return dec.decode(decrypted);
    } catch {
        return '';
    }
}

/** @param {Request} request */
async function msGraphUpload(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const ranget = /bytes [0-9]+-[0-9]+\/[0-9]+/.exec(request.headers.get('Content-Range'));
    const range = ranget? ranget[0] : undefined;
        
    const decrypted = await decryptBase64Content(code);
    const payload = JSON.parse(decrypted);
    if(!payload.url || !payload.size || !range)
        return makeResponse(400, {error: 1, code: 'upload.bad'});
    
    const msRequest = new Request(payload.url, {
        method: 'PUT',
        body: request.body,
        headers: {
            'Content-Length': request.headers.get('Content-Length'),
            'Content-Range': range.replace(/\/[0-9]+/, '/'+payload.size)
        }
    });
    const msResponse = await fetch(msRequest);
    const msResBody = await msResponse.json();
    if(msResponse.status == 201) {
        fetch(serverAddr+`?identity=${key}&id=${msResBody.id}`).catch((err)=>{});
        return makeResponse(201, {success: 1, code: 'upload.done', data: {
            id: msResBody.id
        }});
    } else if(msResponse.status == 202)
        return makeResponse(202, {success: 1, code: 'upload.recieved', data: {
            expiredAt: msResBody.expirationDateTime,
            nextRange: msResBody.nextExpectedRanges
        }});
    else
        return makeResponse(msResponse.status, {error: 1, code: 'upload.error', data: msResBody});
}

/** @param {Request} request */
async function msGraphUploadStatus(request) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    const decrypted = await decryptBase64Content(code);
    const payload = JSON.parse(decrypted);
    
    if(!payload.url || !payload.size)
        return makeResponse(400, {error: 1, code: 'upload.bad'});
    
    const msResponse = await fetch(payload.url);
    const msResBody = await msResponse.json();
    if(msResponse == 200)
        return makeResponse(200, {success: 1, code: 'upload.status', data: {
            expiredAt: msResBody.expirationDateTime,
            nextRange: msResBody.nextExpectedRanges
        }});
    else
        return makeResponse(msResponse.status, {error: 1, code: 'upload.error', data: msResBody});
}