'use strict';

function getPartnerId() {
    return 'EcdrsvcHtb';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'MRA';
}

function getStatsId() {
    return 'ECD';
}

function getConfig() {
    var config = {
        // Partner level parameter
        xSlots: {
            1: {
                // Slot level parameter
                ppid: 12345,
                sizes: [[300, 250]]
            }
        }
    };

    return config;
}

function getBidRequestRegex() {
    return {
        method: 'POST',
        urlRegex: /.*prometheus-ix.ecdrsvc.com\/prometheus\/bid.*/
    };
}

function validateBidRequest(request) {
    var r = JSON.parse(request.body);
    expect(r.site.url).toBeDefined();
    expect(r.site.referrer).toBeDefined();
    expect(r.site.ppid).toBeDefined();
}

function getValidResponse(request, creative) {
    var r = JSON.parse(request.body);
    var adm = creative || '<script type="text/javascript" src="https://adsvr.ecdrsvc.com/?6000004"></script>';
    var response = {
        request_id: r.id,
        seat_bid: [
            {
                impression_id: '0119dfa3a38611ebaef48fa5d96696e6',
                bid_price: 2.00,
                width: 300,
                height: 250,
                adomain: ['www.loblaws.ca'],
                creative: adm
            }
        ],
        deal: ''
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(
        jasmine.objectContaining({
            ix_ecd_cpm: jasmine.arrayWithExactContents(['300x250_200']),
            ix_ecd_id: jasmine.arrayWithExactContents([jasmine.any(String)])
        })
    );
}

function getPassResponse(request) {
    var r = JSON.parse(request.body);

    return JSON.stringify({
        seat_bid: [],
        request_id: r.request_id,
        deal: ''
    });
}

module.exports = {
    getPartnerId: getPartnerId,
    getCallbackType: getCallbackType,
    getArchitecture: getArchitecture,
    getStatsId: getStatsId,
    getConfig: getConfig,
    getBidRequestRegex: getBidRequestRegex,
    validateBidRequest: validateBidRequest,
    getValidResponse: getValidResponse,
    validateTargeting: validateTargeting,
    getPassResponse: getPassResponse
};
