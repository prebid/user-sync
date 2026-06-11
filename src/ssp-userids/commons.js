/**
 * Store data in local storage.
 * @param {string} key
 * @param {string} value
 */
export function setDataInLocalStorage(key, value) {
    if (hasLocalStorage()) {
        window.localStorage.setItem(key, value);
    }
}

/**
 * Get data from local storage.
 * @param {string} key
 * @returns {string|undefined}
 */
export function getDataFromLocalStorage(key) {
    if (hasLocalStorage()) {
        return window.localStorage.getItem(key);
    }
}

/**
 * Check whether local storage is supported.
 * @returns {boolean|undefined}
 */
export function hasLocalStorage() {
    try {
        return !!window.localStorage;
    } catch (e) {
        console.log('Local storage api disabled');
    }
}

export function timestamp() {
    return new Date().getTime();
}

export function ajax(url, callback, data, options = {}) {
    try {
        const timeout = 3000;
        const method = options.method || (data ? 'POST' : 'GET');
        const callbacks = typeof callback === 'object' ? callback : {
            success: function() {
                console.log('xhr success');
            },
            error: function(e) {
                console.log('xhr error', null, e);
            }
        };

        if (typeof callback === 'function') {
            callbacks.success = callback;
        }

        const request = new window.XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState === 4) {
                const status = request.status;
                if ((status >= 200 && status < 300) || status === 304) {
                    callbacks.success(request.responseText, request);
                } else {
                    callbacks.error(request.statusText, request);
                }
            }
        };
        request.ontimeout = function() {
            console.log('xhr timeout after ', request.timeout, 'ms');
        };

        request.open(method, url);
        request.timeout = timeout;

        if (options.withCredentials) {
            request.withCredentials = true;
        }
        if (options.preflight) {
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        request.setRequestHeader('Content-Type', options.contentType || 'text/plain');

        if (method === 'POST' && data) {
            request.send(data);
        } else {
            request.send();
        }
    } catch (error) {
        console.log('xhr construction', error);
    }
}
