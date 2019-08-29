'use strict';

function getPartnerId() {
    return 'AppNexusHtb';
}

function getStatsId() {
    return 'APNX';
}

function getCallbackType() {
    return 'ID';
}

function getArchitecture() {
    return 'MRA';
}

function getBidRequestRegex() {
    return {
        method: 'GET',
        urlRegex: /.*secure\.adnxs\.com\/jpt*/
    };
}

function getConfig() {
    return {
        xSlots: {
            1: {
                placementId: '15894224',
                sizes: [[300, 250]],
                keywords: {
                    music: ['classical', 'piano']
                }
            },
            2: {
                placementId: '15901268',
                sizes: [[300, 250], [300, 600]],
                keywords: {
                    music: ['classical', 'piano']
                }
            }
        },
        mapping: {
            'Fake Unit 1 300x250': ['1'],
            'Fake Unit 2 300x250 or 300x600': ['2']
        }
    };
}

function validateBidRequest(request) {
    var q = request.query;
    expect(q.id).toBeDefined();
    expect(q.size).toBeDefined();
    expect(q.psa).toBeDefined();
    expect(q.callback).toBeDefined();
    expect(q.callback_uid).toBeDefined();
    expect(q.gdpr).toBeDefined();
    expect(q.gdpr_consent).toBeDefined();
    expect(q.referrer).toBeDefined();
    expect(q.kw_music).toBeDefined();
    expect(q.kw_music).toEqual('classical,piano');
}

function getValidResponse(request, creative) {
    var q = request.query;
    var adm = creative;

    var response = {
        result: {
            cpm: 20000,
            width: 300,
            height: 250,
            creative_id: 100232340,
            media_type_id: 1,
            media_subtype_id: 1,
            ad: adm,
            is_bin_price_applicable: false
        },
        callback_uid: q.callback_uid
    };
    var jsonResponse = JSON.stringify(response);

    return 'headertag.AppNexusHtb.adResponseCallback(' + jsonResponse + ')';
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_apnx_om: jasmine.arrayContaining(['300x250_200']),
        ix_apnx_id: jasmine.arrayContaining([jasmine.any(String)])
    }));
}

function getPassResponse(request) {
    var q = request.query;

    var response = {
        result: {
            cpm: 0.0,
            ad: ''
        },
        callback_uid: q.callback_uid
    };

    return 'headertag.AppNexusHtb.adResponseCallback(' + JSON.stringify(response) + ');';
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
    getPassResponse: getPassResponse,
    validateTargeting: validateTargeting
};
