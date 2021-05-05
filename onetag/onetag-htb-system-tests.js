'use strict';

function getPartnerId() {
    return 'OnetagHtb';
}

function getStatsId() {
    return 'ONE';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'FSRA';
}

function getConfig() {
    return {
        xSlots: {
            1: {
                pubId: '386276e072',
                sizes: [[300, 250]]
            },
            2: {
                pubId: '386276e072',
                sizes: [[300, 600]]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /onetag-sys\.com\/prebid-request/
    };
}

function validateBidRequest(request) {
    expect(request.body).toBeDefined();
    var data = JSON.parse(request.body);
    expect(data.bids).toBeDefined();
    expect(Array.isArray(data.bids)).toBeTruthy();
    data.bids.forEach(function (bid) {
        expect(bid.pubId).toBeDefined();
        expect(bid.sizes).toBeDefined();
        expect(bid.adUnitCode).toBeDefined();
        expect(bid.type).toBeDefined();
        expect(bid.auctionId).toBeDefined();
        expect(bid.bidId).toBeDefined();
        expect(bid.transactionId).toBeDefined();
        expect(Array.isArray(bid.sizes)).toBeDefined();
    });
}

function getValidResponse(request, creative) {
    var data = JSON.parse(request.body);
    var bids = [];
    data.bids.forEach(function (bid) {
        bids.push({
            requestId: bid.bidId,
            cpm: 2,
            width: bid.sizes[0].width,
            height: bid.sizes[0].height,
            creativeId: '1168',
            mediaType: 'banner',
            ad: creative,
            ttl: 300,
            currency: 'USD'
        });
    });

    return JSON.stringify({
        bids: bids
    });
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_one_om: jasmine.arrayWithExactContents(['300x250_200', '300x600_200']),
        ix_one_id: jasmine.arrayWithExactContents([jasmine.any(String), jasmine.any(String)])
    }));
}

function getPassResponse() {
    return JSON.stringify({
        bids: [],
        nobid: true
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
    getValidResponse: getValidResponse,
    validateTargeting: validateTargeting,
    getPassResponse: getPassResponse
};
