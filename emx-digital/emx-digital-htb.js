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

var ComplianceService;
var EventsService; // eslint-disable-line no-unused-vars
var RenderService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var PartnerSpecificValidator = require('b-real-time-htb-validator.js');
var Scribe = require('scribe.js');
var Whoopsie = require('whoopsie.js');
//? }

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Partner module template
 *
 * @class
 */
function BRealTimeHtb(configs) {
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
     * Bidding endpoint
     *
     * @private {string}
     */
    var __endpoint = '//hb.emxdgt.com/';

    /* =====================================
     * Functions
     * ---------------------------------- */
    function __getMatchingBid(parcel, bidResponse) {
        if (!bidResponse.hasOwnProperty('seatbid')) {
            return false;
        }
        var emxBids = bidResponse.seatbid;
        for (var i = 0; i < emxBids.length; i++) {
            var bid = emxBids[i].bid[0];

            if (parcel.xSlotName === bid.id) {
                return bid;
            }
        }

        return false;
    }

    /* Utilities
     * ---------------------------------- */

    /**
     * Generates the request URL and query data to the endpoint for the xSlots
     * in the given returnParcels.
     *
     * @param  {object[]} returnParcels
     *
     * @return {object}
     */
    function __generateRequestObj(returnParcels) {
        var timeout = SpaceCamp.globalTimeout || 1500;
        var version = '1.1.0';

        var timestamp = System.now();
        var baseUrl = Browser.getProtocol() + __endpoint + ('?t=' + timeout + '&ts=' + timestamp);
        var networkProtocol = Browser.getProtocol()
            .indexOf('https') > -1 ? 1 : 0;
        var pageUrl = Browser.getPageUrl();
        var pageHost = Browser.getHostname();
        var callbackId = System.generateUniqueId();
        var privacyEnabled = ComplianceService.isPrivacyEnabled();
        var gdprStatus = ComplianceService.gdpr.getConsent();
        var ccpaStatus = ComplianceService.usp && ComplianceService.usp.getConsent();

        /* =============================================================================
         * STEP 2  | Generate Request URL
         * -----------------------------------------------------------------------------
         *
        /* PUT CODE HERE */

        var __emxBids = [];
        var __emxData = {};
        for (var i = 0; i < returnParcels.length; i++) {
            var returnParcel = returnParcels[i];
            var emxBid = {};
            var bidFloor = returnParcel.xSlotRef.bidfloor;

            emxBid.id = returnParcels[i].xSlotName;
            emxBid.tagid = returnParcel.xSlotRef.tagid;
            emxBid.secure = networkProtocol;
            if (bidFloor > 0) {
                emxBid.bidfloor = bidFloor;
            }
            emxBid.banner = {
                format: returnParcel.xSlotRef.sizes.map(function (size) {
                    return {
                        w: size[0],
                        h: size[1]
                    };
                }),
                w: returnParcel.xSlotRef.sizes[0][0],
                h: returnParcel.xSlotRef.sizes[0][1]
            };

            __emxBids.push(emxBid);
        }

        __emxData = {
            id: callbackId,
            imp: __emxBids,
            site: {
                domain: pageHost,
                page: pageUrl,
                ref: Browser.getReferrer()
            },
            ext: {
                ver: version
            }
        };

        if (privacyEnabled) {
            /* eslint-disable camelcase */
            if (gdprStatus.hasOwnProperty('consentString')) {
                __emxData.user = {
                    ext: {
                        consent: gdprStatus.consentString
                    }
                };
            }

            if (gdprStatus.hasOwnProperty('applies')) {
                __emxData.regs = {
                    ext: {
                        gdpr: gdprStatus.applies ? 1 : 0
                    }
                };
            }

            if (ccpaStatus && ccpaStatus.hasOwnProperty('uspString')) {
                __emxData.us_privacy = ccpaStatus.uspString;
            }

            /* eslint-enable camelcase */
        }

        // Passing liveramp uids in the user ext field
        if (returnParcels
            && returnParcels.length
            && returnParcels[0].identityData
            && returnParcels[0].identityData.LiveRampIp
            && returnParcels[0].identityData.LiveRampIp.data) {
            if (__emxData.user && __emxData.user.ext) {
                __emxData.user.ext.eids = returnParcels[0].identityData.LiveRampIp.data;
            } else {
                __emxData.user = {
                    ext: {
                        eids: returnParcels[0].identityData.LiveRampIp.data
                    }
                };
            }
        }

        /* -------------------------------------------------------------------------- */

        return {
            url: baseUrl,
            data: __emxData,
            networkParamOverrides: {
                method: 'POST',
                contentType: 'text/plain'
            }
        };
    }

    /* =============================================================================
     * STEP 5  | Rendering Pixel
     * -----------------------------------------------------------------------------
     *
    */

    /**
     * This function will render the pixel given.
     * @param  {string} pixelUrl Tracking pixel img url.
     */
    function __renderPixel(pixelUrl) {
        if (pixelUrl) {
            Browser.createHiddenIFrame(pixelUrl);
        }
    }

    /**
     * Parses and extracts demand from adResponse according to the adapter and then attaches it
     * to the corresponding bid's returnParcel in the correct format using targeting keys.
     *
     * @param {string} sessionId The sessionId, used for stats and other events.
     *
     * @param {any} adResponse This is the bid response as returned from the bid request, that was either
     * passed to a JSONP callback or simply sent back via AJAX.
     *
     * @param {object[]} returnParcels The array of original parcels, SAME array that was passed to
     * generateRequestObj to signal which slots need demand. In this funciton, the demand needs to be
     * attached to each one of the objects for which the demand was originally requested for.
     */

    function __parseResponse(sessionId, adResponse, returnParcels) {
        for (var j = 0; j < returnParcels.length; j++) {
            var curReturnParcel = returnParcels[j];
            var curBid = null;
            var headerStatsInfo = {};
            var htSlotId = curReturnParcel.htSlot.getId();

            headerStatsInfo[htSlotId] = {};
            headerStatsInfo[htSlotId][curReturnParcel.requestId] = [curReturnParcel.xSlotName];

            curBid = __getMatchingBid(curReturnParcel, adResponse);

            if (!curBid) {
                if (__profile.enabledAnalytics.requestTime) {
                    __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', headerStatsInfo);
                }
                curReturnParcel.pass = true;

                continue;
            }

            /* ---------- Fill the bid variables with data from the bid response here. ------------ */
            var bidPrice = curBid.price;
            var bidSize = [Number(curBid.w), Number(curBid.h)];
            var bidCreative = curBid.adm;
            var bidDealId = curBid.dealid;
            var pixelUrl = Browser.getProtocol() + '//biddr.brealtime.com/check.html?src=ix&cb=' + System.now();
            var bidIsPass = bidPrice <= 0;

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
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pmid] = [sizeKey + '_' + bidDealId];
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pm] = [sizeKey + '_' + targetingCpm];
            } else {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.om] = [sizeKey + '_' + targetingCpm];
            }
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

            var pubKitAdId = RenderService.registerAd({
                sessionId: sessionId,
                partnerId: __profile.partnerId,
                adm: bidCreative,
                requestId: curReturnParcel.requestId,
                size: curReturnParcel.size,
                price: targetingCpm,
                dealId: bidDealId || '',
                timeOfExpiry: __profile.features.demandExpiry.enabled ? __profile.features.demandExpiry.value + System.now() : 0, // eslint-disable-line max-len
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
        EventsService = SpaceCamp.services.EventsService;
        ComplianceService = SpaceCamp.services.ComplianceService;

        /* =============================================================================
         * STEP 1  | Partner Configuration
         * -----------------------------------------------------------------------------
         *
         * Please fill out the below partner profile according to the steps in the README doc.
         */

        /* ---------- Please fill out this partner profile according to your module ------------  */
        __profile = {
            partnerId: 'BRealTimeHtb',
            namespace: 'BRealTimeHtb',
            statsId: 'BRT',
            version: '1.0.0',
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
            bidUnitInCents: 100,
            targetingKeys: {
                id: 'ix_brt_id',
                om: 'ix_brt_cpm',
                pm: 'ix_brt_cpm',
                pmid: 'ix_brt_dealid'
            },
            lineItemType: Constants.LineItemTypes.ID_AND_SIZE,
            callbackType: Partner.CallbackTypes.NONE,
            architecture: Partner.Architectures.SRA,
            requestType: Partner.RequestTypes.AJAX
        };

        /* --------------------------------------------------------------------------------------- */

        //? if (DEBUG) {
        var results = ConfigValidators.partnerBaseConfig(configs) || PartnerSpecificValidator(configs);

        if (results) {
            throw Whoopsie('INVALID_CONFIG', results);
        }
        //? }

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
        __type__: 'BRealTimeHtb',
        //? }

        //? if (TEST) {
        __baseClass: __baseClass,
        //? }

        /* Data
         * ---------------------------------- */

        //? if (TEST) {
        profile: __profile,
        //? }

        /* Functions
         * ---------------------------------- */

        //? if (TEST) {
        parseResponse: __parseResponse,
        generateRequestObj: __generateRequestObj
        //? }
    };

    return Classify.derive(__baseClass, derivedClass);
}

////////////////////////////////////////////////////////////////////////////////
// Exports /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = BRealTimeHtb;
