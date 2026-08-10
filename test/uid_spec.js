import { loadData } from '../src/ssp-userids/uid';
import { expect } from 'chai';

describe('uid module', function() {
    let xhr;
    let request;

    beforeEach(function() {
        window.localStorage.removeItem('ssp-buyeruids');
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function(createdRequest) {
            request = createdRequest;
        };
    });

    afterEach(function() {
        xhr.restore();
    });

    it('propagates UID request failures to the caller', function() {
        const callback = sinon.spy();

        loadData(callback);
        request.respond(500, {}, 'request failed');

        expect(callback.calledOnceWithExactly('Internal Server Error', null)).to.be.true;
    });

    it('propagates UID request timeouts to the caller', function() {
        const callback = sinon.spy();

        loadData(callback);
        request.ontimeout();

        expect(callback.calledOnceWithExactly('timeout', null)).to.be.true;
    });
});
