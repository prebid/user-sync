import {getUserSyncs, runAllSyncs} from './client.js';
import {parseParams} from './params.js';
import {getLogger} from './log.js';

function loadSyncs() {
    const params = parseParams();
    const log = getLogger(params.debug);
    log('Fetching user syncs', params);
    getUserSyncs(params).then(syncs => runAllSyncs(syncs, getLogger(params.debug)));
}

loadSyncs();
