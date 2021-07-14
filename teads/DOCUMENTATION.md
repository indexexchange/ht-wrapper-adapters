# Teads
## General Compatibility
|Feature|  |
|---|---|
| Consent | Yes |
| Native Ad Support | Yes |
| SafeFrame Support | Yes |
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome | Yes |
| Edge | Yes |
| Firefox | Yes |
| Internet Explorer 9 | Yes |
| Internet Explorer 10 | Yes |
| Internet Explorer 11 | Yes |
| Safari | Yes |
| Mobile Chrome | Yes |
| Mobile Safari | Yes |
| UC Browser | Yes |
| Samsung Internet | Yes |
| Opera | Yes |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | TeadsHtb |
| Ad Server Responds in (Cents, Dollars, etc) | Dollars |
| Bid Type (Gross / Net) | Net |
| GAM Key (Open Market) | ix_teads_om |
| GAM Key (Private Market) | ix_teads_pm |
| Ad Server URLs | a.teads.tv/hb/index/bid-request |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Multiple Sizes |
| Request Architecture (MRA / SRA / FSRA) | SRA |

## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| deviceWidth | false | Number |  |
| referrer | true | String | page url - Using Browser.getPageUrl() |
| pageReferrer | true | String | document.referrer - Using Browser.getReferrer() |
| networkBandwidth | false | String | Effective bandwidth estimate in megabits per second |
| timeToFirstByte | false | String | Internet connection quality in milliseconds |
| us_privacy | true | String | CCPA consent string |
| hb_version | true | String | version of the adapter |

#### gdpr_iab object

| Key | Required | Type |
|---|---|---|
| status | true | Number |
| consent | true | String |
| apiVersion | true | Number |

#### data object

| Key | Required | Type | Description |
|---|---|---|---|
| sizes | true | An array containing arrays of 2 number elements | ad sizes from the xSlotRef |
| placementId | true | Number | Teads placement ID |
| pageId | true | Number | Teads page ID |
| adUnitCode | true | String | ID of the htSlot |
| requestId | true | String | Request ID from the parcel |
| transactionId | true | String | Unique ID generated for each slot |
| slotElementId | true | String | ID of the slot element that will contain the creative to display |
 
### Example
```javascript
{
  deviceWidth: 123,
  referrer: "pageUrl",
  pageReferrer: "document.referrer",
  networkBandwidth: "window.navigator.connection.downlink",
  timeToFirstByte: "Using navigation-timing api V2 by default (https://www.w3.org/TR/navigation-timing-2/) with fallback on navigation-timing api V1 (https://www.w3.org/TR/navigation-timing/) if the browser is not supporting V2 (computation being HTTP response start - HTTP request start in ms)",
  hb_version: "2.0.0",
  gdpr_iab: {
    consent: "consentString",
    status: 1
  },
  us_privacy: "usPrivacyString",
  data: [ // for each parcel
    {
      sizes: [[300, 250]],
      placementId: 1,
      pageId: 2,
      adUnitCode: "adUnitCode",
      requestId: "requestId",
      transactionId: "transactionId",
      slotElementId: "slotElementId"
    }
  ]
}
```
 
## Bid Response Information
### Bid Example
```javascript
 [  
    responses : [
      {
         cpm: 2,
         width: "300",
         height: "250",
         ad: "<script>script containing the ad</script>",
         requestId: "requestId",
         dealId: "teads_ABC"
      }
    ]
```

### Pass Example
```javascript
{
  responses: []
}
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| placementId | true | String | Teads placement ID value |
| sizes | true | An array containing arrays of 2 number elements | List of ad sizes for this slot |

### Example
```javascript
 {
   "placementId": "15894224",
   "sizes": [[300, 250], [300, 600], [300, 300]]
 }
```
