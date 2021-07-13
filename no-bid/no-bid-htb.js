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

var ComplianceService;
var RenderService;

//? if (DEBUG) {
var ConfigValidators = require('config-validators.js');
var PartnerSpecificValidator = require('no-bid-htb-validator.js');
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
function NoBidHtb(configs) {
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

    window.nobid = {};
    window.nobid.bidResponses = window.nobid.bidResponses || {};
    window.nobid.renderTag = function (doc, id) {
        var bid = window.nobid.bidResponses[String(id)];
        if (bid && bid.adm2) {
            var markup = bid.adm2;
            doc.write(markup);
            doc.close();
        }
    };

    window.nobid.setCookie = function (cname, cvalue, hours) {
        var d = new Date();
        d.setTime(d.getTime() + (hours * 60 * 60 * 1000));
        var expires = 'expires=' + d.toUTCString();
        document.cookie = cname + '=' + cvalue + '; ' + expires + '; path=/;';
    };

    window.nobid.getCookie = function (cname) {
        var nme = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(nme) === 0) {
                return c.substring(nme.length, c.length);
            }
        }

        return false;
    };

    /* =====================================
     * Functions
     * ---------------------------------- */

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
        /* =============================================================================
         * STEP 2  | Generate Request URL
         * -----------------------------------------------------------------------------
         *
         * Generate the URL to request demand from the partner endpoint using the provided
         * returnParcels. The returnParcels is an array of objects each object containing
         * an .xSlotRef which is a reference to the xSlot object from the partner configuration.
         * Use this to retrieve the placements/xSlots you need to request for.
         *
         * If your partner is MRA, returnParcels will be an array of length one. If your
         * partner is SRA, it will contain any number of entities. In any event, the full
         * contents of the array should be able to fit into a single request and the
         * return value of this function should similarly represent a single request to the
         * endpoint.
         *
         * Return an object containing:
         * queryUrl: the url for the request
         * data: the query object containing a map of the query string paramaters
         *
         * callbackId:
         *
         * arbitrary id to match the request with the response in the callback function. If
         * your endpoint supports passing in an arbitrary ID and returning it as part of the response
         * please use the callbackType: Partner.CallbackTypes.ID and fill out the adResponseCallback.
         * Also please provide this adResponseCallback to your bid request here so that the JSONP
         * response calls it once it has completed.
         *
         * If your endpoint does not support passing in an ID, simply use
         * Partner.CallbackTypes.CALLBACK_NAME and the wrapper will take care of handling request
         * matching by generating unique callbacks for each request using the callbackId.
         *
         * If your endpoint is ajax only, please set the appropriate values in your profile for this,
         * i.e. Partner.CallbackTypes.NONE and Partner.Requesttypes.AJAX. You also do not need to provide
         * a callbackId in this case because there is no callback.
         *
         * The return object should look something like this:
         * {
         *     url: 'http://bidserver.com/api/bids' // base request url for a GET/POST request
         *     data: { // query string object that will be attached to the base url
         *        slots: [
         *             {
         *                 placementId: 54321,
         *                 sizes: [[300, 250]]
         *             },{
         *                 placementId: 12345,
         *                 sizes: [[300, 600]]
         *             },{
         *                 placementId: 654321,
         *                 sizes: [[728, 90]]
         *             }
         *         ],
         *         site: 'http://google.com'
         *     },
         *     callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses
         * }
         */

        /* ---------------------- PUT CODE HERE ------------------------------------ */
        function buildEndpoint() {
            var dev = Browser.getPageUrl()
                .indexOf('nobid-env=dev');
            var host = 'ads.servenobid.com';
            if (dev > 0) {
                host = 'localhost:8282';
            }

            return Browser.getProtocol() + '//' + host + '/adreq?cb=' + Math.floor(Math.random() * 11000);
        }

        function gdprConsent() {
            var ret = {};
            var gdprStatus = ComplianceService.gdpr.getConsent();
            if (gdprStatus) {
                var consentRequired = typeof gdprStatus.applies === 'boolean' ? gdprStatus.applies : false;
                ret = {
                    consentString: gdprStatus.consentString,
                    consentRequired: consentRequired
                };
            }

            return ret;
        }

        var callbackId = System.generateUniqueId();
        var baseUrl = buildEndpoint();

        /* ------------------------ Get consent information -------------------------
         * If you want to implement GDPR consent in your adapter, use the function
         * ComplianceService.gdpr.getConsent() which will return an object.
         *
         * Here is what the values in that object mean:
         *      - applies: the boolean value indicating if the request is subject to
         *      GDPR regulations
         *      - consentString: the consent string developed by GDPR Consent Working
         *      Group under the auspices of IAB Europe
         *
         * The return object should look something like this:
         * {
         *      applies: true,
         *      consentString: "BOQ7WlgOQ7WlgABABwAAABJOACgACAAQABA"
         * }
         *
         * You can also determine whether or not the publisher has enabled privacy
         * features in their wrapper by querying ComplianceService.isPrivacyEnabled().
         *
         * This function will return a boolean, which indicates whether the wrapper's
         * privacy features are on (true) or off (false). If they are off, the values
         * returned from gdpr.getConsent() are safe defaults and no attempt has been
         * made by the wrapper to contact a Consent Management Platform.
         */

        /* A
        var gdprStatus = ComplianceService.gdpr.getConsent();
        var privacyEnabled = ComplianceService.isPrivacyEnabled();
        */

        /* ---------------- Craft bid request using the above returnParcels --------- */
        /* ------- Put GDPR consent code here if you are implementing GDPR ---------- */
        /* -------------------------------------------------------------------------- */
        function timestamp() {
            var date = new Date();
            function zp(val) {
                return val <= 9 ? '0' + val : String(val);
            }
            var d = date.getDate();
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var h = date.getHours();
            var min = date.getMinutes();
            var s = date.getSeconds();

            return String(y) + '-' + zp(m) + '-' + zp(d) + ' ' + zp(h) + ':' + zp(min) + ':' + zp(s);
        }

        function clientDim() {
            var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

            return width + 'x' + height;
        }

        function areSizesSupported(sizes) {
            var supportedSizes = [
                '300x1050',
                '160x600',
                '320x50',
                '120x600',
                '970x250',
                '320x100',
                '728x90',
                '300x50',
                '300x250',
                '300x600',
                '970x66',
                '970x90'
            ];
            if (sizes && Array.isArray(sizes) && sizes.length > 0) {
                for (var i in sizes) {
                    if (Object.prototype.hasOwnProperty.call(sizes, i)) {
                        var size = sizes[i];
                        if (Array.isArray(size) && size.length > 1) {
                            var sz = size[0] + 'x' + size[1];
                            if (supportedSizes.includes(sz)) {
                                return true;
                            }
                        }
                    }
                }
            }

            return false;
        }

        function getAdUnits(ixparcels) {
            if (ixparcels && ixparcels.length > 0) {
                var ret = [];
                for (var i in ixparcels) {
                    if (Object.prototype.hasOwnProperty.call(ixparcels, i)) {
                        var ixparcel = ixparcels[i];
                        var unit = {};
                        if (ixparcel.xSlotRef) {
                            if (configs.siteId) {
                                unit.sid = configs.siteId;
                            }

                            if (configs.placementId) {
                                unit.pid = configs.placementId;
                            }

                            // Make sure that sizes are supported
                            if (ixparcel.xSlotRef.sizes && !areSizesSupported(ixparcel.xSlotRef.sizes)) {
                                continue;
                            }

                            if (ixparcel.xSlotName) {
                                unit.d = ixparcel.xSlotName;
                                unit.z = ixparcel.xSlotRef.sizes;
                            }
                            ret.push(unit);
                        }
                    }
                }

                return ret;
            }

            return null;
        }

        var ublock = window.nobid.getCookie('_ublock');
        if (ublock) {
            console.log('Request blocked for user. hours: ', ublock); // eslint-disable-line

            return false;
        }

        var state = {};
        var adunits = getAdUnits(returnParcels);
        if (!adunits || adunits.length <= 0 || !adunits[0].sid) {
            return {};
        }
        state.sid = adunits[0].sid;
        state.l = encodeURIComponent(Browser.getPageUrl());
        state.t = timestamp();
        state.tz = Math.round(new Date()
            .getTimezoneOffset());
        state.r = clientDim();
        state.lang = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;
        state.ref = Browser.getReferrer();
        state.gdpr = gdprConsent();
        state.a = adunits;
        var ixQueryObj = {
            url: baseUrl,
            data: state,
            callbackId: callbackId,
            networkParamOverrides: { method: 'POST' }
        };

        return ixQueryObj;
    }

    /* =============================================================================
     * STEP 3  | Response callback
     * -----------------------------------------------------------------------------
     *
     * This generator is only necessary if the partner's endpoint has the ability
     * to return an arbitrary ID that is sent to it. It should retrieve that ID from
     * the response and save the response to adResponseStore keyed by that ID.
     *
     * If the endpoint does not have an appropriate field for this, set the profile's
     * callback type to CallbackTypes.CALLBACK_NAME and omit this function.
     */
    function adResponseCallback(adResponse) {
        /* Get callbackId from adResponse here */
        var callbackId = 0;
        __baseClass._adResponseStore[callbackId] = adResponse;
    }

    /* -------------------------------------------------------------------------- */

    /* Helpers
     * ---------------------------------- */

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
        if (pixelUrl && pixelUrl.length > 0) {
            for (var i = 0; i < pixelUrl.length; i++) {
                Network.img({
                    url: decodeURIComponent(pixelUrl[i]),
                    method: 'GET'
                });
            }
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
        /* =============================================================================
        * STEP 4  | Parse & store demand response
        * -----------------------------------------------------------------------------
        *
        * Fill the below variables with information about the bid from the partner, using
        * the adResponse variable that contains your module adResponse.
        */

        /* This an array of all the bids in your response that will be iterated over below. Each of
        * these will be mapped back to a returnParcel object using some criteria explained below.
        * The following variables will also be parsed and attached to that returnParcel object as
        * returned demand.
        *
        * Use the adResponse variable to extract your bid information and insert it into the
        * bids array. Each element in the bids array should represent a single bid and should
        * match up to a single element from the returnParcel array.
        *
        */

        /* ---------- Process adResponse and extract the bids into the bids array ------------ */

        function setUserBlock(response) {
            if (response && typeof response.ublock !== 'undefined') {
                window.nobid.setCookie('_ublock', '1', response.ublock);
            }
        }

        var bids;
        var pixels = [];
        if (adResponse && adResponse.bids) {
            bids = adResponse.bids;
            pixels = adResponse.syncs;
            setUserBlock(adResponse);
        }

        /* --------------------------------------------------------------------------------- */

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

                /* ----------- Fill this out to find a matching bid for the current parcel ------------- */
                if (curReturnParcel.xSlotName === bids[i].divid) {
                    curBid = bids[i];

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

            /* The bid price for the given slot */
            var bidPrice = Number(curBid.price);

            /* The size of the given slot */
            var bidSize = [Number(curBid.size.w), Number(curBid.size.h)];

            /* The creative/adm for the given slot that will be rendered if is the winner.
             * Please make sure the URL is decoded and ready to be document.written.
             */
            var bidCreative = curBid.adm;

            /* The dealId if applicable for this slot. */
            var bidDealId = curBid.dealid || '';

            /* Explicitly pass */
            var bidIsPass = bidPrice <= 0;

            /* OPTIONAL: tracking pixel url to be fired AFTER rendering a winning creative.
            * If firing a tracking pixel is not required or the pixel url is part of the adm,
            * leave empty;
            */
            var pixelUrl = pixels;

            /* --------------------------------------------------------------------------------------- */

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

            var expiry = 0;
            if (__profile.features.demandExpiry.enabled) {
                expiry = __profile.features.demandExpiry.value + System.now();
            }

            window.nobid.bidResponses[String(curBid.id)] = curBid;
            var obj = {
                sessionId: sessionId,
                partnerId: __profile.partnerId,
                adm: bidCreative,
                requestId: curReturnParcel.requestId,
                size: curReturnParcel.size,
                price: targetingCpm,
                dealId: bidDealId || '',
                timeOfExpiry: expiry,
                auxFn: __renderPixel,
                auxArgs: [pixelUrl]
            };

            var pubKitAdId = RenderService.registerAd(obj);

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

        /* =============================================================================
         * STEP 1  | Partner Configuration
         * -----------------------------------------------------------------------------
         *
         * Please fill out the below partner profile according to the steps in the README doc.
         */

        /* ---------- Please fill out this partner profile according to your module ------------ */
        __profile = {
            partnerId: 'NoBidHtb',
            namespace: 'NoBidHtb',
            statsId: 'NOB',
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

            /* Targeting keys for demand, should follow format ix_{statsId}_id */
            targetingKeys: {
                id: 'ix_nob_id',
                om: 'ix_nob_om',
                pm: 'ix_nob_pm',
                pmid: 'ix_nob_dealid'
            },

            /* The bid price unit (in cents) the endpoint returns, please refer to the readme for details */
            bidUnitInCents: 100,
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
            generateRequestObj: __generateRequestObj,
            adResponseCallback: adResponseCallback
        });
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

module.exports = NoBidHtb;
