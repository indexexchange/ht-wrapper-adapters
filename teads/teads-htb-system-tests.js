'use strict';

function getPartnerId() {
    return 'TeadsHtb';
}

function getStatsId() {
    return 'TEADS';
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /a\.teads\.tv\/hb\/index\/bid-request/
    };
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'SRA';
}

function getConfig() {
    return {
        xSlots: {
            1: {
                placementId: 10,
                pageId: 1,
                sizes: [[300, 250]]
            },
            2: {
                placementId: 10,
                pageId: 1,
                sizes: [[300, 600]]
            }
        }
    };
}

function validateBidRequest(request) {
    var q = JSON.parse(request.body);
    var config = getConfig();
    var sizesSlot1 = config.xSlots['1'].sizes;
    var sizesSlot2 = config.xSlots['2'].sizes;

    expect(q.data).toBeDefined();
    expect(q.deviceWidth).toBeDefined();
    expect(q.referrer).toBeDefined();
    expect(q.pageReferrer).toBeDefined();
    expect(q.networkBandwidth).toBeDefined();
    expect(q.timeToFirstByte).toBeDefined();
    expect(q.hb_version).toBeDefined();
    expect(q.data[0].placementId).toBe(10);
    expect(q.data[0].pageId).toBe(1);
    expect(q.data[0].sizes[0][0]).toBe(sizesSlot1[0][0]);
    expect(q.data[0].sizes[0][1]).toBe(sizesSlot1[0][1]);
    expect(q.data[0].adUnitCode).toBeDefined();
    expect(q.data[0].requestId).toBeDefined();
    expect(q.data[0].slotElementId).toBeDefined();
    expect(q.data[0].transactionId).toBeDefined();

    expect(q.data[1].placementId).toBe(10);
    expect(q.data[1].pageId).toBe(1);
    expect(q.data[1].sizes[0][0]).toBe(sizesSlot2[0][0]);
    expect(q.data[1].sizes[0][1]).toBe(sizesSlot2[0][1]);
    expect(q.data[1].adUnitCode).toBeDefined();
    expect(q.data[1].requestId).toBeDefined();
    expect(q.data[1].slotElementId).toBeDefined();
    expect(q.data[1].transactionId).toBeDefined();
}

function validateBidRequestWithGdpr(request) {
    var q = JSON.parse(request.body);
    expect(q.gdpr_iab).toBeDefined();
    expect(q.gdpr_iab.consent).toBe('TEST_GDPR_CONSENT_STRING');
    expect(q.gdpr_iab.status).toBe(12);
}

function validateBidRequestWithUspapi(request) {
    var q = JSON.parse(request.body);
    expect(q.us_privacy).toBe('TEST_USPAPI_CONSENT_STRING');
}

function getValidResponse(request, creative) {
    var q = JSON.parse(request.body);
    var response = {
        responses: [
            {
                cpm: 2,
                width: 300,
                height: 250,
                ad: creative,
                requestId: q.data[0].requestId
            },
            {
                cpm: 2,
                width: 300,
                height: 600,
                ad: creative,
                dealId: 'ABC-123',
                requestId: q.data[1].requestId
            }
        ]
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_teads_om: jasmine.arrayWithExactContents(['300x250_200']),
        ix_teads_id: jasmine.arrayWithExactContents([jasmine.any(String), jasmine.any(String)]),
        ix_teads_pm: jasmine.arrayWithExactContents(['300x600_200']),
        ix_teads_pmid: jasmine.arrayWithExactContents(['300x600_ABC-123'])
    }));
}

function getPassResponse() {
    var response = {
        responses: []
    };

    return JSON.stringify(response);
}

module.exports = {
    getPartnerId: getPartnerId,
    getStatsId: getStatsId,
    getCallbackType: getCallbackType,
    getArchitecture: getArchitecture,
    getConfig: getConfig,
    getBidRequestRegex: getBidRequestRegex,
    validateBidRequest: validateBidRequest,
    validateBidRequestWithGdpr: validateBidRequestWithGdpr,
    validateBidRequestWithUspapi: validateBidRequestWithUspapi,
    getValidResponse: getValidResponse,
    getPassResponse: getPassResponse,
    validateTargeting: validateTargeting
};
