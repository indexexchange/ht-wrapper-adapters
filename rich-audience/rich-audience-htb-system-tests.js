'use strict';

function getPartnerId() {
    return 'RichAudienceHtb';
}

function getStatsId() {
    return 'RIC';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'MRA';
}

function getConfig() {
    return {
        currencyCode: ['USD'],
        xSlots: {
            0: {
                adUnitName: 'AdUnitMPUDibujos',
                placementId: 'SIEUTMpbxj',
                supplyType: 'site',
                sizes: [[300, 250]]
            },
            1: {
                adUnitName: 'AdUnitLeaderBoardDibujos',
                placementId: '0wILSPtTKI',
                supplyType: 'site',
                sizes: [[728, 90]]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /shb\.richaudience\.com\/hb/
    };
}

function validateBidRequest(request) {
    var config = getConfig();
    var data = JSON.parse(request.body);

    expect(data.currencyCode).toBeDefined();
    expect(data.currencyCode).toEqual(config.currencyCode);
    expect(data.referer).toBeDefined();
    expect(data.referer).toEqual(encodeURIComponent(document.location.href));
    expect(data.sizes[0].w).toEqual(config.xSlots[1].sizes[0][0]);
    expect(data.sizes[0].h).toEqual(config.xSlots[1].sizes[0][1]);
    expect(data.supplyType).toBeDefined();
    expect(data.supplyType).toEqual(config.xSlots[1].supplyType);
    expect(data.tagId).toBeDefined();
    expect(data.tagId).toEqual(config.xSlots[1].adUnitName);
    expect(data.bidder).toBeDefined();
    expect(data.bidder).toEqual(getPartnerId());
    expect(data.bidId).toBeDefined();
    expect(data.bidId).toEqual(getStatsId());
    expect(data.gdprConsent).toEqual('');
    expect(data.gdpr).toEqual(false);
}

function getValidResponse(request, creative) {
    var data = JSON.parse(request.body);
    var adm = creative || '<h1>Creative Test!</h2>';

    // Creative RA adm = '<a target="_blank" href="http://richaudience.com"><img src="https://cdn3.richaudience.com/demo/728x90.jpeg" width="728" height="90"></a>'
    var response = {
        requestId: data.bidderRequestId,
        cpm: 2,
        width: data.sizes[0].w,
        height: data.sizes[0].h,
        creative_id: 83333345,
        netRevenue: true,
        ttl: 300,
        dealId: null,
        media_type: 'banner',
        adm: adm,
        type: 'display',
        currency: data.currencyCode[0]
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual({
        ix_ric_om: ['728x90_200'],
        ix_ric_id: [jasmine.any(String)]
    });
}

function validateBidRequestWithPrivacy(request) {
    var data = JSON.parse(request.body);

    expect(data.gdprConsent).toEqual('TEST_GDPR_CONSENT_STRING');
    expect(data.gdpr).toEqual(true);
}

function getValidResponseWithDeal(request, creative) {
    var data = JSON.parse(request.body);
    var response = {
        requestId: data.bidderRequestId,
        cpm: 99,
        width: 1,
        height: 1,
        creative_id: 83333345,
        netRevenue: true,
        ttl: 300,
        dealId: 'ramkt',
        media_type: 'banner',
        adm: creative,
        type: 'display',
        currency: 'USD'
    };

    return JSON.stringify(response);
}

function validateTargetingWithDeal(targetingMap) {
    expect(targetingMap).toEqual({
        ix_ric_dealid: ['1x1_ramkt'],
        ix_ric_om: ['1x1_5000'],
        ix_ric_id: [jasmine.any(String)]
    });
}

function getPassResponse(request) {
    var data = JSON.parse(request.body);
    var response = {
        requestId: data.bidderRequestId,
        cpm: 0,
        width: data.sizes[0].w,
        height: data.sizes[0].h,
        creative_id: 83333345,
        netRevenue: true,
        ttl: 300,
        dealId: '',
        media_type: 'banner',
        adm: '',
        type: 'display',
        currency: data.currencyCode[0]
    };

    return JSON.stringify(response);
}

module.exports = {
    getPartnerId: getPartnerId,
    getCallbackType: getCallbackType,
    getStatsId: getStatsId,
    getArchitecture: getArchitecture,
    getConfig: getConfig,
    getBidRequestRegex: getBidRequestRegex,
    validateBidRequest: validateBidRequest,
    getValidResponse: getValidResponse,
    validateTargeting: validateTargeting,
    validateBidRequestWithPrivacy: validateBidRequestWithPrivacy,
    getValidResponseWithDeal: getValidResponseWithDeal,
    validateTargetingWithDeal: validateTargetingWithDeal,
    getPassResponse: getPassResponse
};
