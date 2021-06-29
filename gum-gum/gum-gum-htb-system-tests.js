'use strict';

function getPartnerId() {
    return 'GumGumHtb';
}

function getStatsId() {
    return 'GUM';
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
                inScreen: 'ggumtest',
                sizes: [[300, 100], [300, 600]],
                irisid: 'testIrisID',
                iriscat: 'testIrisCat'
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'GET',
        urlRegex: /.*g2\.gumgum\.com\/hbid\/imp\?.*/
    };
}

// Check query string parameters that's gathered from getConfig
function validateBidRequest(request) {
    expect(request.query.t).toBe('ggumtest');
    expect(request.query.pi).toBe('2');
    expect(request.query.bf).toBe('300x100%2C300x600');
    expect(request.query.irisid).toBe('testIrisID');
    expect(request.query.iriscat).toBe('testIrisCat');
}

function getValidResponse(request, creative) {
    var response = {
        ad: {
            id: '123',
            adBuyId: 123,
            width: 300,
            height: 100,
            markup: creative,
            ii: false,
            price: 2
        },
        pag: {
            pvid: 123
        },
        adhs: {
            id: 30,
            adp: {
                x: 'L',
                y: 'B'
            },
            ads: null,
            adf: {
                animated: false,
                assetwide: true
            },
            clc: '<img style="border:0;margin:0;padding:0;background-color:transparent;cursor:pointer;cursor:hand;width:20px;height:20px;" src="https://c.gumgum.com/ads/com/gumgum/icons/svg/close_light.svg" ">',
            clp: {
                right: 3,
                bottom: 65
            },
            atc: '<img style="border:0;margin:0;padding:0;background-color:transparent;cursor:pointer;cursor:hand;width:20px;height:20px;" src="https://c.gumgum.com/ads/com/gumgum/icons/svg/info_light.svg">',
            atp: {
                right: 27,
                bottom: 65
            },
            acp: null
        },
        cw: '<img src="//c.gumgum.com/px.gif?1596236973551" onload="(function(a,b){b.src=\'//js.gumgum.com/gumgum.js\',a.parentNode.replaceChild(b,a)})(this,document.createElement(\'script\'))"><gumgum-ad product="3" fromAS="AD_JSON"></gumgum-ad>' // eslint-disable-line max-len
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_gum_cpm: jasmine.arrayContaining([jasmine.stringMatching(/300x100_\d+/)]),
        ix_gum_id: jasmine.arrayContaining([jasmine.any(String)])
    }));
}

function getPassResponse() {
    var response = { ad: {} };

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
