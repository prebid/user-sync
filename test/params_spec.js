import {ENDPOINT_APPNEXUS, ENDPOINT_RUBICON, NO_LIMIT, parseParams} from '../src/params.js';
import { expect } from 'chai';

describe('Query parameters', () => {
    function makeQueryString(params) {
        return Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&')
    }

    function simpleStringParam(param) {
        return {
            param,
            cases: {
                undefined: {
                    to: null
                },
                empty: {
                    from: '',
                    to: null
                },
                string: {
                    from: 'str',
                    to: 'str'
                }
            }
        }
    }

    Object.entries({
        'endpoint': {
            param: 'endpoint',
            cases: {
                'rubicon': {
                    from: 'rubicon',
                    to: ENDPOINT_RUBICON
                },
                'appnexus': {
                    from: 'appnexus',
                    to: ENDPOINT_APPNEXUS
                },
                'custom': {
                    from: 'https%3A%2F%2Fwww.example.com%2Fcookie_sync',
                    to: 'https://www.example.com/cookie_sync'
                },
                'undefined': {
                    to: ENDPOINT_APPNEXUS,
                },
                'invalid': {
                    from: 'not-an-url',
                    to: ENDPOINT_APPNEXUS
                }
            }
        },
        'args': {
            param: 'args',
            cases: {
                'simple arguments': {
                    from: 'k1:v1,k2:v2,k3:123',
                    to: {k1: 'v1', k2: 'v2', k3: 123}
                },
                'undefined': {
                    to: {}
                },
                'malformed arguments': {
                    from: 'k1:v1,k2,k3:v3:,',
                    to: {
                        k1: 'v1'
                    }
                }
            }
        },
        'bidders': {
            param: 'bidders',
            cases: {
                'simple list of bidders': {
                    from: 'a,b,c',
                    to: ['a', 'b', 'c']
                },
                'no bidders': {
                    to: null
                },
                'empty bidders': {
                    from: 'a,,b,',
                    to: ['a', 'b']
                }
            }
        },
        'isAmp': {
            param: 'source',
            cases: {
                'amp': {
                    from: 'amp',
                    to: true
                },
                'AMP': {
                    from: 'AMp',
                    to: true
                },
                'garbage': {
                    from: 'other',
                    to: false
                }
            }
        },
        'limit': {
            param: 'max_sync_count',
            cases: {
                'undefined': {
                    to: 10
                },
                'garbage': {
                    from: 'garbage',
                    to: NO_LIMIT
                },
                'numerical': {
                    from: '123',
                    to: 123,
                }
            }
        },
        coopSync: {
            param: 'coop_sync',
            cases: {
                'true': {
                    from: 'true',
                    to: true
                },
                'false': {
                    from: 'false',
                    to: false,
                },
                'undefined': {
                    to: true
                },
                '0': {
                    from: 0,
                    to: false
                }
            }
        },
        gdpr: {
            param: 'gdpr',
            cases: {
                '1': {
                    from: '1',
                    to: 1
                },
                '0': {
                    from: '0',
                    to: 0
                },
                'undefined': {
                    to: null
                },
                'garbage': {
                    from: 'other',
                    to: null
                }
            }
        },
        gdpr_consent: simpleStringParam('gdpr_consent'),
        gpp_sid: simpleStringParam('gpp_sid'),
        gpp: simpleStringParam('gpp'),
    }).forEach(([outParam, {param, cases}]) => {
        describe(`"${outParam}"`, () => {
            Object.entries(cases).forEach(([t, {from, to}]) => {
                it(t, () => {
                    const actual = parseParams(new URLSearchParams(from != null && makeQueryString({[param]: from})))[outParam];
                    expect(actual).to.eql(to);
                })
            })
        })
    })
})
