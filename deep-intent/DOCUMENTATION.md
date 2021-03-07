# DeepIntent
## General Compatibility
|Feature|  |
|---|---|
| Consent | Y |
| Native Ad Support | N |
| SafeFrame Support | Y |
| PMP Support | N |
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome | Y |
| Edge | Y |
| Firefox | Y |
| Internet Explorer 9 | N |
| Internet Explorer 10 | Y |
| Internet Explorer 11 | Y |
| Safari | Y |
| Mobile Chrome | Y |
| Mobile Safari | Y |
| UC Browser | N |
| Samsung Internet | N |
| Opera | Y |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | DeepIntentHtb |
| Ad Server Responds in (Cents, Dollars, etc) | Dollars |
| Bid Type (Gross / Net) | Net |
| GAM Key (Open Market) | ix_dee_om |
| GAM Key (Private Market) | ix_dee_om |
| Ad Server URLs | https://prebid.deepintent.com/prebid |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Slot |
| Request Architecture (MRA / SRA) | MRA |
 
## Currencies Supported
USD
 
## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
|id|Yes|string|Identifier|
|at|Yes|Integer|Default Value 1 (Hardcoded)|
|imp|Yes|Object|ortb request containing slot and impressions information|
|site|Yes|Object|Contains site page and domain information|
|device|Yes|Object|Contains device data: browser, width & height of device, DONOTTRACK flag and language|
|user|No|Object|Contains user information: userid, buyeruid, yob, gender, keywords, customdata, eids (Unified Id data), gdpr consent string|
|regs|No|Object|Contains information if GDPR status is applicable and ccpa consent|
 
### Example
```javascript
{
  "id": "9LKgIp41",
  "at": 1,
  "imp": [
    {
      "id": "htSlotDesktopAId",
      "tagid": "/43743431/DMDemo",
      "secure": 1,
      "banner": {
        "h": 600,
        "w": 160,
        "pos": 0
      },
      "displaymanager": "di_indexexchange",
      "displaymanagerver": "1.0.0",
      "ext": {}
    },
    {
      "id": "htSlotDesktopAId",
      "tagid": "/43743431/DMDemo1",
      "secure": 1,
      "banner": {
        "h": 90,
        "w": 728,
        "pos": 0
      },
      "displaymanager": "di_indexexchange",
      "displaymanagerver": "1.0.0",
      "ext": {}
    }
  ],
  "site": {
    "page": "http://test.com/test.html",
    "domain": "test.com"
  },
  "device": {
    "ua": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36",
    "js": 1,
    "dnt": 1,
    "h": 900,
    "w": 1440,
    "language": "en-US"
  },
  "user": {
    "id": "di_testuid",
    "buyeruid": "di_testbuyeruid",
    "yob": 2002,
    "gender": "F",
    "ext": {
      "gdpr_consent": ""
    }
  },
  "regs": {
    "ext": {
      "gdpr": 0,
      "is_privacy": "1NYN"
    }
  }
}
```
 
## Bid Response Information
### Bid Example
```javascript
{
  "id": "4E733404-CC2E-48A2-BC83-4DD5F38FE9BB",
  "bidId": "0b08b09f-aaa1-4c14-b1c8-7debb1a7c1cd",
  "seatbid": [
    {
      "seat": "12345",
      "bid": [
        {
          "id": "4E733404-CC2E-48A2-BC83-4DD5F38FE9BB",
          "impid": "htSlotDesktopAId",
          "price": 2,
          "adid": "10001",
          "adm": "<div id=\"default-creative\"><img alt='here is your ad' src=\"https:...\" /></div>",
          "adomain": [
            "test.com"
          ],
          "cid": "16981",
          "crid": "13665",
          "h": 600,
          "w": 160
        },
        {
          "id": "4E733404-CC2E-48A2-BC83-4DD5F38FE9BC",
          "impid": "htSlotDesktopAId",
          "price": 2,
          "adid": "10001",
          "adm": "<div id=\"default-creative\"><img alt='here is your ad' src=\"https:...\" /></div>",
          "adomain": [
            "test.com"
          ],
          "cid": "16981",
          "crid": "13665",
          "h": 250,
          "w": 300
        }
      ]
    }
  ]
}
```
### Pass Example
```javascript 
HTTP status code - 204 No Content
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
|pubId|Yes|string|Publisher ID|
|yob|No|string|Year of Birth|
|gender|No|string|Gender Information|
|version|No|string|version number|
### Example
```javascript
{
  pubId: '10001',
  yob: '1990',
  gender: 'F',
  version: '1.0.0'
}
``` 
