import {isValidURL, triggerIframe, triggerPixel} from './utils.js';
import {parseParams, resolveParams} from './params.js';

export function getPayload(params) {
    const payload = Object.assign({}, params.args, {
        coopSync: params.coopSync,
        limit: params.limit
    });
    if (params.isAmp) {
        payload.filterSettings = {
            iframe: {
                bidders: '*',
                filter: 'exclude'
            }
        };
    }
    ['bidders', 'gdpr', 'gdpr_consent', 'gpp_sid', 'gpp'].forEach(param => {
        if (params[param] != null) {
            payload[param] = params[param];
        }
    });
    return payload;
}

export function getUserSyncs(params, doFetch = fetch, mkPayload = getPayload) {
    return doFetch(params.endpoint, {
        method: 'POST',
        body: JSON.stringify(mkPayload(params)),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
    }).then(resp => {
        if (resp.ok) {
            return resp.json();
        } else {
            throw new Error(`cookie_sync call failed: ${resp.status} ${resp.statusText}`);
        }
    }).then(body => {
        if (['ok', 'no_cookie'].includes(body.status)) {
            return body.bidder_status;
        } else {
            return [];
        }
    });
}

export function runSync(bidder, {type, url}, log = () => {}, triggers = {
    image: triggerPixel,
    redirect: triggerPixel,
    iframe: triggerIframe
}) {
    if (!isValidURL(url)) {
        log(`Invalid URL for '${bidder}: '${url}'`);
        return Promise.resolve();
    }
    if (triggers[type] == null) {
        log(`Unsupported sync type for '${bidder}': '${type}'`);
        return Promise.resolve();
    } else {
        log(`Running ${type} sync for '${bidder}': ${url}`);
        return triggers[type](url).catch(e => {
            log(`Could not run sync for '${bidder}'`, e);
        });
    }
}

export function runAllSyncs(syncs, log = () => {}, runSingleSync = runSync) {
    return syncs.filter(s => s.no_cookie)
        .reduce((pm, sync) => pm.then(() => runSingleSync(sync.bidder, sync.usersync, log)), Promise.resolve())
        .then(() => log('User syncing complete'));
}

export function loadSyncs(alwaysPollAMP = false, params = parseParams()) {
    return resolveParams(params, alwaysPollAMP)
        .then(params => {
            params.log?.('Fetching user syncs', params);
            return getUserSyncs(params);
        }).then(syncs => runAllSyncs(syncs, params.log));
}
