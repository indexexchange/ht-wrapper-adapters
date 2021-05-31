'use strict';

function getPartnerId() {
    return 'YieldoneHtb';
}

function getStatsId() {
    return 'YIE';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'MRA';
}

function getConfig() {
    return {
        xSlots: {
            1: {
                placementId: '36891',
                sizes: [[300, 250], [350, 600]]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'GET',
        urlRegex: /.*y\.one\.impact-ad\.jp\/h_bid\?.*/
    };
}

function validateBidRequest(request) {
    // Check query string parameters.

    expect(request.query.v).toBe('hb2');
    expect(request.query.p).toBe('36891');
    expect(request.query.r).toBeDefined();
    expect(request.query.uc).toBeDefined();
    expect(request.query.tid).toBeDefined();
    expect(request.query.cb).toBeDefined();
    expect(request.query.uid).toBeDefined();
    expect(request.query.t).toBe('i');
    expect(request.query.sz).toBe('300x250,350x600');
}

function getValidResponse(request, creative) {
    var uid = request.query.uid;
    var adm = creative || '<div>test content</div>';
    var response = {
        cpm: 0.002,
        adTag: adm,
        height: 250,
        width: 300,
        uid: uid
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_yie_cpm: jasmine.arrayContaining(['300x250_200']),
        ix_yie_id: jasmine.arrayContaining([jasmine.any(String)])
    }));
}

function getPassResponse() {
    return '{}';
}

function getValidResponseWithDeal(request, creative) {
    var uid = request.query.uid;
    var adm = creative || '<div>test content</div>';
    var response = {
        cpm: 0.003,
        adTag: adm,
        height: 250,
        width: 300,
        uid: uid,
        dealId: 11
    };

    return JSON.stringify(response);
}

function validateTargetingWithDeal(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_yie_cpm: jasmine.arrayContaining(['300x250_300']),
        ix_yie_dealid: jasmine.arrayContaining(['300x250_11']),
        ix_yie_id: jasmine.arrayContaining([jasmine.any(String)])
    }));
}

module.exports = {
    getPartnerId: getPartnerId,
    getStatsId: getStatsId,
    getBidRequestRegex: getBidRequestRegex,
    getCallbackType: getCallbackType,
    getConfig: getConfig,
    validateBidRequest: validateBidRequest,
    getValidResponse: getValidResponse,
    validateTargeting: validateTargeting,
    getArchitecture: getArchitecture,
    getPassResponse: getPassResponse,
    getValidResponseWithDeal: getValidResponseWithDeal,
    validateTargetingWithDeal: validateTargetingWithDeal
};
