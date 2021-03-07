'use strict';

function getPartnerId() {
    return 'DeepIntentHtb';
}

function getStatsId() {
    return 'DEE';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'SRA';
}

function getConfig() {
    return {
        tagId: '100013',
        pos: 1,
        user: {
            id: 'di_testuid',
            buyeruid: 'di_testbuyeruid',
            yob: 2002,
            gender: 'F'
        },
        xSlots: {
            1: {
                adUnitName: '/43743431/DMDemo',

                // Winning bid for [160x600]
                sizes: [[160, 600], [300, 250]]
            },
            2: {
                adUnitName: '/43743431/DMDemo1',

                // Winning bid for [300x250]
                sizes: [
                    [728, 90],
                    [800, 250],
                    [300, 250]
                ]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /https:\/\/prebid\.deepintent\.com\/prebid/
    };
}

function validateBidRequest(request) {
    // Expect(request.host).toEqual('deepintent.com');
    expect(request.host).toEqual('prebid.deepintent.com');
    var config = getConfig();
    var sizes1 = config.xSlots[1].sizes;
    var sizes2 = config.xSlots[2].sizes;

    var body = request.body;
    if (body) {
        body = JSON.parse(body);
        expect(body.id).toBeDefined();
        expect(body.imp.length).toEqual(2);
        expect(body.imp[0].banner).toBeDefined();
        expect(body.imp[0].secure).toEqual(1);
        expect(body.imp[0].banner.w).toEqual(sizes1[0][0]);
        expect(body.imp[0].banner.h).toEqual(sizes1[0][1]);
        expect(body.imp[0].tagid).toEqual(config.xSlots['1'].adUnitName);

        expect(body.imp[1].banner).toBeDefined();
        expect(body.imp[1].banner.w).toEqual(sizes2[0][0]);
        expect(body.imp[1].banner.h).toEqual(sizes2[0][1]);
        expect(body.imp[1].tagid).toEqual(config.xSlots['2'].adUnitName);

        expect(body.at).toEqual(1);

        expect(body.site).toBeDefined();
        expect(body.site.page).toBeDefined();
        expect(body.site.domain).toBeDefined();

        expect(body.user.id).toBeDefined();
        expect(body.user.buyeruid).toBeDefined();
        expect(body.user.yob).toEqual(config.user.yob);
        expect(body.user.gender).toEqual(config.user.gender);

        expect(body.device).toBeDefined();
        expect(body.device.ua).toBeDefined();
        expect(body.device.js).toBeDefined();
        expect(body.device.js).toEqual(1);
        expect(body.device.dnt).toBeDefined();
        expect(body.device.h).toBeDefined();
        expect(body.device.w).toBeDefined();
        expect(body.device.language).toBeDefined();
    }
}

function getValidResponse(request, creative) {
    var body = JSON.parse(request.body);
    var response = {
        id: '4E733404-CC2E-48A2-BC83-4DD5F38FE9BB',
        bidId: '0b08b09f-aaa1-4c14-b1c8-7debb1a7c1cd',
        seatbid: [
            {
                seat: '12345',
                bid: [
                    {
                        id: '4E733404-CC2E-48A2-BC83-4DD5F38FE9BB',
                        impid: body.imp[0].id,
                        price: 2,
                        adid: '10001',
                        adm: creative,
                        adomain: ['test.com'],
                        cid: '16981',
                        crid: '13665',
                        h: 600,
                        w: 160
                    },
                    {
                        id: '4E733404-CC2E-48A2-BC83-4DD5F38FE9BC',
                        impid: body.imp[1].id,
                        price: 2,
                        adid: '10001',
                        adm: creative,
                        adomain: ['test.com'],
                        cid: '16981',
                        crid: '13665',
                        h: 250,
                        w: 300
                    }
                ]
            }
        ]
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    var isObjEmpty = Object.keys(targetingMap).length === 0 && targetingMap.constructor === Object;
    if (!isObjEmpty) {
        expect(targetingMap).toEqual(jasmine.objectContaining({
            ix_dee_om: jasmine.arrayContaining([jasmine.any(String), jasmine.any(String)]),
            ix_dee_id: jasmine.arrayContaining([jasmine.any(String), jasmine.any(String)])
        }));
    }
}

function getPassResponse() {
    return JSON.stringify({ bids: [] });
}

function validateBidRequestWithPrivacy(request) {
    var r = JSON.parse(request.body);

    expect(r.regs.ext.gdpr).toEqual(1);

    expect(r.user).toEqual(jasmine.objectContaining({
        ext: {
            gdpr_consent: 'TEST_GDPR_CONSENT_STRING'
        }
    }));
}

function validateBidRequestWithAdSrvrOrg(request) {
    var body = JSON.parse(request.body);
    expect(body.user.eids[0].source).toEqual('adserver.org');
    expect(body.user.eids[0].uids).toEqual(jasmine.arrayContaining([
        {
            id: 'TEST_ADSRVR_ORG_STRING',
            ext: {
                rtiPartner: 'TDID'
            }
        }
    ]));
}

function validateBidRequestWithUspapi(request) {
    var r = JSON.parse(request.body);

    expect(r.regs.ext.us_privacy).toEqual('TEST_USPAPI_CONSENT_STRING');
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
    getPassResponse: getPassResponse,
    validateBidRequestWithAdSrvrOrg: validateBidRequestWithAdSrvrOrg,
    validateBidRequestWithPrivacy: validateBidRequestWithPrivacy,
    validateBidRequestWithUspapi: validateBidRequestWithUspapi
};
