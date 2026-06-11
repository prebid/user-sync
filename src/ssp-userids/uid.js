/**
 * This script returns the SSP buyer user IDs.
 *
 * Usage:
 * window.pbs.getBuyerUids(function(error, uids) {
 *     // use uids here
 * });
 */

import * as commons from './commons';

window.pbs = (window.pbs || {});
window.pbs.getBuyerUids = getBuyerUids;

const ENDPOINT = 'https://prebid.adnxs.com/pbs/v1/getuids';
const STORAGE_KEY = 'ssp-buyeruids';
const REFRESH_IN_DAYS = 14;

/**
 * Calls the callback when buyer user IDs are ready.
 * @param {function} callback
 */
export function getBuyerUids(callback) {
    let uidData;

    try {
        uidData = getStoredUidData();
    } catch (e) {
        callback(e, null);
        return;
    }

    if (hasInvalidData(uidData)) {
        loadData(callback);
    } else {
        delete uidData.lastUpdated;
        callback(null, uidData);
    }
}

/**
 * Gets the data from Prebid Server getuids endpoint and stores it in local storage.
 * @param {function} callback
 */
export function loadData(callback) {
    function saveData(response) {
        try {
            response = JSON.parse(response);
            response.lastUpdated = commons.timestamp();
            commons.setDataInLocalStorage(STORAGE_KEY, JSON.stringify(response));
            delete response.lastUpdated;
            callback(null, response);
        } catch (e) {
            callback(e, null);
        }
    }

    let uidData;

    try {
        uidData = getStoredUidData();
    } catch (e) {
        callback(e, null);
        return;
    }

    if (hasInvalidData(uidData)) {
        commons.ajax(ENDPOINT, saveData, null, {
            withCredentials: true
        });
    }
}

/**
 * Read and parse buyer ID data from storage.
 * @returns {Object|null}
 */
function getStoredUidData() {
    const uidData = commons.getDataFromLocalStorage(STORAGE_KEY);

    if (!uidData) {
        return null;
    }

    return JSON.parse(uidData);
}

/**
 * Check whether buyer ID data is not set or is expired.
 * @param {Object|null} uidData
 * @returns {boolean}
 */
function hasInvalidData(uidData) {
    return !uidData || !uidData.lastUpdated || commons.timestamp() > uidData.lastUpdated + REFRESH_IN_DAYS * 24 * 60 * 60 * 1000;
}

function noop() {}
loadData(noop);
