'use strict';

function getPartnerId() {
    return 'OpenXHtb';
}

function getStatsId() {
    return 'OPNX';
}

function getCallbackType() {
    return 'NONE';
}

function getArchitecture() {
    return 'SRA';
}

function getConfig() {
    return {
        host: 'mock-ox-del-domain.openx.net',
        xSlots: {
            1: {
                adUnitId: '54321',
                sizes: [[300, 250], [300, 600]]
            },
            2: {
                adUnitId: '12345',
                sizes: [[300, 600]]
            }
        }
    };
}

function getBidRequestRegex() {
    return {
        method: 'GET',
        urlRegex: /.*openx\.net\/w\/1\.0\/arj\?.*/
    };
}

function validateBidRequest(request) {
    // Check query string parameters.
    expect(request.query.auid).toBe('54321,12345');
    expect(request.query.aus).toBe('300x250,300x600|300x600');
    expect(request.query.bc).toBe('hb_ix_2.1.4');
    expect(request.query.be).toBe('1');
}

function getValidResponse(request, creative) {
    var adm = creative || '<a target="_blank" href="http://www.indexexchange.com"><div style="text-decoration: none; color: black; width: 300px; height:250px;background-color: #336eff;"; id="testDiv"><h1>&lt;header_tag&gt; certification testing: 1_1a1a1a1a, deal: 12346 (211474080)width: 300px; height:250px <iframe src="http://as.casalemedia.com/ifnotify?dfp_1_1a1a1a1a&referer=http://127.0.0.1:3000/p/DfpAuto/nonPrefetch/test?dev=desktop&displayMode=SRA&req=211474080" width="0" height="0" frameborder="0" scrolling="no" style="display:none;" marginheight="0" marginwidth="0"></iframe></h1></div><script>var thisDiv = document.getElementById("testDiv");thisDiv.style.fontFamily="verdana";</script></a>';
    var response = {
        ads: {
            ad: [
                {
                    adunitid: 54321,
                    pub_rev: '1000',
                    html: adm,
                    creative: [
                        {
                            width: '300',
                            height: '250'
                        }
                    ]
                },
                {
                    adunitid: 12345,
                    pub_rev: '2000',
                    html: adm,
                    creative: [
                        {
                            width: '300',
                            height: '600'
                        }
                    ]
                }
            ]
        }
    };

    return JSON.stringify(response);
}

function validateTargeting(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_ox_om: jasmine.arrayContaining(['300x250_100', '300x600_200']),
        ix_ox_id: jasmine.arrayContaining([jasmine.any(String)])
    }));
}

function getPassResponse() {
    var response = {
        ads: {
            ad: []
        }
    };

    return JSON.stringify(response);
}

function getValidResponseWithDeal(request, creative) {
    var adm = creative || '<a target="_blank" href="http://www.indexexchange.com"><div style="text-decoration: none; color: black; width: 300px; height:250px;background-color: #336eff;"; id="testDiv"><h1>&lt;header_tag&gt; certification testing: 1_1a1a1a1a, deal: 12346 (211474080)width: 300px; height:250px <iframe src="http://as.casalemedia.com/ifnotify?dfp_1_1a1a1a1a&referer=http://127.0.0.1:3000/p/DfpAuto/nonPrefetch/test?dev=desktop&displayMode=SRA&req=211474080" width="0" height="0" frameborder="0" scrolling="no" style="display:none;" marginheight="0" marginwidth="0"></iframe></h1></div><script>var thisDiv = document.getElementById("testDiv");thisDiv.style.fontFamily="verdana";</script></a>';
    var response = {
        ads: {
            ad: [
                {
                    adunitid: 54321,
                    pub_rev: '100',
                    html: adm,
                    deal_id: 1,
                    creative: [
                        {
                            width: '300',
                            height: '250'
                        }
                    ]
                },
                {
                    adunitid: 12345,
                    pub_rev: '200',
                    html: adm,
                    deal_id: 2,
                    creative: [
                        {
                            width: '300',
                            height: '600'
                        }
                    ]
                }
            ]
        }
    };

    return JSON.stringify(response);
}

function validateTargetingWithDeal(targetingMap) {
    expect(targetingMap).toEqual(jasmine.objectContaining({
        ix_ox_pm: jasmine.arrayContaining(['300x250_1', '300x600_2']),
        ix_ox_id: jasmine.arrayContaining([jasmine.any(String)])
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
