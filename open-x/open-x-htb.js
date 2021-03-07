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
var Network = require('network.js');
var Partner = require('partner.js');
var Size = require('size.js');
var SpaceCamp = require('space-camp.js');
var System = require('system.js');
var Utilities = require('utilities.js');
var Whoopsie = require('whoopsie.js');

var EventsService;
var RenderService;
var ComplianceService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var PartnerSpecificValidator = require('open-x-htb-validator.js');
var Scribe = require('scribe.js');
//? }

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Partner module template
 *
 * @class
 */
function OpenXHtb(configs) {
    if (!Network.isXhrSupported()) {
        //? if (DEBUG) {
        Scribe.warn('Partner OpenXHtb requires AJAX support. Aborting instantiation.');
        //? }

        return null;
    }

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

    var __baseAdRequestUrl;
    var __baseBeaconUrl;

    /* =====================================
     * Functions
     * ---------------------------------- */

    /* Utilities
     * ---------------------------------- */

    function __fireBeacon(sessionId, data) {
        var networkParams = {
            url: __baseBeaconUrl,
            data: data,
            method: 'GET',
            sessionId: sessionId,
            //? if (DEBUG) {
            initiatorId: __profile.partnerId
            //? }
        };

        if (Network.isXhrSupported()) {
            Network.ajax(networkParams);
        } else {
            Network.img(networkParams);
        }
    }

    function _getIDWithRTI(identity, identityName, expectedRtiPartner) {
        if (!identity) {
            return null;
        }

        if (!identity[identityName]) {
            return null;
        }
        var id = null;
        var uids = identity[identityName].data && identity[identityName].data.uids;
        if (Utilities.isArray(uids)) {
            for (var j = 0; j < uids.length; j++) {
                if (uids[j].ext && uids[j].ext.rtiPartner === expectedRtiPartner) {
                    id = uids[j].id;

                    break;
                }
            }
        }

        return id;
    }

    function _getMerkleId(identity) {
        if (!identity) {
            return null;
        }

        if (!identity.MerkleIp) {
            return null;
        }
        var merkle = {};
        var uids = identity.MerkleIp.data && identity.MerkleIp.data.uids;
        if (Utilities.isArray(uids)) {
            for (var j = 0; j < uids.length; j++) {
                if (uids[j].ext && uids[j].ext.enc === 0) {
                    merkle.pp = uids[j].id;
                }

                if (uids[j].ext && uids[j].ext.enc === 1) {
                    merkle.pam = uids[j].id;
                }
            }
        }

        return merkle;
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
        var auidString = '';
        var ausString = '';

        /**
       * @typedef {{
       *  applies: boolean,
       *  consentString: string
       *  }}
       */
        var gdprConsent = ComplianceService.gdpr.getConsent();
        var uspConsent = ComplianceService.usp && ComplianceService.usp.getConsent();
        var privacyEnabled = ComplianceService.isPrivacyEnabled();

        for (var i = 0; i < returnParcels.length; i++) {
            auidString += returnParcels[i].xSlotRef.adUnitId.toString() + ',';
            ausString += Size.arrayToString(returnParcels[i].xSlotRef.sizes, ',') + '|';
        }

        auidString = auidString.slice(0, -1);
        ausString = ausString.slice(0, -1);

        var identityData = returnParcels[0] && returnParcels[0].identityData;

        var tradeDeskId = _getIDWithRTI(identityData, 'AdserverOrgIp', 'TDID');
        var liveIntentId = _getIDWithRTI(identityData, 'LiveIntentIp', 'LDID');
        var liveRampId = _getIDWithRTI(identityData, 'LiveRampIp', 'idl');
        var merkleId = _getMerkleId(identityData);

        var queryObj = {
            auid: auidString,
            aus: ausString,
            ju: Browser.getPageUrl(),
            jr: Browser.getReferrer(),
            ch: configs.charset,
            tz: System.getTimezoneOffset(),
            bc: 'hb_ix_' + __profile.version,
            be: 1,
            res: Size.arrayToString([[Browser.getScreenWidth(), Browser.getScreenHeight()]]),
            tws: Size.arrayToString([[Browser.getViewportWidth(), Browser.getViewportHeight()]]),
            ifr: Browser.isTopFrame() ? 0 : 1,
            cache: System.now()
        };

        if (liveIntentId) {
            queryObj.lipbid = liveIntentId;
        }

        if (liveRampId) {
            queryObj.lre = liveRampId;
        }

        if (merkleId && merkleId.pam) {
            queryObj.merkidpam = merkleId.pam;
        }

        if (merkleId && merkleId.pp) {
            queryObj.merkidpp = merkleId.pp;
        }

        if (tradeDeskId) {
            queryObj.ttduuid = tradeDeskId;
        }

        if (privacyEnabled) {
            if (gdprConsent.consentString !== void(0)) { // eslint-disable-line
                queryObj.gdpr_consent = gdprConsent.consentString; // eslint-disable-line
            }

            if (gdprConsent.applies !== void(0)) { // eslint-disable-line
                queryObj.gdpr = gdprConsent.applies ? '1' : '0';
            }

            if (uspConsent) {
                queryObj.us_privacy = uspConsent.uspString; // eslint-disable-line
            }
        }

        return {
            url: __baseAdRequestUrl,
            data: queryObj,
            callbackId: System.generateUniqueId()
        };
    }

    /* Helpers
     * ---------------------------------- */

    /* Parses and extracts demand from adResponse according to the adapter and then attaches it
     * to the corresponding bid's returnParcel in the correct format using targeting keys.
     */
    function __parseResponse(sessionId, //eslint-disable-line
        adResponse, returnParcels, outstandingXSlotNames, startTime, endTime, timedOut) { //eslint-disable-line
        var unusedReturnParcels = returnParcels.slice();

        /**
       * @typedef {{
       *  applies: boolean,
       *  consentString: string
       *  }}
       */

        var gdprConsent = ComplianceService.gdpr.getConsent();
        var gdprPrivacyEnabled = ComplianceService.isPrivacyEnabled();

        var ads = adResponse.ads;

        if (!ads || !ads.ad || !Utilities.isArray(ads.ad)) {
            EventsService.emit('internal_error', __profile.partnerId + ' invalid ad response');

            if (__profile.enabledAnalytics.requestTime && !timedOut) {
                __baseClass._emitStatsEvent(sessionId, 'hs_slot_error', outstandingXSlotNames);
            }

            return;
        }

        if (ads.pixels) {
            if (gdprPrivacyEnabled) {
                if (gdprConsent.consentString !== void(0)) { //eslint-disable-line
                    ads.pixels += '&gdpr_consent=' + gdprConsent.consentString;
                }

                if (gdprConsent.applies !== void(0)) { //eslint-disable-line
                    ads.pixels += '&gdpr=' + (gdprConsent.applies ? '1' : '0');
                }
            }

            Browser.createHiddenIFrame(ads.pixels);
        }

        var bids = ads.ad;

        for (var i = 0; i < bids.length; i++) {
            var curBid = bids[i];
            var curReturnParcel;

            /* AdUnitId are strings in the configuration, but the openX endpoint return them as numbers */
            bids[i].adunitid = String(bids[i].adunitid);

            for (var j = unusedReturnParcels.length - 1; j >= 0; j--) {
                if (unusedReturnParcels[j].xSlotRef.adUnitId === bids[i].adunitid) {
                    curReturnParcel = unusedReturnParcels[j];
                    unusedReturnParcels.splice(j, 1);

                    break;
                }
            }

            if (!curReturnParcel) {
                continue;
            }

            var curHtSlotId = curReturnParcel.htSlot.getId();

            var beaconData = {};

            if (curBid.ts) {
                beaconData.ts = curBid.ts;
            }

            beaconData.bt = configs.timeout || 0;
            beaconData.bd = endTime - startTime;
            beaconData.br = timedOut ? 't' : 'p';
            beaconData.bs = Browser.getHostname();

            if (!curBid.pub_rev || !curBid.html || !curBid.creative || !curBid.creative.length) {
                EventsService.emit('internal_error', __profile.partnerId + ' invalid ad response');

                if (__profile.enabledAnalytics.requestTime && !timedOut) {
                    EventsService.emit('hs_slot_error', {
                        sessionId: sessionId,
                        statsId: __profile.statsId,
                        htSlotId: curHtSlotId,
                        requestId: curReturnParcel.requestId,
                        xSlotNames: [curReturnParcel.xSlotName]
                    });

                    if (outstandingXSlotNames[curHtSlotId]
                        && outstandingXSlotNames[curHtSlotId][curReturnParcel.requestId]) {
                        Utilities.arrayDelete(outstandingXSlotNames[curHtSlotId][curReturnParcel.requestId],
                            curReturnParcel.xSlotName);
                    }
                }

                continue;
            }

            var bidPrice = curBid.pub_rev;

            beaconData.bp = bidPrice;

            __fireBeacon(sessionId, beaconData);

            if (timedOut) {
                continue;
            }

            var bidWidth = Number(curBid.creative[0].width);
            var bidHeight = Number(curBid.creative[0].height);
            var bidCreative = curBid.html;
            var bidDealId = curBid.deal_id ? String(curBid.deal_id) : '';

            if (bidPrice <= 0 && bidDealId === '') {
                //? if (DEBUG) {
                Scribe.info(__profile.partnerId + ' returned pass for { id: ' + adResponse.id + ' }.');
                //? }

                curReturnParcel.pass = true;

                continue;
            }

            if (__profile.enabledAnalytics.requestTime) {
                EventsService.emit('hs_slot_bid', {
                    sessionId: sessionId,
                    statsId: __profile.statsId,
                    htSlotId: curHtSlotId,
                    requestId: curReturnParcel.requestId,
                    xSlotNames: [curReturnParcel.xSlotName]
                });

                if (outstandingXSlotNames[curHtSlotId]
                    && outstandingXSlotNames[curHtSlotId][curReturnParcel.requestId]) {
                    Utilities.arrayDelete(outstandingXSlotNames[curHtSlotId][curReturnParcel.requestId],
                        curReturnParcel.xSlotName);
                }
            }

            curReturnParcel.size = [bidWidth, bidHeight];
            curReturnParcel.targetingType = 'slot';
            curReturnParcel.targeting = {};

            var targetingCpm = '';

            //? if (FEATURES.GPT_LINE_ITEMS) {
            targetingCpm = __baseClass._bidTransformers.targeting.apply(bidPrice);
            var sizeKey = Size.arrayToString(curReturnParcel.size);

            if (bidDealId !== '') {
                curReturnParcel.targeting[__baseClass._configs.targetingKeys.pm] = [sizeKey + '_' + bidDealId];
            }

            curReturnParcel.targeting[__baseClass._configs.targetingKeys.om] = [sizeKey + '_' + targetingCpm];
            curReturnParcel.targeting[__baseClass._configs.targetingKeys.id] = [curReturnParcel.requestId];

            //? }

            //? if (FEATURES.RETURN_CREATIVE) {
            curReturnParcel.adm = bidCreative;
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
                dealId: bidDealId,
                timeOfExpiry:
                    __profile.features.demandExpiry.enabled ? __profile.features.demandExpiry.value + System.now() : 0
            });

            //? if (FEATURES.INTERNAL_RENDER) {
            curReturnParcel.targeting.pubKitAdId = pubKitAdId;
            //? }
        }

        /* Any requests that didn't get a response above are passes */
        if (__profile.enabledAnalytics.requestTime && !timedOut) {
            __baseClass._emitStatsEvent(sessionId, 'hs_slot_pass', outstandingXSlotNames);
        }
    }

    /* =====================================
     * Constructors
     * ---------------------------------- */

    (function __constructor() {
        EventsService = SpaceCamp.services.EventsService;
        RenderService = SpaceCamp.services.RenderService;
        ComplianceService = SpaceCamp.services.ComplianceService;

        __profile = {
            partnerId: 'OpenXHtb',
            namespace: 'OpenXHtb',
            statsId: 'OPNX',
            version: '2.1.4',
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
                id: 'ix_ox_id',
                om: 'ix_ox_om',
                pm: 'ix_ox_pm'
            },
            bidUnitInCents: 0.1,
            lineItemType: Constants.LineItemTypes.ID_AND_SIZE,
            callbackType: Partner.CallbackTypes.NONE,
            architecture: Partner.Architectures.SRA,
            requestType: Partner.RequestTypes.AJAX,
            parseAfterTimeout: true
        };

        //? if (DEBUG) {
        var results = ConfigValidators.partnerBaseConfig(configs) || PartnerSpecificValidator(configs);

        if (results) {
            throw Whoopsie('INVALID_CONFIG', results);
        }
        //? }

        configs.medium = configs.medium || 'w';
        configs.version = configs.version || '1.0';
        configs.endPointName = configs.endPointName || 'arj';
        configs.charset = configs.charset || 'UTF-8';
        configs.bidderCode = configs.bidderCode || 'hb_ix';

        __baseAdRequestUrl = Network.buildUrl('https://' + configs.host, [
            configs.medium,
            configs.version,
            configs.endPointName
        ]);
        __baseBeaconUrl = Network.buildUrl('https://' + configs.host, [
            configs.medium,
            configs.version,
            'bo'
        ]);

        __baseClass = Partner(__profile, configs, null, {
            parseResponse: __parseResponse,
            generateRequestObj: __generateRequestObj
        });

        /* If wrapper is already active, we might be instantiated late so need to add our callback
           since the shell potentially missed its chance */
        if (window[SpaceCamp.NAMESPACE]) {
            window[SpaceCamp.NAMESPACE][__profile.namespace] = window[SpaceCamp.NAMESPACE][__profile.namespace] || {};
            window[SpaceCamp.NAMESPACE][__profile.namespace].adResponseCallbacks
                = __baseClass.getDirectInterface()[__profile.namespace].adResponseCallbacks;
            window[SpaceCamp.NAMESPACE][__profile.namespace].version
                = __profile.version;
        }
    })();

    /* =====================================
     * Public Interface
     * ---------------------------------- */

    var derivedClass = {
        /* Class Information
         * ---------------------------------- */

        //? if (DEBUG) {
        __type__: 'OpenXHtb',
        //? }

        //? if (TEST) {
        __baseClass: __baseClass,
        //? }

        /* Data
         * ---------------------------------- */

        //? if (TEST) {
        __profile: __profile,
        //? }

        /* Functions
         * ---------------------------------- */

        //? if (TEST) {
        __parseResponse: __parseResponse
        //? }
    };

    return Classify.derive(__baseClass, derivedClass);
}

////////////////////////////////////////////////////////////////////////////////
// Exports /////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

module.exports = OpenXHtb;
