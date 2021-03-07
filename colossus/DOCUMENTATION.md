# Colossus
## General Compatibility
|Feature|  |
|---|---|
| Consent |NO|
| Native Ad Support |YES|
| SafeFrame Support |NO|
| PMP Support |NO|
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome |YES|
| Edge |YES|
| Firefox |YES|
| Internet Explorer 9 |NO|
| Internet Explorer 10 |YES|
| Internet Explorer 11 |YES|
| Safari |YES|
| Mobile Chrome |YES|
| Mobile Safari |YES|
| UC Browser |NO|
| Samsung Internet |YES|
| Opera |YES|
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | ColossusHtb |
| Ad Server Responds in (Cents, Dollars, etc) | |
| Bid Type (Gross / Net) |Net|
| GAM Key (Open Market) |ix_clss_cpm|
| GAM Key (Private Market) |ix_clss_cpm|
| Ad Server URLs |https://colossusssp.com/|
| Slot Mapping Sytle (Size / Multiple Sizes / Slot) |Multiple Sizes|
| Request Architecture (MRA / SRA) |SRA|
 
## Currencies Supported
USD

## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| placements | Yes | []placements{} | Array of each Slot info in request |
| page | Yes | String | Page pathname |
| host | Yes | String | The page hostname |
| secure | Yes | Int | 1 if the page is secure, 0 otherwise |
| deviceHeight | Yes | Int | User device height |
| deviceWidth | Yes | Int | User device width |
| wrapper | Yes | String | wrapper name |
| eids | No | []identityData.SOURCE.data{} | Array of objects containing datafrom liveramp and ttd
 
### Example
```javascript
 {
    "host": "test.com",
    "page": "/page/5/",
    "deviceHeight": 768,
    "deviceWidth": 1366,
    "placements": [
        {
            "placementId": 100,
            "bidId": "_YcTDz0Nh"
        }
    ],
    "secure": 1,
    "wrapper": "index",
    "gdprStatus": {
        "applies": true,
        "consentString": ""
    },
    "privacyEnabled": false
}
```
 
## Bid Response Information
### Bid Example
```javascript
 {
            "width": 300,
            "height": 60,
            "cpm": 0.1,
            "ad": "<script>document.write('')</script>",
            "requestId": "_hK5vIC5I",
            "ttl":120,
            "creativeId": "fsdgsdgd346FSDG4",
            "netRevenue":true,
            "currency":"USD",
            "dealId": "DEAL_JKBKdsd789",
            "mediaType":"banner"
}
```
### Pass Example
```javascript
 
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| placementId | Yes | Number | Collossus placemnt id |
| sizes | Yes | Int[][] | Ad slot sizes |
| traffic | No | String | banner or video (banner by default)
### Example
```javascript
{
    "placementId": 222,
    "sizes": [[728, 90], [300, 250]]
    "traffic": "banner"
}
{
    "placementId": 222,
    "sizes": [[1366, 768]]
    "traffic": "video"
}
```
