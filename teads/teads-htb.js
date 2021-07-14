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
var Utilities = require('utilities.js');

var ComplianceService;
var RenderService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var PartnerSpecificValidator = require('teads-htb-validator.js');
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
function TeadsHtb(configs) {
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

    var __gdprStatus = {
        GDPR_APPLIES_PUBLISHER: 12,
        GDPR_DOESNT_APPLY: 0,
        CMP_NOT_FOUND_OR_ERROR: 22
    };

    /* =====================================
     * Functions
     * ---------------------------------- */

    /* Utilities
     * ---------------------------------- */

    function __findGdprStatus(gdprStatus) {
        return gdprStatus.applies ? __gdprStatus.GDPR_APPLIES_PUBLISHER : __gdprStatus.GDPR_DOESNT_APPLY;
    }

    function __getConnectionDownlink(nav) {
        return nav && nav.connection && nav.connection.downlink >= 0 ? nav.connection.downlink.toString() : '';
    }

    function __getTimeToFirstByte(win) {
        var winPerformance = win.performance || win.webkitPerformance || win.msPerformance || win.mozPerformance;

        var ttfbWithTimingV2 = winPerformance
            && typeof winPerformance.getEntriesByType === 'function'
            && Object.prototype.toString.call(winPerformance.getEntriesByType) === '[object Function]'
            && winPerformance.getEntriesByType('navigation')[0]
            && winPerformance.getEntriesByType('navigation')[0].responseStart
            && winPerformance.getEntriesByType('navigation')[0].requestStart
            && winPerformance.getEntriesByType('navigation')[0].responseStart >= 0
            && winPerformance.getEntriesByType('navigation')[0].requestStart >= 0
            && Math.round(
                winPerformance.getEntriesByType('navigation')[0].responseStart
                - winPerformance.getEntriesByType('navigation')[0].requestStart
            );

        if (ttfbWithTimingV2) {
            return ttfbWithTimingV2.toString();
        }

        var ttfbWithTimingV1 = winPerformance
            && winPerformance.timing.responseStart
            && winPerformance.timing.requestStart
            && winPerformance.timing.responseStart >= 0
            && winPerformance.timing.requestStart >= 0
            && winPerformance.timing.responseStart - winPerformance.timing.requestStart;

        return ttfbWithTimingV1 ? ttfbWithTimingV1.toString() : '';
    }

    /**
     * Generates the request URL and query data to the endpoint for the xSlots
     * in the given returnParcels.
     *
     * @param  {object[]} returnParcels
     *
     * @return {object}
     */
    function __generateRequestObj(returnParcels) {
        var payload = {
            data: [],
            deviceWidth: Browser.getScreenWidth(),
            referrer: Browser.getPageUrl(),
            pageReferrer: Browser.getReferrer(),
            networkBandwidth: __getConnectionDownlink(window.navigator),
            timeToFirstByte: __getTimeToFirstByte(window),
            // eslint-disable-next-line camelcase
            hb_version: __profile.version
        };

        returnParcels.forEach(function (parcel) {
            var slot = {
                sizes: parcel.xSlotRef.sizes,
                placementId: parseInt(parcel.xSlotRef.placementId, 10),
                pageId: parseInt(parcel.xSlotRef.pageId, 10),
                adUnitCode: parcel.htSlot.getId(),
                requestId: parcel.requestId,
                transactionId: System.generateUniqueId(),
                slotElementId: parcel.ref.getSlotElementId()
            };

            payload.data.push(slot);
        });

        // ------------------------ Get consent information -------------------------
        if (ComplianceService.isPrivacyEnabled()) {
            var gdprStatus = ComplianceService.gdpr.getConsent();
            var isCmp = !Utilities.isEmpty(gdprStatus);
            // eslint-disable-next-line camelcase
            payload.gdpr_iab = {
                consent: gdprStatus.consentString,
                status: isCmp ? __findGdprStatus(gdprStatus) : __gdprStatus.CMP_NOT_FOUND_OR_ERROR,
                apiVersion: ComplianceService.gdpr.version
            };
            if (ComplianceService.usp) {
                var uspStatus = ComplianceService.usp.getConsent();
                // eslint-disable-next-line camelcase
                payload.us_privacy = uspStatus.uspString;
            }
        }

        return {
            url: 'https://a.teads.tv/hb/index/bid-request',
            data: payload,
            networkParamOverrides: {
                method: 'POST',
                contentType: 'text/plain'
            }
        };
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
        var bids = adResponse.responses;

        for (var j = 0; j < returnParcels.length; j++) {
            var curReturnParcel = returnParcels[j];

            var headerStatsInfo = {};
            var htSlotId = curReturnParcel.htSlot.getId();
            headerStatsInfo[htSlotId] = {};
            headerStatsInfo[htSlotId][curReturnParcel.requestId] = [curReturnParcel.xSlotName];

            var curBid;

            for (var i = 0; i < bids.length; i++) {
                /**
                 * This section maps internal returnParcels and demand returned from the bid request.
                 * In order to match them correctly, they must be matched via some criteria. This
                 * is usually some sort of placements or inventory codes. Please replace the someCriteria
                 * key to a key that represents the placement in the configuration and in the bid responses.
                 */

                if (curReturnParcel.requestId === bids[i].requestId) {
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

            /* The bid price for the given slot */
            var bidPrice = curBid.cpm;

            /* The size of the given slot */
            var bidSize = [Number(curBid.width), Number(curBid.height)];

            /* The creative/adm for the given slot that will be rendered if is the winner.
             * Please make sure the URL is decoded and ready to be document.written.
             */
            var bidCreative = curBid.ad;

            /* Explicitly pass */
            var bidIsPass = bidPrice <= 0;

            var dealId = curBid.dealId;

            /* OPTIONAL: tracking pixel url to be fired AFTER rendering a winning creative.
            * If firing a tracking pixel is not required or the pixel url is part of the adm,
            * leave empty;
            */
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
            curReturnParcel.targeting[__baseClass._configs.targetingKeys.id] = [curReturnParcel.requestId];

            if (dealId) {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pmid] = [sizeKey + '_' + dealId];
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pm] = [sizeKey + '_' + targetingCpm];
            } else {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.om] = [sizeKey + '_' + targetingCpm];
            }
            //? }

            //? if (FEATURES.RETURN_CREATIVE) {
            curReturnParcel.adm = bidCreative;
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
                dealId: null,
                timeOfExpiry: expiry,
                auxArgs: []
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
        ComplianceService = SpaceCamp.services.ComplianceService;
        RenderService = SpaceCamp.services.RenderService;

        __profile = {
            partnerId: 'TeadsHtb',
            namespace: 'TeadsHtb',
            statsId: 'TEADS',
            version: '2.0.1',
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

            /* Targeting keys for demand, should follow format ix_{statsId}_id */
            targetingKeys: {
                id: 'ix_teads_id',
                om: 'ix_teads_om',
                pm: 'ix_teads_pm',
                pmid: 'ix_teads_pmid'
            },

            bidUnitInCents: 100,
            lineItemType: Constants.LineItemTypes.ID_AND_SIZE,
            callbackType: Partner.CallbackTypes.NONE,
            architecture: Partner.Architectures.SRA,
            requestType: Partner.RequestTypes.ANY
        };

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
        __type__: 'TeadsHtb',
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

module.exports = TeadsHtb;
