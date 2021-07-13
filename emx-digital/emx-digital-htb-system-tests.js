'use strict';

function getPartnerId() {
    return 'BRealTimeHtb';
}

function getStatsId() {
    return 'BRT';
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
                tagid: '74072',
                bidfloor: 0.01,
                sizes: [[300, 250]]
            },
            2: {
                tagid: '74072',
                bidfloor: 0.01,
                sizes: [[728, 90]]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /.*hb\.emxdgt\.com\/.?t=\d*&ts=\d*/
    };
}

function validateBidRequest(request) {
    var r = JSON.parse(request.body);
    expect(request.body).toBeDefined();

    expect(r.site.page).toBeDefined();
    expect(r.site.domain).toBeDefined();

    expect(r.imp.length).toBe(2);

    expect(r.imp[0]).toEqual({
        id: r.imp[0].id,
        banner: {
            format: [
                {
                    w: 300,
                    h: 250
                }
            ],
            w: 300,
            h: 250
        },
        tagid: '74072',
        secure: r.imp[0].secure,
        bidfloor: 0.01
    });

    expect(r.imp[1]).toEqual({
        id: r.imp[1].id,
        banner: {
            format: [
                {
                    w: 728,
                    h: 90
                }
            ],
            w: 728,
            h: 90
        },
        tagid: '74072',
        secure: r.imp[1].secure,
        bidfloor: 0.01
    });
}

function getValidResponse(request, creative) {
    var r = JSON.parse(request.body);

    var response = {
        id: r.id,
        seatbid: [
            {
                bid: [
                    {
                        adm: creative || '<div id="1"></div>',
                        id: r.imp[0].id,
                        ttl: 300,
                        crid: '94395500',
                        w: 300,
                        price: 2.00,
                        adid: '94395500',
                        h: 250
                    }
                ],
                seat: '1356'
            },
            {
                bid: [
                    {
                        adm: creative || '<div id="2"></div>',
                        id: r.imp[1].id,
                        ttl: 300,
                        crid: '41975016',
                        w: 728,
                        price: 2.00,
                        adid: '41975016',
                        h: 90
                    }
                ],
                seat: '1356'
            }
        ]
    };

    return JSON.stringify(response);
}

function getValidResponseWithDeal(request, creative) {
    var r = JSON.parse(request.body);

    var response = {
        id: r.id,
        seatbid: [
            {
                bid: [
                    {
                        adm: creative || '<div id="1"></div>',
                        id: r.imp[0].id,
                        ttl: 300,
                        crid: '94395500',
                        w: 300,
                        price: 2.00,
                        adid: '94395500',
                        h: 250,
                        dealid: 11
                    }
                ],
                seat: '1356'
            },
            {
                bid: [
                    {
                        adm: creative || '<div id="2"></div>',
                        id: r.imp[1].id,
                        ttl: 300,
                        crid: '41975016',
                        w: 728,
                        price: 2.00,
                        adid: '41975016',
                        h: 90,
                        dealid: 12
                    }
                ],
                seat: '1356'
            }
        ]
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_brt_cpm: jasmine.arrayContaining(['300x250_200', '728x90_200']),
        ix_brt_id: jasmine.arrayWithExactContents([jasmine.any(String), jasmine.any(String)])
    }));
}

function validateTargetingWithDeal(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_brt_cpm: jasmine.arrayWithExactContents(['300x250_200', '728x90_200']),
        ix_brt_dealid: jasmine.arrayContaining(['300x250_11', '728x90_12']),
        ix_brt_id: jasmine.arrayWithExactContents([jasmine.any(String), jasmine.any(String)])
    }));
}

function validateBidRequestWithPrivacy(request) {
    var req = JSON.parse(request.body);
    expect(req.regs.ext.gdpr).toBe(1);
    expect(req.user.ext.consent).toBe('TEST_GDPR_CONSENT_STRING');
}

function validateBidRequestWithTcf2(request) {
    var req = JSON.parse(request.body);
    expect(req.regs.ext.gdpr).toBe(1);
    expect(req.user.ext.consent).toBe('TEST_TCF2_CONSENT_STRING');
}

function getPassResponse(request) {
    var response = { request: request };

    return JSON.stringify(response);
}

module.exports = {
    getPartnerId: getPartnerId,
    getStatsId: getStatsId,
    getBidRequestRegex: getBidRequestRegex,
    getCallbackType: getCallbackType,
    getArchitecture: getArchitecture,
    getConfig: getConfig,
    validateTargeting: validateTargeting,
    validateBidRequest: validateBidRequest,
    getValidResponse: getValidResponse,
    getPassResponse: getPassResponse,
    getValidResponseWithDeal: getValidResponseWithDeal,
    validateTargetingWithDeal: validateTargetingWithDeal,
    validateBidRequestWithPrivacy: validateBidRequestWithPrivacy,
    validateBidRequestWithTcf2: validateBidRequestWithTcf2
};
