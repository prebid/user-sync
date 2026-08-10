import * as commons from '../src/ssp-userids/commons';
import { expect } from 'chai';

describe('commons ajax', function() {
    let xhr;
    let request;

    beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function(createdRequest) {
            request = createdRequest;
        };
    });

    afterEach(function() {
        xhr.restore();
    });

    it('reports request timeouts through the error callback', function() {
        const error = sinon.spy();

        commons.ajax('/uids', { success: sinon.spy(), error });
        request.ontimeout();

        expect(error.calledOnceWithExactly('timeout', request)).to.be.true;
    });
});
