# GumGum
## General Compatibility
|Feature|  |
|---|---|
| Consent | Yes |
| Native Ad Support | No |
| SafeFrame Support | No |
| PMP Support | No |
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome | Yes |
| Edge | Yes |
| Firefox | Yes |
| Internet Explorer 9 | No |
| Internet Explorer 10 | No |
| Internet Explorer 11 | No |
| Safari | Yes |
| Mobile Chrome | Yes |
| Mobile Safari | Yes |
| UC Browser | No |
| Samsung Internet | Yes |
| Opera | Yes |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | GumGumHtb |
| Ad Server Responds in (Cents, Dollars, etc) | Cents |
| Bid Type (Gross / Net) | Net |
| GAM Key (Open Market) | ix_gum_cpm |
| GAM Key (Private Market) | |
| Ad Server URLs | http(s)://g2.gumgum.com/hbid/imp |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Multiple Sizes |
| Request Architecture (MRA / SRA) | MRA |

## Currencies Supported
USD
GBP
Euro
Japanese Yen
Australian Dollar
Canadian Dollar
Swiss Franc
Renminbi
New Zealand dollar
Rand
Hong Kong dollar
Indian Rupee
Russian Ruble
Kenyan Shilling
Singapore Dollar
Swedish Krona
Norwegian Krone
 
## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| t | Yes | string | publisher id |
| pi | Yes | number | product id |
| gdprApplies | No | number | shows whether GDPR consent is needed |
| gdprConsent | No | string | the consent string |
| vw | Yes | number | viewport width |
| vh | Yes | number | viewport height |
| sw | Yes | number | screen width |
| sh | Yes | number | screen height |
| pu | Yes | string | page url |
| ce | No | boolean | shows whether local storage is supported |
| dt | No | string | digitrust id |
| dpr | No | number | device pixel ratio |
| ns | No | number | browser network speed |
| jcsi | No | string | implementation id for internal debugging |
| si | No | string | slot id |
| dt | No | string | digitrust id |
| tdid | No | string | tradedesk id |
 
### Example
```javascript
 https://g2.gumgum.com/hbid/imp?si=9&pi=3&gdprApplies=true&gdprConsent=null&vw=1172&vh=1220&sw=2560&sh=1440&pu=http%3A%2F%2Flocalhost%3A8000%2Ftest%2F&ce=true&dpr=1&jcsi=%7B%22t%3A0%2C%22%3A8%7D&ns=4250
```
 
## Bid Response Information
### Bid Example
```javascript
 {
    "bids": [
        {
            "ad": {
                "markup": "<div>test ad</div>"
            },
            "pag": {
                "pvid": 123
            },
            "adhs": {
                "id": 33,
                "adp": {
                    "x": "L",
                    "y": "B"
                },
                "ads": null,
                "adf": {
                    "animated": false,
                    "assetwide": true
                },
                "clc": "<img src=\"https://c.gumgum.com/ads/com/gumgum/close/new/close_dark_3x.png\">",
                "clp": {
                    "top": 0,
                    "right": 0
                },
                "atc": "",
                "atp": {
                    "top": 0,
                    "right": 0
                },
                "acp": null
            },
            "thms": 30000,
            "cw": "<img src=\"https://c.gumgum.com/px.gif\" onload=\"(function(a,b){b.src='https://js.gumgum.com/gumgum.js',a.parentNode.replaceChild(b,a)})(this,document.createElement('script'))\"><gumgum-ad product=\"2\" fromAS='AD_JSON'><\/gumgum-ad>"
        }
    ]
}

```
### Pass Example
```javascript
{
	"bids": [{
        "ad": {}
    }]
}

```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| inScreen | Yes | string | publisher's id |
| inSlot | Yes | Number | publisher's ad unit id |

### Example
```javascript
 {
    "xSlots": {
        "1": {
            "inScreen": "ggumtest",
            "sizes": [
                [300, 100]
            ]
        },
        "2": {
            "inSlot": 9,
            "sizes": [
                [300, 250]
            ]
        }
    }
}

```