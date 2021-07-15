/**
 * @author:    Partner
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (c) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 * and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */

'use strict';

////////////////////////////////////////////////////////////////////////////////
// Dependencies ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var Browser = require('browser.js');
var Classify = require('classify.js');
var Constants = require('constants.js');
var Partner = require('partner.js');
var Size = require('size.js');
var SpaceCamp = require('space-camp.js');
var System = require('system.js');
var Network = require('network.js');
var Utilities = require('utilities.js');
var Whoopsie = require('whoopsie.js');

var RenderService;
var ComplianceService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var Inspector = require('schema-inspector.js');
var PartnerSpecificValidator = require('app-nexus-network-htb-validator.js');
var Scribe = require('scribe.js');
//? }

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * AppNexusNetworkHtb Class for the creation of the Header Tag Bidder
 *
 * @class
 */
function AppNexusNetworkHtb(configs) {
    /* =====================================
     * Data
     * ---------------------------------- */

    /* Private
     * ---------------------------------- */

    /**
     * Reference to the partner base class.
     *
     * @private {object}
     */
    var __baseClass;

    /**
     * Profile for this partner.
     *
     * @private {object}
     */
    var __profile;

    /**
     * Base URL for the bidding end-point.
     *
     * @private {object}
     */
    var __baseUrl;

    var __version = '2.6.0';

    /* =====================================
     * Functions
     * ---------------------------------- */

    /* Utilities
     * ---------------------------------- */

    /**
     * Generates the request URL to the endpoint for the xSlots in the given
     * returnParcels.
     *
     * @param  {Object[]} returnParcels Array of parcels.
     * @return {Object}                 Request object.
     */
    function __generateRequestObj(returnParcels, optData) {
        //? if (DEBUG){
        var results = Inspector.validate({
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    htSlot: {
                        type: 'object'
                    },
                    xSlotRef: {
                        type: 'object'
                    },
                    xSlotName: {
                        type: 'string',
                        minLength: 1
                    }
                }
            }
        }, returnParcels);
        if (!results.valid) {
            throw Whoopsie('INVALID_ARGUMENT', results.format());
        }
        //? }

        var queryObj = {};
        var callbackId = System.generateUniqueId();

        queryObj.sdk = {
            version: __version
        };

        /* eslint-disable camelcase */
        queryObj.hb_source = 2;
        queryObj.referrer_detection = {
            rd_ifs: null,
            rd_ref: encodeURIComponent(Browser.getPageUrl()),
            rd_stk: encodeURIComponent(Browser.getPageUrl()),
            rd_top: null
        };
        /* eslint-enable camelcase */

        queryObj.tags = [];
        returnParcels.forEach(function (parcel) {
            var objSizes = parcel.xSlotRef.sizes.map(function (reqSize) {
                return {
                    width: reqSize[0],
                    height: reqSize[1]
                };
            });

            var numPlacementId = parseInt(parcel.xSlotRef.placementId, 10);
            var allowSmallerSizes = parcel.xSlotRef.allowSmallerSizes || false;
            var usePaymentRule = parcel.xSlotRef.usePaymentRule || false;

            /* eslint-disable camelcase */
            var tag = {
                ad_types: ['banner'],
                allow_smaller_sizes: allowSmallerSizes,
                disable_psa: true,
                id: numPlacementId,
                prebid: true,
                primary_size: objSizes[0],
                sizes: objSizes,
                use_pmt_rule: usePaymentRule,
                uuid: System.generateUniqueId(14, 'ALPHANUM')
            };
            /* eslint-enable camelcase */

            if (Utilities.isObject(parcel.xSlotRef.keywords) && !Utilities.isEmpty(parcel.xSlotRef.keywords)) {
                var keywordsObj = parcel.xSlotRef.keywords;
                tag.keywords = [];

                Object.keys(keywordsObj)
                    .forEach(function (key) {
                        tag.keywords.push({
                            key: key,
                            value: keywordsObj[key]
                        });
                    });
            }
            
            /*
             * Check for a "optData" argument passed to __generateRequestObj();
             * Push both user and site optional data into the `keywords` key on the `tag`.
            */

            if (Utilities.isObject(optData)) {
                if (!Utilities.isEmpty(optData.keyValues.user)) {
                    var userKeywords = optData.keyValues.user;
                    if (!tag.hasOwnProperty('keywords')) {
                        tag.keywords = [];
                    }

                    Object.keys(userKeywords)
                        .forEach(function (key) {
                            tag.keywords.push({
                                key: key,
                                value: userKeywords[key]
                            });
                        });
                }

                if (!Utilities.isEmpty(optData.keyValues.site)) {
                    var siteKeywords = optData.keyValues.site;
                    if (!tag.hasOwnProperty('keywords')) {
                        tag.keywords = [];
                    }

                    Object.keys(siteKeywords)
                        .forEach(function (key) {
                            tag.keywords.push({
                                key: key,
                                value: siteKeywords[key]
                            });
                        });
                }
            }

            queryObj.tags.push(tag);
        });

        /* ------- Put GDPR consent code here if you are implementing GDPR ---------- */
        if (ComplianceService.isPrivacyEnabled()) {
            var gdprStatus = ComplianceService.gdpr.getConsent();
            /* eslint-disable camelcase */
            queryObj.gdpr_consent = {
                consent_required: gdprStatus.applies,
                consent_string: gdprStatus.consentString
            };

            var uspStatus = ComplianceService.usp.getConsent();
            queryObj.us_privacy = uspStatus.uspString;
            /* eslint-enable camelcase */
        }

        return {
            url: __baseUrl,
            data: queryObj,
            callbackId: callbackId,

            /* Signals a POST request and the content type */
            networkParamOverrides: {
                method: 'POST',
                contentType: 'text/plain'
            }
        };
    }

    /* -------------------------------------------------------------------------- */

    /* Helpers
     * ---------------------------------- */

    /**
     * This function will render the ad given.
     * @param  {Object} doc The document of the iframe where the ad will go.
     * @param  {string} adm The ad code that came with the original demand.
     */
    function __render(doc, adm) {
        System.documentWrite(doc, adm);
    }

    /**
     * This function will render the pixel given.
     * @param  {string} pixelUrl Tracking pixel img url.
     */
    function __renderPixel(pixelUrl) {
        if (pixelUrl) {
            Network.img({
                url: decodeURIComponent(pixelUrl),
                method: 'GET'
            });
        }
    }

    /* Parse adResponse, put demand into outParcels.
     */
    function __parseResponse(sessionId, adResponse, returnParcels) {
        //? if (DEBUG){
        var results = Inspector.validate({
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    htSlot: {
                        type: 'object'
                    },
                    xSlotRef: {
                        type: 'object'
                    },
                    xSlotName: {
                        type: 'string',
                        minLength: 1
                    }
                }
            }
        }, returnParcels);
        if (!results.valid) {
            throw Whoopsie('INVALID_ARGUMENT', results.format());
        }
        //? }

        var bids = adResponse.tags;

        for (var j = 0; j < returnParcels.length; j++) {
            var curReturnParcel = returnParcels[j];

            var headerStatsInfo = {};
            var htSlotId = curReturnParcel.htSlot.getId();
            headerStatsInfo[htSlotId] = {};
            headerStatsInfo[htSlotId][curReturnParcel.requestId] = [curReturnParcel.xSlotName];

            var curBid;

            for (var i = 0; i < bids.length; i++) {
                /* ----------- Fill this out to find a matching bid for the current parcel ------------- */
                if (curReturnParcel.xSlotRef.placementId === bids[i].tag_id.toString() && !bids[i].nobid) {
                    curBid = bids[i];
                    bids.splice(i, 1);

                    break;
                }
            }

            /* No matching bid found so its a pass */
            if (!curBid) {
                if (__profile.enabledAnalytics.requestTime) {
                    __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', headerStatsInfo);
                }
                curReturnParcel.pass = true;

                continue;
            }

            /* ---------- Fill the bid variables with data from the bid response here. ------------ */

            /* Using the above variable, curBid, extract various information about the bid and assign it to
             * these local variables */

            // Need to find the curBid.ads[] to read properties
            var curBidData = curBid.ads[0];

            /* The bid price for the given slot */
            var bidPrice = curBidData.cpm;

            /* The size of the given slot */
            var bidSize = [Number(curBidData.rtb.banner.width), Number(curBidData.rtb.banner.height)];

            /* The creative/adm for the given slot that will be rendered if is the winner.
             * Please make sure the URL is decoded and ready to be document.written.
             */
            var bidCreative = curBidData.rtb.banner.content;

            /* The dealId if applicable for this slot. */
            var bidDealId = curBid.deal_id;

            /* Explicitly pass */
            var bidIsPass = bidPrice <= 0;

            /* OPTIONAL: tracking pixel url to be fired AFTER rendering a winning creative.
            * If firing a tracking pixel is not required or the pixel url is part of the adm,
            * leave empty;
            */
            var pixelUrl = curBidData.rtb.trackers[0].impression_urls[0];

            /* --------------------------------------------------------------------------------------- */

            curBid = null;
            if (bidIsPass) {
                //? if (DEBUG) {
                Scribe.info(__profile.partnerId + ' returned pass for { id: ' + adResponse.id + ' }.');
                //? }
                if (__profile.enabledAnalytics.requestTime) {
                    __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', headerStatsInfo);
                }
                curReturnParcel.pass = true;

                continue;
            }

            if (__profile.enabledAnalytics.requestTime) {
                __baseClass._emitStatsEvent(sessionId, 'hs_slot_bid', headerStatsInfo);
            }

            curReturnParcel.size = bidSize;
            curReturnParcel.targetingType = 'slot';
            curReturnParcel.targeting = {};

            var targetingCpm = '';

            //? if (FEATURES.GPT_LINE_ITEMS) {
            targetingCpm = __baseClass._bidTransformers.targeting.apply(bidPrice);
            var sizeKey = Size.arrayToString(curReturnParcel.size);

            if (bidDealId) {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pm] = [sizeKey + '_' + bidDealId];
            }

            curReturnParcel.targeting[__baseClass._configs.targetingKeys.om] = [sizeKey + '_' + targetingCpm];
            curReturnParcel.targeting[__baseClass._configs.targetingKeys.id] = [curReturnParcel.requestId];
            //? }

            //? if (FEATURES.RETURN_CREATIVE) {
            curReturnParcel.adm = bidCreative;

            if (pixelUrl) {
                curReturnParcel.winNotice = __renderPixel.bind(null, pixelUrl);
            }
            //? }

            //? if (FEATURES.RETURN_PRICE) {
            curReturnParcel.price = Number(__baseClass._bidTransformers.price.apply(bidPrice));
            //? }

            var expiry = 0;
            if (__profile.features.demandExpiry.enabled) {
                expiry = __profile.features.demandExpiry.value + System.now();
            }

            var pubKitAdId = RenderService.registerAd({
                sessionId: sessionId,
                partnerId: __profile.partnerId,
                adm: bidCreative,
                requestId: curReturnParcel.requestId,
                size: curReturnParcel.size,
                price: targetingCpm,
                dealId: bidDealId || null,
                timeOfExpiry: expiry,
                auxFn: __renderPixel,
                auxArgs: [pixelUrl]
            });

            //? if (FEATURES.INTERNAL_RENDER) {
            curReturnParcel.targeting.pubKitAdId = pubKitAdId;
            //? }
        }
    }

    /* =====================================
     * Constructors
     * ---------------------------------- */

    (function __constructor() {
        RenderService = SpaceCamp.services.RenderService;
        ComplianceService = SpaceCamp.services.ComplianceService;

        __profile = {
            partnerId: 'AppNexusNetworkHtb',
            namespace: 'AppNexusNetworkHtb',
            statsId: 'APNXNET',
            version: __version,
            targetingType: 'slot',
            enabledAnalytics: {
                requestTime: true
            },
            features: {
                demandExpiry: {
                    enabled: false,
                    value: 0
                },
                rateLimiting: {
                    enabled: false,
                    value: 0
                }
            },
            targetingKeys: {
                id: 'ix_apnxnet_id',
                om: 'ix_apnxnet_om',
                pm: 'ix_apnxnet_dealid'
            },
            bidUnitInCents: 100,
            lineItemType: Constants.LineItemTypes.ID_AND_SIZE,
            callbackType: Partner.CallbackTypes.NONE,
            architecture: Partner.Architectures.SRA,
            requestType: Partner.RequestTypes.AJAX
        };

        //? if (DEBUG) {
        var results = ConfigValidators.partnerBaseConfig(configs) || PartnerSpecificValidator(configs);

        if (results) {
            throw Whoopsie('INVALID_CONFIG', results);
        }
        //? }

        __baseUrl = Browser.getProtocol() + '//ib.adnxs.com/ut/v3/prebid';
        __baseClass = Partner(__profile, configs, null, {
            parseResponse: __parseResponse,
            generateRequestObj: __generateRequestObj
        });
    })();

    /* =====================================
     * Public Interface
     * ---------------------------------- */

    var derivedClass = {
        /* Class Information
         * ---------------------------------- */

        //? if (DEBUG) {
        __type__: 'AppNexusNetworkHtb',
        //? }

        //? if (TEST) {
        __baseClass: __baseClass,
        //? }

        /* Data
         * ---------------------------------- */

        //? if (TEST) {
        __profile: __profile,
        __baseUrl: __baseUrl,
        //? }

        /* Functions
         * ---------------------------------- */

        //? if (TEST) {
        __render: __render,
        __parseResponse: __parseResponse,
        generateRequestObj: __generateRequestObj
        //? }
    };

    return Classify.derive(__baseClass, derivedClass);
}

////////////////////////////////////////////////////////////////////////////////
// Exports /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = AppNexusNetworkHtb;
