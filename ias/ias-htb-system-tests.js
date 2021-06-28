'use strict';

function getPartnerId() {
    return 'IASHtb';
}

function getStatsId() {
    return 'IAS';
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
                pubId: '99',
                sizes: [[320, 50]],
                adUnitPath: '/57514611/news.com'
            },
            2: {
                pubId: '99',
                sizes: [[200, 350]],
                adUnitPath: '/57514611/news.com'
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'GET',
        urlRegex: /.*pixel\.adsafeprotected\.com\/services\/pub.*/
    };
}

function validateBidRequest(request) {
    expect(request.query.anId).toBeDefined();
    expect(request.query.slot).toBeDefined();
    expect(request.query.wr).toBeDefined();
    expect(request.query.sr).toBeDefined();
}

function getValidResponse(request, creative) {
    var response = {
        price: 200,
        brandSafety: {
            adt: 'veryLow',
            alc: 'veryLow',
            dlm: 'veryLow',
            drg: 'veryLow',
            hat: 'veryLow',
            off: 'veryLow',
            vio: 'veryLow'
        },
        fr: 'false',
        slots: {
            htSlotDesktopAId: {
                id: 'fdfcfa8b-d8ac-11e9-82e4-14dda9d4b6a0',
                vw: ['40', '50'],
                grm: ['40']
            }
        }
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(
        jasmine.objectContaining({
            ix_ias_id: jasmine.arrayWithExactContents([jasmine.any(String)]),
            ix_ias_adt: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_alc: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_dlm: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_drg: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_hat: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_off: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_vio: jasmine.arrayWithExactContents(['veryLow']),
            ix_ias_fr: jasmine.arrayWithExactContents(['false']),
            ix_ias_vw: jasmine.arrayWithExactContents(['40', '50']),
            ix_ias_dealid: jasmine.arrayWithExactContents(['1x1_fdfcfa8b-d8ac-11e9-82e4-14dda9d4b6a0']),
            ix_ias_cpm: ['1x1_200']
        })
    );
}

function getPassResponse(request) {
    var response = {
        price: -1,
        brandSafety: {
            adt: 'veryLow',
            alc: 'veryLow',
            dlm: 'veryLow',
            drg: 'veryLow',
            hat: 'veryLow',
            off: 'veryLow',
            vio: 'veryLow'
        },
        fr: 'false',
        slots: {
            htSlotDesktopAId: {
                id: 'fdfcfa8b-d8ac-11e9-82e4-14dda9d4b6a0',
                vw: ['40', '50'],
                grm: ['40']
            }
        }
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
    getValidResponse: getValidResponse,
    validateTargeting: validateTargeting,
    getPassResponse: getPassResponse
};
