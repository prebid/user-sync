import {getPayload, getUserSyncs, runAllSyncs, runSync} from '../src/client.js';

describe('cookie_sync client', () => {
    describe('getPayload', () => {
        Object.entries({
            'includes args': {
                params: {
                    args: {
                        custom: 'arg'
                    }
                },
                payload: {
                    custom: 'arg'
                }
            },
            'transcribes limit and coopSync': {
                params: {
                    limit: 123,
                    coopSync: false
                },
                payload: {
                    limit: 123,
                    coopSync: false
                }
            },
            'adds filterSetting if isAmp is true': {
                params: {
                    isAmp: true
                },
                payload: {
                    filterSettings: {
                        iframe: {
                            bidders: '*',
                            filter: 'exclude'
                        }
                    }
                }
            },
            'does not set filterSettigs if isAmp is false': {
                params: {
                    isAmp: false,
                },
                no: ['filterSettings']
            },
            'adds bidders, if present': {
                params: {
                    bidders: ['bidderA', 'bidderB'],
                },
                payload: {
                    bidders: ['bidderA', 'bidderB']
                }
            },
            'does not add bidders if missing': {
                params: {
                    bidders: null,
                },
                no: ['bidders']
            },
            'adds gdpr and gdpr_consent, if present': {
                params: {
                    gdpr: 0,
                    gdpr_consent: 'string'
                },
                payload: {
                    gdpr: 0,
                    gdpr_consent: 'string'
                }
            },
            'does not add gdpr and gdpr_consent, if missing': {
                params: {},
                no: ['gdpr', 'gdpr_consent']
            },
            'adds gpp_sid and gpp, if present': {
                params: {
                    gpp_sid: '1,2',
                    gpp: 'consent-string'
                },
                payload: {
                    gpp_sid: '1,2',
                    gpp: 'consent-string'
                }
            },
            'does not add gpp params, if missing': {
                params: {},
                no: ['gpp_sid', 'gpp']
            }
        }).forEach(([t, {params, payload, no}]) => {
            it(t, () => {
                const actual = getPayload(params);
                if (payload) {
                    sinon.assert.match(actual, payload);
                }
                if (no) {
                    no.forEach(param => expect(actual[param]).to.not.exist);
                }
            });
        });
    });
    describe('getUserSyncs', () => {
        let fetch, getPayload;
        beforeEach(() => {
            fetch = sinon.stub();
            getPayload = sinon.stub();
        });

        function runGetUserSyncs(params) {
            return getUserSyncs(params, fetch, getPayload);
        }

        it('makes a POST request with endpoint and payload given by params', () => {
            fetch.returns(Promise.resolve());
            getPayload.returns({payload: 'content'});
            const params = {
                endpoint: 'some-site',
                arg: 'value'
            };
            runGetUserSyncs(params);
            sinon.assert.calledWith(getPayload, params);
            sinon.assert.calledWith(fetch, params.endpoint, {
                method: 'POST',
                body: JSON.stringify({payload: 'content'}),
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });
        });
        describe('rejects', () => {
            beforeEach(() => {
                getPayload.returns({});
            });

            function expectRejection(err) {
                let rejection;
                return runGetUserSyncs({})
                    .catch((err) => {
                        rejection = err;
                    })
                    .finally(() => {
                        sinon.assert.match(rejection, err);
                    });
            }

            it('when fetch rejects', () => {
                fetch.returns(Promise.reject('error'));
                return expectRejection('error');
            });
            it('when the response is not a 200', () => {
                fetch.returns(Promise.resolve({
                    ok: false,
                    status: 400,
                    statusText: 'Bad Request'
                }));
                return expectRejection({message: 'cookie_sync call failed: 400 Bad Request'});
            });
        });
        describe('resolves', () => {
            let responseBody;
            beforeEach(() => {
                responseBody = null;
                getPayload.returns({});
                fetch.returns(Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(responseBody)
                }));
            });
            ['no_cookie', 'ok'].forEach((status) => {
                it(`to bidder_status when response 'status' is ${status}`, () => {
                    responseBody = {
                        status,
                        bidder_status: 'mock-syncs'
                    };
                    return runGetUserSyncs({}).then(res => expect(res).to.eql('mock-syncs'));
                });
            });
            it('to empty list otherwise', () => {
                responseBody = {
                    status: 'other'
                };
                return runGetUserSyncs({}).then(res => expect(res).to.eql([]));
            });
        });
    });
    describe('runSync', () => {
        let triggers;
        beforeEach(() => {
            triggers = {
                method: sinon.stub(),
            };
        });
        it('does not choke if trigger does not exist', () => {
            return runSync('bidder', {type: 'other'});
        });
        it('does not run invalid URLs', () => {
            return runSync('bidder', {url: 'invalid', type: 'method'}, () => {}, triggers).then(() => {
                sinon.assert.notCalled(triggers.method);
            })
        })
        describe('runs trigger and returns when it', () => {
            Object.entries({
                'resolves': Promise.resolve(),
                'rejects': Promise.reject()
            }).forEach(([t, result]) => {
                it(t, () => {
                    triggers.method.returns(result);
                    return runSync('bidder', {type: 'method', url: 'https://www.example.com'}, () => {}, triggers).then(() => {
                        sinon.assert.calledWith(triggers.method, 'https://www.example.com');
                    });
                });
            });
        });
    });

    describe('runAllSyncs', () => {
        let runSync;
        beforeEach(() => {
            runSync = sinon.stub();
        });

        function runSyncs(syncs) {
            return runAllSyncs(syncs, sinon.stub(), runSync )
        }
        it('only runs "no_cookie" syncs', () => {
            return runSyncs([
                {'no_cookie': false},
                {'no_cookie': true, bidder: 'mock-bidder'}
            ]).then(() => {
                sinon.assert.calledOnce(runSync);
                sinon.assert.calledWith(runSync, 'mock-bidder');
            })
        });
        it('runs syncs sequentially', () => {
            let invocations = 0;
            runSync.callsFake(() => {
              return new Promise((resolve) => {
                  const thisCall = ++invocations;
                  setTimeout(() => {
                      expect(invocations).to.eql(thisCall);
                      resolve();
                  }, 10)
              })
            });
            return runSyncs([
                {no_cookie: true, bidder: 'first'},
                {no_cookie: true, bidder: 'second'}
            ]);
        })
    });

});
