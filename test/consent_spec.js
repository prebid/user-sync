import {getAMPConsent} from '../src/ampConsent.js';

describe('getAMPConsent', () => {
    let win, handler;
    beforeEach(() => {
        handler = null;
        win = {
            location: {
                origin: 'self'
            },
            parent: {
                postMessage: sinon.stub()
            },
            addEventListener: sinon.stub().callsFake((event, cb) => {
                if (event === 'message') {
                    handler = cb;
                }
            }),
            removeEventListener: sinon.stub(),
        }
    });

    function consentResponse() {
        return {
            source: win.parent,
            origin: 'parent',
            data: {
                sentinel: 'amp',
                type: 'consent-data',
                consentMetadata: {
                    gdprApplies: 1
                },
                consentString: 'mock-consent'
            }
        };
    }
    it('can retrieve consent data', () => {
        const pm = getAMPConsent(10, win);
        handler(consentResponse());
        return pm.then(consent => {
            expect(consent).to.eql({
                gdpr: 1,
                gdpr_consent: 'mock-consent',
            })
        })
    })
    describe('times out on', () => {
        let clock;
        beforeEach(() => {
            clock = sinon.useFakeTimers();
        })
        afterEach(()  => {
            clock.restore()
        });
        function expectTimeout(response) {
            let success = false;
            const pm = getAMPConsent(10, win)
                .then(() => { success = true; throw new Error() })
                .catch(() => expect(success).to.be.false);
            if (response != null) {
                handler(response)
            }
            clock.tick(20);
            return pm;
        }
        Object.entries({
            'no response': () => null,
            'response with wrong contents': () => Object.assign(consentResponse(), {data: {sentinel: 'other'}}),
            'response from wrong source': () => Object.assign(consentResponse(), {source: 'other'}),
            'response from same origin': () => Object.assign(consentResponse(), {origin: 'self'})
        }).forEach(([t, mkResponse]) => {
            it(t, () => {
                return expectTimeout(mkResponse());
            })
        })
    })

})
