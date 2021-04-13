'use strict';

function getPartnerId() {
    return 'SeedtagHtb';
}

function getStatsId() {
    return 'SEE';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'SRA';
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /s\.seedtag\.com\/c\/hb\/bid/

    };
}

function getConfig() {
    return {
        xSlots: {
            1: {
                adunitId: '0001',
                sizes: [[300, 250]],
                placement: 'banner',
                supplyTypes: ['display'],
                publisherToken: '0000-0000-01'
            },
            2: {
                adunitId: '0002',
                sizes: [[300, 600]],
                placement: 'banner',
                supplyTypes: ['display', 'video'],
                publisherToken: '0000-0000-01'
            }
        }
    };
}

function validateBidRequest(request) {
    var payload = JSON.parse(request.body);
    var config = getConfig();

    expect(payload.url).toBeDefined();
    expect(typeof payload.url).toBe('string');
    expect(payload.version).toBeDefined();
    expect(typeof payload.version).toBe('string');
    expect(payload.cmp).toBeDefined();
    expect(typeof payload.cmp).toBe('boolean');
    expect(payload.publisherToken).toBe('0000-0000-01');
    expect(payload.timeout).toBeDefined();
    expect(typeof payload.timeout).toBe('number');
    expect(payload.bidRequests).toBeDefined();

    payload.bidRequests.forEach(function (bid, i) {
        var conf = config.xSlots[String(i + 1)];
        expect(bid.adunitId).toBe(conf.adunitId);
        expect(bid.sizes[0]).toEqual(conf.sizes[0]);
        expect(bid.placement).toBe(conf.placement);
        expect(bid.supplyTypes).toEqual(conf.supplyTypes);
        expect(bid.id).toBeDefined();
        expect(typeof bid.id).toBe('string');
        expect(bid.transactionId).toBeDefined();
        expect(typeof bid.transactionId).toBe('string');
    });
}

function validateBidRequestWithPrivacy(request) {
    var payload = JSON.parse(request.body);
    expect(payload.cmp).toBe(true);
    expect(payload.cd).toBe('TEST_GDPR_CONSENT_STRING');
}

function getValidResponse(request, creative) {
    var payload = JSON.parse(request.body);
    var bids = payload.bidRequests.map(function (bid) {
        return {
            bidId: bid.id,
            price: 2,
            currency: 'USD',
            content: creative,
            width: bid.sizes[0][0],
            height: bid.sizes[0][1],
            mediaType: 'display',
            ttl: 1800
        };
    });

    return JSON.stringify({
        bids: bids,
        cookieSync: ''
    });
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_see_om: jasmine.arrayWithExactContents(['300x250_200', '300x600_200']),
        ix_see_id: jasmine.arrayWithExactContents([jasmine.any(String), jasmine.any(String)])
    }));
}

function getPassResponse() {
    return JSON.stringify({
        bids: [],
        cookieSync: ''
    });
}

module.exports = {
    getPartnerId: getPartnerId,
    getStatsId: getStatsId,
    getCallbackType: getCallbackType,
    getArchitecture: getArchitecture,
    getConfig: getConfig,
    getBidRequestRegex: getBidRequestRegex,
    validateBidRequest: validateBidRequest,
    validateBidRequestWithPrivacy: validateBidRequestWithPrivacy,
    getValidResponse: getValidResponse,
    getPassResponse: getPassResponse,
    validateTargeting: validateTargeting
};
