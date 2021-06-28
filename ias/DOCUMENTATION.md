# IAS
## General Compatibility
|Feature|  |
|---|---|
| Consent |  |
| Native Ad Support |  |
| SafeFrame Support |  |
| PMP Support | |
 
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
| Mobile Chrome | No |
| Mobile Safari | No |
| UC Browser | No |
| Samsung Internet | No |
| Opera | No |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | IASHtb |
| Ad Server Responds in (Cents, Dollars, etc) | |
| Bid Type (Gross / Net) | |
| GAM Key (Open Market) | ix_ias_cpm |
| GAM Key (Private Market) | ix_ias_cpm |
| Ad Server URLs | https://pixel.adsafeprotected.com/services/pub |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Slot |
| Request Architecture (MRA / SRA) | FSRA |

## Currencies Supported
 
## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| | | | |
 
### Example
```javascript
 
```
 
## Bid Response Information
### Bid Example
```javascript
{
    "brandSafety": {
        "adt": "veryLow",
        "alc": "veryLow",
        "dlm": "veryLow",
        "drg": "veryLow",
        "hat": "veryLow",
        "off": "veryLow",
        "vio": "veryLow"
    },
    "fr": "false",
    "slots": {
        "htSlotDesktopAId": {
            "id": "fdfcfa8b-d8ac-11e9-82e4-14dda9d4b6a0",
            "vw": ["40", "50"],
            "grm": ["40"]
        }
    }
} 
```
### Pass Example
```javascript
 
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| pubId  | Yes | String | Identifier for the IAS pubId
| sizes  | Yes | Array  | Identifier for the IAS sizes
| adUnitPath  | Yes | String | Identifier for the IAS adUnitPath
| | | | |
### Example
```javascript
{
    "pubId": "99",
    "sizes": [[320, 50]],
    "adUnitPath": "/57514611/news.com"
} 
```

## Test Configuration
(Test configuration or methodology that can be used to retrieve & render a test creative from IAS's platform)
```javascript

```
