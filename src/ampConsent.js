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
                if (msg.consentMetadata) {
                    resolve({
                        gdpr: msg.consentMetadata.gdprApplies ? 1 : 0,
                        gdpr_consent: msg.consentString || null
                    })
                } else {
                    resolve();
                }
                clearTimeout(timeoutHandle);
                win.removeEventListener('message', messageHandler);
            }
        }
        win.addEventListener('message', messageHandler);
        win.parent.postMessage({
            sentinel: 'amp',
            type: 'send-consent-data'
        }, '*');
    });
}
