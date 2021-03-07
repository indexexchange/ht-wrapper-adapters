# RichAudience
## General Compatibility
|Feature|  |
|---|---|
| Consent | YES |
| Native Ad Support | YES |
| SafeFrame Support | YES |
| PMP Support | |
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome | YES |
| Edge | YES |
| Firefox | YES |
| Internet Explorer 9 |  |
| Internet Explorer 10 |  |
| Internet Explorer 11 |  |
| Safari | YES |
| Mobile Chrome | YES |
| Mobile Safari | YES |
| UC Browser | |
| Samsung Internet | |
| Opera | |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | RichAudienceHtb |
| Ad Server Responds in (Cents, Dollars, etc) | Dollars |
| Bid Type (Gross / Net) | Net |
| GAM Key (Open Market) | ix_ric_om |
| GAM Key (Private Market) | ix_ric_om |
| Ad Server URLs | https://shb.richaudience.com/hb/ |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Multiple Sizes |
| Request Architecture (MRA / SRA) | MRA |
 
## Currencies Supported

| |
|---|
| USD | 

 
## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| currencyCode | True | String | currency used |
| referer | True | String | get referer of the current page |
| adapter | False | String | Identify adapter IndexExchange |
| pid | True | String | The placement ID from Rich Audience |
| sizes | True | Array | contain two parameters that indicate width an height |
| supplyType | True | String | Define if site or app |
| tagId | True | String | name of AdUnit in the page |
| bidder | False | String | Identify bidder |
| bidId | False | String | partner ID |
| bidderRequestId | True | String | Request ID from the space |
| xSlotName | True | String | ID of Slot |
| gdprConsent | True | String | Contains GDPR consent |
| gdpr | True | Boolean | identifies if there is Consent |
 
### Example
```javascript
 {
    "currencyCode":["USD"],
    "referer":"http%3A%2F%2Flocalhost%3A5837%2Fpublic%2Ftester%2Fsystem-tester.html",
    "adapter":"IX",
    "pid":"0wILSPtTKI",
    "sizes":[{"w":728,"h":90}],
    "supplyType":"site",
    "tagId":"AdUnitLeaderBoardDibujos",
    "bidder":"RichAudienceHtb",
    "bidId":"RIC",
    "bidderRequestId":"_8wybFc80",
    "xSlotName":"1",
    "gdprConsent":"",
    "gdpr":false
 }
```
 
## Bid Response Information
### Bid Example
```javascript
 {
    "requestId":"_JvfPjeOF",
    "cpm":99,
    "width":1,
    "height":1,
    "creative_id":83333345,
    "netRevenue":true,
    "ttl":300,
    "dealId":"ramkt",
    "media_type":"banner",
    "adm":"<div id=\"default-creative\"></div>",
    "type":"display",
    "currency":"USD"
 }
```
### Pass Example
```javascript
 {}
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| adUnitName | True | String | name of AdUnit in the page |
| placementId | True | String | The placement ID from Rich Audience |
| supplyType | True | String | Define if site or app |
| sizes | True | Array | contain two parameters that indicate width an height |
### Example
```javascript
 {
         currencyCode: ['USD'],
         xSlots: {
             0: {
                 adUnitName: 'AdUnitMPUDibujos',
                 placementId: 'SIEUTMpbxj',
                 supplyType: 'site',
                 sizes: [[300, 250]]
             },
             1: {
                 adUnitName: 'AdUnitLeaderBoardDibujos',
                 placementId: '0wILSPtTKI',
                 supplyType: 'site',
                 sizes: [[728, 90]]
             }
         }
     }
```
