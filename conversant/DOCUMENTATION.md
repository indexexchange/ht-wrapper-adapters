# conversant
## General Compatibility
|Feature|  |
|---|---|
| Consent | Yes |
| Native Ad Support | No |
| SafeFrame Support | Yes |
| PMP Support | No |
 
## Browser Compatibility
| Browser |  |
|--- |---|
| Chrome | Yes |
| Edge | Yes |
| Firefox | Yes |
| Internet Explorer 9 |  |
| Internet Explorer 10 | Yes |
| Internet Explorer 11 | Yes |
| Safari | Yes |
| Mobile Chrome | Yes |
| Mobile Safari | Yes |
| UC Browser | |
| Samsung Internet | Yes |
| Opera | Yes |
 
## Adapter Information
| Info | |
|---|---|
| Partner Id | ConversantHtb |
| Ad Server Responds in (Cents, Dollars, etc) | Dollars |
| Bid Type (Gross / Net) | Net |
| GAM Key (Open Market) | ix_conv_cpm |
| GAM Key (Private Market) | ix_conv_cpm |
| Ad Server URLs | web.hb.ad.cpe.dotomi.com |
| Slot Mapping Style (Size / Multiple Sizes / Slot) | Slot |
| Request Architecture (MRA / SRA) | SRA |
 
## Currencies Supported
 USD
## Bid Request Information
### Parameters
| Key | Required | Type | Description |
|---|---|---|---|
| | | | |
 
### Example
```
https://web.hb.ad.cpe.dotomi.com/s2s/header/24?cb=23452345
```
```javascript
{
    "id":"D1Q4XVZQ",
    "imp":[{
        "id":"_lquFfROt",
        "secure":1,
        "displaymanager":"40834-index-client",
        "displaymanagerver":"2.2.0",
        "tagid":"mytag",
        "banner":{
            "format":[{"w":300,"h":250}]}
        }],
    "site":{
        "id":"123456",
        "mobile":0,
        "page":"https://www.example.com/page.html"
    },
    "device":{
        "h":640,
        "w":360,
        "dnt":0,
        "language":"en",
        "make":"Google Inc.",
        "ua":"Mozilla/5.0 (Linux; Android 7.0; SM-G935V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36"
    },
    "at":1
} 
```
 
## Bid Response Information
### Bid Example
```javascript
{
    "id":"123456",
    "bidid":"eab3d908-b7d2-4e8a-b359-58b567bb570f",
    "cur":"USD",
    "seatbid":[{
        "bid":[{
            "id":"_lquFfROt",
            "impid":"_lquFfROt",
            "price":0.1000,
            "adm": "<div>AD MARKUP</div>",
            "adomain":["mydomain.com"],
            "iurl":"pixelurl",
            "cid":"012345",
            "crid":"543123",
            "cat":["IAB18","IAB18-5","IAB18-3","IAB18-1"],
            "w":300,
            "h":250
        }]
    }]
}
 
 
```
### Pass Example
```javascript
{
	"id": "6Bh7LVT5",
	"bidid": "70a2de63-4d69-4bcd-ad34-a318b0c33c6a",
	"cur": "USD",
	"seatbid": [{
		"bid": [{
			"id": "_8Tsu7FvU",
			"impid": "_8Tsu7FvU",
			"price": 0.0000
		}]
	}]
} 
```
 
## Configuration Information
### Configuration Keys
| Key | Required | Type | Description |
|---|---|---|---|
| siteId | Yes | String | Conversant site id |
| sizes | Yes | Array of 2 element arrays | List of ad sizes |
| placementId | No | String | placement id |
| bidfloor | No | Number | Optional bid floor |
| position | No | Number | Ad position on screen |
### Example
```javascript
{
    "siteId": "108060",
    "xSlots": {
        "1": {
            "placementId": "54321",
            "sizes": [
                [300, 250], [180, 150]
            ]
        },
        "2": {
            "placementId": "12345",
            "sizes": [
                [300, 600]
            ],
            "position" : 1
        },
        "3": {
            "placementId": "654321",
            "sizes": [
                [728, 90]
            ],
            "bidfloor": 0.0001
        }
    },
    "mapping": {
        "htSlot1": ["1", "2"],
        "htSlot2": ["3"]
    }
} 
```
