export function getAMPConsent(timeout = 10000, win = window) {
    return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
            reject(`Consent data request timed out after ${timeout}ms`)
        }, timeout);
        function messageHandler(event) {
            const msg = event.data;
            if (
                event.source === win.parent &&
                event.origin !== win.location.origin &&
                msg?.sentinel === 'amp' &&
                msg?.type === 'consent-data'
            ) {
                resolve(msg.consentMetadata.gdprApplies ? {gdpr: 1, gdpr_consent: msg.consentString} : {gpdr: 0});
                clearTimeout(timeoutHandle);
                win.removeEventListener('message', messageHandler);
            }
        }
        win.addEventListener('message', messageHandler);
        win.parent.postMessage({
            sentinel: 'amp',
            type: 'send-consent-data'
        });
    });
}
