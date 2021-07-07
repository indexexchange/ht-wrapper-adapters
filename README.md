# Table of Contents
1. [Introduction](#intro)
2. [Initial Setup](#setup)
3. [Adapter Requirements & Guidelines](#requirements)
4. [Adapter Package](#adapterPackage)
    * [Adapter Terminology](#adapterTerminology)
    * [Adapter Files](#adapterFiles)
5. [New Adapter](#newAdapter)
    * [Module Setup](#moduleSetup)
    * [Getting Started](#gettingStarted)
    * [Adapter Module Overview](#overview)
        * [Configuration](#configuration)
        * [Event Model](#eventModel)
        * [Creating an Adapter Module](#creatingAdapterModule)
7. [Utility Libraries](#helpers)
    * [Utils](#utils)
    * [BidRoundingTransformer](#bidRounding)
8. [Linting](#linting)
9. [Debugging](#debugging)
10. [Testing](#testing)
11. [Code Submission Guidelines](#codeSubmissionGuidelines)


# <a name='intro'></a>Introduction

<b>Welcome to the IX Library Adapters repository!</b>

This repository contains all the certified IX Library adapters, as well as the tools to develop and verify your own adapter.
Below you will find the information you will need to complete the certification process and become a part of the IX Library Ecosystem!

There are two branches in this repository:
* `master` - The stable branch where all certified adapters reside.
* `canary` - The branch used for adapters to test their updates or new adapter with publishers before merging to the stable `master` branch.

## New Adapters

New adapters must submit a pull request to the `canary` branch upon meeting all the requirements highlighted in the [Requirements](#requirements) section to test their adapter.  After testing is complete, submit a pull request to the `master` branch. The adapter update will then be merged into the stable `master` branch, making it availabe to all publishers using the IX Library.

## Existing Adapters

When updates are made to an existing adapter, a pull request will need to be made to the `canary` branch, so that any updates can be validated in production in a controlled manner. The adapter update will then be merged into the stable master branch, making it availabe to all publishers using the IX Library.

# <a name='setup'></a>Initial Setup
To obtain all the tools you will need to develop your adapter, follow these steps:
1. Fork and clone the `ix-library-adapters` repository
2. In the root directory of `ix-library-adapters` repository, run `npm install` 

This will install all the dependencies and tools provided by Index Exchange to help with the adapter development process.

# <a name='requirements'></a> Adapter Requirements & Guidelines
In order for your module to be successfully certified, please refer to the following list of requirements and guidelines. Items under required <b><u>must</u></b> be satisfied in order to pass the certification process. Items under guidelines are recommended for an optimal setup and should be followed if possible.

### General

##### Required
* The only targeting keys that can be set are predetermined by Index. The adapter module should not be setting targeting on other keys.
* Must support the following browsers: IE 9+, Edge, Chrome, Safari, and Firefox
* Must run system tests in all supported browsers
* Must not use polyfills

##### Guidelines
* Please use our helper libraries when possible. Refer to our [Utility Libraries](#helpers) documentation below. All of the utility functions in this library are designed to be backwards compatible with supported browsers to ease cross-browser compatibility.

### Bid Request Endpoint

##### Required
* Must provide cache busting parameter. Cache busting is required to prevent network caches.
* Adapter endpoint domain must be consistent. Load balancing should be performed by the endpoint.
* Your endpoint should support HTTPS request. When an IX Library loads on secure pages, all requests need to be HTTPS. If you're unable to provide a secure endpoint, the IX Library will not be able to make requests to your ad servers.

##### Guidelines
* Your module should support a single request architecture which has a capability to combine multiple bids into a single HTTP request.
* Adapter should use AJAX to make bid requests. Please use our [Network](#network) utility library for making network requests, particularly the `Network.ajax` method. This ensures the requests will work with all supported browsers.

### Bid Response

##### Required
* Returned bid must be a <b>net</b> bid.
* Bid passes must be explicit in the response.
* All returned bids shall be in the currency trafficked by the publisher.
* Size must be returned in the response. The sizes must also match the requested size. This size parameter will be validated.
* Encrypted prices must be flagged in the response.

### Pixels & Tracking Beacons

##### Required
* Pixels/beacons must only be dropped when the adapter wins the auction and their ad renders.
* Dropping pixels during auction slows down the execution of auctions and is not allowed by Index Exchange.

### DFP Setup

##### Required
* DFP line items, creatives, and render functions will be set up by the Index Exchange team.
<br><br>

# <a name='adapterPackage'></a>Adapter Package

### <a name='adapterTerminology'></a> Adapter Terminology
Below is a list of the terms we will be using throughout this document to explain the process of building your own adapter:

* `<adapter-name>` - This identifies the adapter package for which a given file belongs to. This is used for the package name itself as well as the files within the package e.g. `"example-company"`
* `<partner-name>` - Each adapter is assigned a `partnerId` which is used by the IX Library framework to internally interact with the adapter. It is defined in the adapter module file in the following format: `ExampleCompanyHtb`


### <a name='adapterFiles'></a> Adapter Files
* `<adapter-name>-htb.js` - This is your adapter module file, by default it contains a template divided into multiple sections which need to be completed.
* `<adapter-name>-htb-validator.js` - This is the validator file for the configuration object that will be passed into your module.
* `<adapter-name>-htb-exports.js` - A file used to ensure that we are able to work with legacy creatives and bid responses which require callback functionality.
* `<adapter-name>-htb-system-tests.js` - This file contains functions that will be called when the system tests are run.

# <a name='newAdapter'></a> New Adapter
<b>Note: If you have an existing adapter that has been migrated to the new repository, skip this step</b><br>

### <a name='moduleSetup'></a> Module Setup

Once you have cloned the repository and obtained all the tools as specified above, you can start setting up your new adapter:

* Depending on which OS you're using, you can create a new base adapter template by running one of the following commands:
    * If you're running OSX or Linux, run `npm run new-adapter "Company Name"`
    * If you're running Windows, run `npm run win-new-adapter "Company Name"`

| Name              | Type      | Required  | Description                                                                                                   | Constraints               |
|----------------   |--------   |---------- |-------------------------------------------------------------------------------------------------------------- |-------------------------  |
| "Company Name"| string    | Yes       | The company name including spaces with quotations around it.  | Alphanumeric characters   |

<br>
* For instance, an adapter for "Example Company" would run the following command on a Linux system:
    * `npm run new-adapter "Example Company"`

## <a name='gettingStarted'></a> Getting Started
1. <b>Complete the `<adapter-name>-htb.js` file</b>
    * `<adapter-name>-htb.js` is where all of your adapter code will live.
    * In order to complete the adapter module correctly, please refer to the [Adapter Module Overview](#overview) and the [Utility Libraries](#helpers) sections.
    * <b>Please refer to the [Adapter Requirements and Guidelines](#requirements) when creating your module. Ensure requirements are met to streamline the review process.</b>
2. <b>Complete the `<adapter-name>-htb-validator.js` file</b>
    * This file is where your adapter-specific configurations will need to be validated.
3. <b>Complete the `<adapter-name>-htb-exports.js` file</b>
    * This file is used to support older adapters with legacy creatives and adapters that execute a callback as a response.
    * If your response executes a callback, you must add the following code to your file:<br>

```javascript
if (__directInterface.Layers.PartnersLayer.Partners.ExampleCompanyHtb) {
        shellInterface.ExampleCompanyHtb = shellInterface.ExampleCompanyHtb || {};
        shellInterface.ExampleCompanyHtb.adResponseCallbacks = __directInterface.Layers.PartnersLayer.Partners.ExampleCompanyHtb.adResponseCallbacks;
}
```
4. <b>Complete the `<adapter-name>-htb-system-tests.js` file</b>
    * This file contains all your adapter's test functions. Follow the process outlined on <a href="https://kb.indexexchange.com/ix_library_partners/build_adapter/write_and_run_the_test_cases.htm">Knowledge Base</a> to write your test cases.
5. <b>Run the system tests and linter</b>
    * Make sure all your test cases are passing by running `npm run debug` on OSX or Linux, or `npm run win-debug` on Windows in your adapter folder and then accessing the system tests page.
    * Ensure that there are no lint errors in your adapter folder by running `npm run lint` on OSX or Linux, or `npm run win-lint` on Windows.
6. <b>Verify adapter through the debugger</b>
    * Test your adapter is working as expected by using the debugger as a test page. This can be done by running `npm run debug` on OSX or Linux, or `npm run win-debug` and accessing the debug page.

## <a name='overview'></a> Adapter Module Overview

### <a name='configuration'></a>Prelude: Configuration & Parcels

The IX Library passes each adapter a configuration object that has been configured based on a publisher's website. This object contains all the configuration information required for the IX Library, including adapter-specific slot mappings, timeouts, and any other adapter-specific configuration.
The adapter-specific slot mappings dictate how ad slots on the page will map to adapter-specific configuration.
There are 2 concepts to be familiar with when understanding how slots on the page are mapped back to adapter-specific configuration. Header Tag Slots, which refers to htSlots and adapter-specific configuration, which refers to xSlots in the codebase.
* htSlots - This is an abstraction of the googletag.slot object.
  * These will need to be mapped to xSlots.
* xSlots - These are also an abstraction for adapter-specific configuration that will be mapped to htSlots.
  * These represent a single adapter-specific configuration.
  * An xSlot is how a adapter can map their ad server specific identifiers (placementIDs, siteIDs, zoneIDs, etc) to the `htSlot` object.
  * It can represent a single or multiple sizes.
  * Multiple xSlots can be mapped to the same htSlot.

Example Adapter Configuration Mapping
```javascript
{
    "partners": {
        "<partner-name>": {
            "enabled": true,
            "configs": {
                "xSlots": {
                    "xSlot1": {
                        "placementID": "123",
                        "sizes": [ [300, 250], [300, 600] ]
                    },
                    "xSlot2": {
                        "placementID": "345",
                        "sizes": [ [300, 250] ]
                    }
                },
                "mapping": {
                    "htSlotID-1": [ "xSlot1" ],
                    "htSlotID-2": [ "xSlot2" ]
                }
            }
        }
    }
}
```

Based on the mapping defined in the adapter config, <i>Parcels</i> will be generated for every xSlot/htSlot pair. Parcels are objects that carry different kinds of information throughout the IX Library. In the context of the adapter, parcels are the input into your adapter. Parcels carry information regarding which slots on the publisher's page need demand. More specifically parcels contain information like xSlot reference, htSlot references, demand (after its been applied by the adapter in parseResponse), etc. Each parcel represents a single combination of an htSlot and an xSlot.

Each parcel is an object in the following form:

```javascript
{
    "partnerId": "<partner-name>",
    "htSlot": {
      "__type__": "HeaderTagSlot"
    },
    "ref": "googletag.Slot",      // reference to the slot on the page, in this example it is a googletag slot
    "xSlotRef": {   // contains the reference to the xSlot object from the partner configuration.
      "placementID": "123",
      "sizes": [ [300, 250], [300, 600] ]
    },
    "xSlotName": "1",
    "requestId": "_fwyvecpA" // generated by the IX Library and is used to map the creative back to a piece of demand.
                            // This will show up as targeting under the id key, and is used by the render function.
}
```

These parcels will be fed into both of the functions that your adapter needs to implement:

1. First `generateRequestObj` will need to craft a bid request for the `parcels` that need demand.

2. Second `parseResponse` will take the same parcels and apply the demand (set specific properties in the parcel objects) that is returned from the bid requests to the same parcels and send them back to the IX Library.

## <a name='eventModel'></a> High Level Event Model

1. The IX Library is loaded on the page.
2. IX Library specific configuration validation is performed.
3. All the adapter modules are instantiated.
    * Adapter-specific configuration validation is performed - checking that all the required fields are provided and that they are in the correct format.
4. An external request for demand is made to the IX Library. This can be via a googletag display or refresh call, or by other methods depending on the IX Library in use.
The IX Library requests demand from the adapter modules for the required slots (provided in the form of parcels).
    * The IX Library calls `generateRequestObj(returnParcels)` for every adapter module.
    * The adapter then crafts and returns a request object based on the parcels (containing slot information) specified.
    * The IX Library then sends out a bid request using the request object.
    * Depending on how the adapter is set up and whether JSONP is supported, a response callback (`adResponseCallback`) is called.
    * The adapter parses the response (`parseResponse`) and attaches the demand to the same returnParcels. It also registers the ad creative with the IX Library's render service.
    * The returnParcels are then sent back to the IX Library.
5. The IX Library applies targeting using the demand from the returnParcels.
6. If the adapter wins the auction in the ad server, their creative code will be returned and executed.
    * The creative code contains a call to the IX Library's render function.
7. The adapter ad is rendered.

### <a name='creatingAdapterModule'></a> Creating an Adapter Module

In this section you will be filling out the <adapter-name>-htb.js, <adapter-name>-htb-exports.js, and the <adapter-name>-htb-validator.js files to create your module.

#### Step 0: Config Validation (`<adapter-name>-htb-validator.js`)
Before you get started on writing the actual code for your module, you need to figure out what your adapter configuration (refer to [Configuration](#configuration)) object will look like. This is crucial because it will determine the input (parcels) to your module's core functions.

Once you have a basic idea of what this will look like, and how you will uniquely identify each slot on your server (via xSlot placementId or other inventory codes) you will need to validate this configuration. This validation will be performed by the IX Library using the `<adapter-name>-htb-validator.js` file.

The `<adapter-name>-htb-validator.js` file contains a single export, a `partnerValidator` function, that takes in the configuration object that will be fed to your module's constructor (refer to [Configuration](#configuration) for an example layout) and validates it via type checks. The type checks are performed using an external library called `schema-inspector`, for which the documentation can be found here https://github.com/Atinux/schema-inspector.

Once you have filled this file out, you can continue actually writing your module!

#### Step 1: Adapter Configuration (`<adapter-name>-htb.js`)
This section involves setting up the general adapter configuration such as name, default pricing strategy as well as the general format of incoming/outgoing bids for the adapter. Please read the following descriptions and update the `__profile` variable if necessary.

* <u>partnerId</u> - This is simply the name of our module, generally if your module is a bidder the name will end with htb.
* <u>namespace</u> - Should be the same as partnerId, it is the namespace that is used internally to store all of variables/functions related to your module, i.e. adResponseCallbacks.
* <u>statsId</u> - A unique identifier used for analytics that will be provided for you.
* <u>version</u> - If this is the first iteration of your module, please leave this field at 2.0.0.
* <u>targetingType</u> - The targeting type of your bidder, the default is slot for slot level targeting but could also be page.
* <u>enabledAnalytics</u> - The analytics that the IX Library will track for the module. requestTime is the only currently supported analytic, which records different times around when bid requests occur.
* <u>features</u> - Extra features that a adapter can support
    * <u>demandExpiry</u> - Setting an expiry time on the demand that adapter returns.
    * <u>rateLimiting</u> - Used for limiting the amount of requests to a given adapter for a given slot on pages that support rate limiting in DFP.
* <u>targetingKeys</u> - Different targeting keys that will be used to record demand for a given parcel.
    * <u>id</u> - This key will be used to trace back the creative that has won in DFP for rendering.
    * <u>om</u> - This key signals the open market bid in CPM.
    * <u>pm</u> - This key signals the private market bid in CPM.
    * <u>pmid</u> - This key signals the private market deal id.
* <u>bidUnitInCents</u> - This tells the IX Library the unit of the bid price returned by your endpoint. The unit is in terms of cents, thus it should be set to 100 if your endpoint returns dollars, 1 if your endpoint returns cents, 0.1 if your endpoint returns tenth of a cent, etc. Note that this value must be an integer power of 10.

The last three properties are critical for the IX Library to understand how to interact with the endpoint:
* callbackType:
    * <u>Partner.CallbackTypes.ID</u> -
        Use this option if your endpoint accepts an arbitrary identifier in requests which will be returned in the matching response. You will need to set this callbackId in the `generateRequestObj` function and retrieve it in the adResponseCallback function. This is the preferred method for matching requests and responses. Pass the following reference into your request object when generating the request object in `generateRequestObj`.
        `SpaceCamp.NAMESPACE + '.' + __profile.namespace + '.adResponseCallback'`. You will need to fill out the `adResponseCallback` function to store the ad response in the `__baseClass._adResponseStore[callbackId]` object, where `callbackId` is the same callbackId that was passed back to the IX Library as part of the object that is returned in `generateRequestObj`. The IX Library will use the `callbackId` to reference to pull your stored ad response from that `adResponseStore` and feed it back to `parseResponse`. You will also need to expose this function inside your exports file, see below exports section for more information.
    * <u>Partner.CallbackTypes.CALLBACK_NAME</u> -
        Use this option if your endpoint has no parameter which can be used as a callback ID. The IX Library will generate a new callback function for each request, and use the function name to tie requests to responses. Similarly to the above ID method, you can reference the generated ad response callback as such: `'window.' + SpaceCamp.NAMESPACE + '.' + __profile.namespace + '.adResponseCallbacks.' + callbackId`, where `callbackId` is the same unique callbackId that is passed back to the IX Library as part of the object that is returned in `generateRequestObj`. Unlike the ID method above, you do not need to fill out the `adResponseCallback` function. The response will simply be passed into the `parseResponse` function.
    * <u>Partner.CallbackTypes.NONE</u> -
        Use this option if your endpoint supports AJAX only and will return a pure JSON response rather than JSONP with a callback function. In this mode your endpoint will not receive any demand requests if the user is using a browser which does not fully support AJAX, such as Internet Explorer 9 or earlier. In this mode,
        you also do NOT need to provide a callback function in `generateRequestObj`.
* architecture:
    * <u>Partner.Architectures.MRA</u> -
        Use this option (Multi-Request Architecture) if your endpoint requires a separate network request for each ad slot. In this mode your endpoint will receive one network request for every xSlot mapping active in the current IX Library demand request.
    * <u>Partner.Architectures.FSRA</u> -
        Use this option (Fully Single-Request Architecture) if your endpoint can handle any number of slots in a single request in any combination, including multiple requests for the same slot. In this mode your endpoint will receive a single network request per IX Library demand request.
    * <u>Partner.Architectures.SRA</u> -
        Use this option (Single-Request Architecture) if your endpoint can handle any number of slots in a single request, but cannot repeat the same xSlot more than once in a given request. e.g., you use a placementId and can receive a request for multiple placementIds at once, but not for the same placementId twice. The IX Library will arrange the mapped xSlots into the minimum possible number of network requests to your endpoint.
* requestType:
    * <u>Partner.RequestTypes.ANY</u> -
        Use any request type when making requests. The IX Library will attempt to make an AJAX request for your bid requests, if XHR is not supported, the IX Library will attempt to make a JSONP request if possible.
    * <u>Partner.RequestTypes.AJAX</u> -
        Use only AJAX for bid requests. Note, if the browser does not support ajax the bid requests will not go out.
    * <u>Partner.RequestTypes.JSONP</u> -
        Use only JSONP for bid requests.

#### Step 2: Generate Request URL (`<adapter-name>-htb.js`)
This step is for crafting a bid request URL given a specific set of parcels.

For this step, you must fill out the `generateRequestObj(returnParcels)` function. This function takes in an array of returnParcels.
These are the parcel objects that contain the different slots for which demand needs to be requested.

The IX Library will ensure that the array contains an appropriate set of parcels to pass into a single network
request for your endpoint based on the value set in __profile.architecture. Note, in the particular case your
architecture is MRA, this array will have length 1.

Using this array of parcels, the adapter must craft a request object that will be used to send out the bid request for these slots. This object must contain the request URL, an object containing query parameters, and a callbackId.

The final returned object should looks something like this:
```javascript
{
    url: 'http://bidserver.com/api/bids' // base request URL for a GET request
    data: { // query string object that will be attached to the base URL
        slots: [
            {
                placementId: 54321,
                sizes: [[300, 250]]
            },{
                placementId: 12345,
                sizes: [[300, 600]]
            },{
                placementId: 654321,
                sizes: [[728, 90]]
            }
        ],
        site: 'http://google.com'
    },
    callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses
}
```

If your endpoint uses POST please add the following `networkParamOverrides` object to your return object:
```javascript
{
    url: 'http://bidserver.com/api/bids' // base request URL for a POST request
    data: { // will be the payload in the POST request
        slots: [
            {
                placementId: 54321,
                sizes: [[300, 250]]
            },{
                placementId: 12345,
                sizes: [[300, 600]]
            },{
                placementId: 654321,
                sizes: [[728, 90]]
            }
        ],
        site: 'http://google.com'
    },
    callbackId: '_23sd2ij4i1' //unique id used for pairing requests and responses,

    /* Signals a POST request and the content type */
    networkParamOverrides: {
        method: 'POST',
        contentType: 'text/plain'
    }
}
```

More information can be found in the comment section of the function itself.

#### Step 3: Response Callback (`<adapter-name>-htb.js`)
Once the request from Step 2 finishes the `adResponseCallback` will be called to store the returned response in a `adResponseStore` object.

If `__profile.callbackType` is set to `CALLBACK_NAME` or `NONE`, the IX Library will handle the callback for you and you can remove this function. If it is set to ID, you must retrieve the callback ID from the network response and store that response in the `_adResponseStore` object keyed by the callback ID.

See the function in the template for details.

#### Step 4: Parsing and Storing Demand (`<adapter-name>-htb.js`)
In this step the adapter must parse the returned demand from the bid response and attach it the returnParcels objects.
The returnParcels array will be one of the same arrays that was passed to `generateRequestObj` earlier.

This step involves first matching the returned bids to the internal returnParcels objects. This can be done via some
identifier that was setup for an xSlot (for example, a placementId) in the adapter configuration and the same id being present in the bid response object.

This function first iterates over all of the returned bids, parsing them and attaching the demand to the returnParcel objects (which will be implicitly passed back to the IX Library). This step also involves registering the creative (if returned) with the render service, which is responsible for storing and rendering that creative if the corresponding demand wins the DFP auction.

In order to complete this step correctly, please fill out the section which includes the matching criteria. This step is necessary to map returnParcel objects to the returned bids correctly. In order to do this, we need to use some common criteria that is present both in the xSlot configuration and in the returned bids (usually placementIds or inventory codes).

Also please fill out each of the variables for each bid, these will be attached to the parcel objects to store the demand:

* bidPrice - The bid price for the given slot
* bidWidth - The width of the given slot
* bidHeight - The height of the given slot
* bidCreative - The creative/adm for the given slot that will be rendered if is the winner. Needs to be decoded and ready for a doc.write.
* bidDealId - The dealId if applicable for this slot.
* bidIsPass - True/false value for if the module returned a pass for this slot.
* pixelUrl - If you require firing a tracking pixel after your creative wins and your tracking pixel is not part of the original adm that is rendered, please provide the decoded URL of the tracking pixel here. This `pixelUrl` variable will then be passed to the `__renderPixel` function, which will then be called by either your module's specific `render` function or a generic rendering function depending on the line item setup.

After filling out these objects, the resulting returnParcel objects should look something like this:

```javascript
{
    "partnerId": "<PARTNERID>",
    "htSlot": {
      "__type__": "HeaderTagSlot"
    },
    "ref": "googletag.Slot",      // reference to the slot on the page, in this example it is a googletag slot
    "xSlotRef": {   // contains the reference to the xSlot object from the partner configuration.
      "placementID": "123",
      "sizes": [ [300, 250], [300, 600] ]
    },
    "xSlotName": "1",
    "requestId": "_fwyvecpA",

    // notice these new fields with demand
    "targetingType": "slot"
    "targeting" : {
        "ix_TBD_id": ["_230l09jd2"],
        "ix_TBD_cpm": ["300x250_2.50"]
    },
    "price": 2.50,
    "size": [300,250],
    "adm": "<script> test creative </script>"
}
```

#### Step 5: Rendering Pixel (`<adapter-name>-htb.js`)
This step is only required if your adapter needs to fire a tracking pixel after your creative renders. The function `__renderPixel` will be called right after we render your winning creative.
It will be called with the parameter `pixelUrl` that needs to be filled out in `__parseResponse`.

#### Step 6: Exports (`<adapter-name>-htb-exports.js`)
In this step, you will be required to fill out the exports file for your module. This file will contain all of the functions that will need to be exposed to outside page if they need to be accessed outside of the IX Library. In the usual case, all you will need to change in this file is your adapter module's name in the included snippet:

```javascript
shellInterface.<partner-name> = { //shell interface is the window variable that is accessible through the window object, currently this will always be shellInterface
    render: SpaceCamp.services.RenderService.renderDfpAd.bind(null, '<partner-name>')
};
```

This snippet, exposes your module's render function to the outside world via the `shellInterface` namespace.

If your module requires using a custom adResponse callback via Partner.CallbackTypes.ID callback type, that callback will need to be exposed here. Which would look something like this:

```javascript
if (__directInterface.Layers.PartnersLayer.Partners.<partner-name>) {
    shellInterface.<partner-name> = shellInterface.<partner-name> || {};
    shellInterface.<partner-name>.adResponseCallback = __directInterface.Layers.PartnersLayer.Partners.<partner-name>.adResponseCallback;
}
```

If your module requires using a custom adResponse callback via Partner.CallbackTypes.NAME callback type, that callback swill need to be exposed here. Which would look something like this:

```javascript
if (__directInterface.Layers.PartnersLayer.Partners.<partner-name>) {
    shellInterface.<partner-name> = shellInterface.<partner-name> || {};
    shellInterface.<partner-name>.adResponseCallbacks = __directInterface.Layers.PartnersLayer.Partners.<partner-name>.adResponseCallbacks;
}
```

# <a name='helpers'></a> Utility Libraries
There are a lot of helper objects available to you in you adapter module.

### Utilities
* `isObject(entity)` - Return true if entity is an object.
* `isArray(obj)` - Return true if obj is an array.
* `isNumber(entity)` - Return true if entity is a number.
* `isString(entity)` - Return true if entity is a string.
* `isBoolean(entity)` - Return true if entity is a boolean.
* `isFunction(entity)` - Return true if entity is a function.
* `isRegex(entity)` - Return true if entity is a regex.
* `isEmpty(entity)`
    * if entity is a string, return true if string is empty.
    * if entity is an object, return true if the object has no properties.
    * if entity is an array, return true if the array is empty.
* `arrayDelete(arr, value)` - Delete given value from an object or array.
* `randomSplice(arr)` - Returns a randomly spliced item from an array.
* `deepCopy(entity)` - Return a deep copy of the entity.
* `mergeObjects(entity1, entity2, ...)` - Takes the first entity and overwrites it with the next entity, returning the final object.
* `mergeArrays(arr1, arr2, ...)` - Merge all of the specified arrays into one and return it.
* `tryCatchWrapper(fn, args, errorMessage, context)` - Wrap the given arguments into a try catch block. Returning a function.
* `isArraySubset(arr1, arr2, matcher)` - Return true if `arr1` is a subset of `arr2`.

### System
* `now()` - Return the number of milliseconds since 1970/01/01.
* `generateUniqueId(len, charSet)` - Creates a unique identifier of the given length using the optionally specified charset:
    * `ALPHANUM`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    * `ALPHA`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    * `ALPHA_UPPER`: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    * `ALPHA_LOWER`: 'abcdefghijklmnopqrstuvwxyz',
    * `NUM`: '0123456789'
* `getTimezoneOffset()` - Returns the timezone offset.
* `documentWrite(doc, data)` - doc.write the data using the specified document `doc`.

### Size
* `arrayToString(arr)` - Returns the string representation of an array in the form of '300x250'.
* `stringToArray(str)` - Return the array rep representation of a string in the form of [300, 250].

### Browser
* `getProtocol(httpValue, httpsValue)` - Return `document.location.protocol` or `httpValue` if `document.location.protocol` is http and `httpsValue` if `document.location.protocol` is https.
* `isLocalStorageSupported()` - Checks if local storage is supported.
* `getViewportWidth()` - Return viewport width.
* `getViewportHeight()` - Return viewport height.
* `isTopFrame()` - Checks to see if the code is being run in the top frame or iframe.
* `getScreenWidth()` - Returns screen.width.
* `getScreenHeight()` - Returns screen.height.
* `getReferrer()` - Return document.referrer.
* `getPageUrl()` - Return the page's URL.
* `getHostname()` - Return the page's hostname.
* `getNearestEntity(entityName)` - Returns the entity with `entityName` in the nearest `window` scope.
* `createHiddenIFrame(srcUrl, scope)` - Generate a hidden iframe and then append it to the body. Use the `srcUrl` and `scope` if provided.

### <a name='deviceTypeChecker'></a> DeviceTypeChecker
* `getDeviceType()` - Returns the device type.

### <a name='bidRounding'></a> BidRoundingTransformer
* `apply(rawBid)` - Transform rawBid into the configured format. This includes, rounding/flooring according to the configuration that was used to instantiate the library. The bidTransformConfig is an object of the format:
    * `floor` - Minimum acceptable bid price.
    * `inputCentsMultiplier` - Multiply input bids by this to get cents. This is identical to bidUnitInCents in `__profile`.
    * `outputCentsDivisor` -  Divide output bids in cents by this.
    * `outputPrecision` - Decimal places in output.
    * `roundingType` - Should always be 1.
    * `buckets` - Buckets specifying rounding steps.

Note that bid transformer instances suitable for DFP targeting and price reporting are already provided via `__baseClass._bidTransformers`. It is recommended to use the provided instances as they are sufficient for almost all use cases.

# <a name='linting'></a> Linting
All code must pass the linting before it is submitted for review. Follow the instructions [here](https://kb.indexexchange.com/ix_library_partners/build_adapter/check_your_code_using_ESLint.htm) to run the linter.

# <a name='debugging'></a> Debugging
To walk through your bidder code and debug, follow the instructions [here](https://kb.indexexchange.com/ix_library_partners/build_adapter/test_your_adapter_using_the_debugger.htm).

# <a name='testing'></a> Testing
To implement the system tests, follow the instructions [here](https://kb.indexexchange.com/ix_library_partners/build_adapter/write_and_run_the_test_cases.htm).

# <a name='codeSubmissionGuidelines'></a> Code Submission Guidelines

## Code submission checklist for bidding adapters

Verify that your bidding adapter code meets the following requirements:

* The following files are complete and up-to-date:
   * `<adapter-name>-htb.js`
   * `<adapter-name>-htb-exports.js`
   * `<adapter-name>-htb-validator.js`
   * `<adapter-name>-htb-system-tests.js`
* Your adapter version number is up-to-date.
* Your bidder documentation is up-to-date.
* The CHANGES.md file is up-to-date and formatted correctly:
   * The latest adapter version number must always be at the top.
   * The latest adapter version number must match the version number in your code (and in the pull request you log in GitHub).
   * The file should use the following format:
      `# <ADAPTER VERSION NUMBER>`
         `<update information 1>`
         `<update information 1>`
      `# <PREVIOUS ADAPTER VERSION NUMBER>`
         `<update information 1>`
         `<update information 1>`
* You have [checked your code using ESLint](https://kb.indexexchange.com/ix_library_partners/build_adapter/check_your_code_using_ESLint.htm) and corrected all errors originating from your adapter.
* You have run the debugger tool and test cases, and checked that they all pass in the browsers listed in the bidder documentation in your GitHub repository.

## Code submission checklist for non bidding adapters

Verify that your non-bidding adapter code meets the following requirements:

* Your code is instantiating correctly when the IX Library loads.
* The correct bid request information is being sent to your server's endpoint.
* Google ad slot targeting is set correctly based on your ad server's bid response information.
