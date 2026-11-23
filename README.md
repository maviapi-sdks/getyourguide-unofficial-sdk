# GetYourGuide Unofficial SDK

Unofficial **GetYourGuide API** client for Python, JavaScript/TypeScript, Go, PHP, Ruby, Java and C#. Tour & activity listings from GetYourGuide — prices, ratings, availability dates and destinations, plus per-activity detail and bulk sitemap discovery.

- **4 endpoints**, each returning JSON, with one method per endpoint in every language.
- **Works with no setup.** With no key, a client uses a shared demo key (30 requests a minute and 300 a day per network).
- **Your own key lifts the limit.** [Create a free key](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide): a 7-day trial with 5,000 credits, no card.
- **Kept working.** The API is hosted by [maviapi](https://maviapi.com/apis/getyourguide?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide), which monitors it and repairs it when the website changes.

> This project is not affiliated with, endorsed by or sponsored by GetYourGuide (getyourguide.com). All trademarks belong to their owners.

## Quick start

### Python

```bash
pip install "git+https://github.com/maviapi-sdks/getyourguide-unofficial-sdk#subdirectory=python"
```

```python
from getyourguide_sdk import GetyourguideClient

client = GetyourguideClient()  # or GetyourguideClient("mvk_live_...")
result = client.activities_location(location="venice-l35", limit=5)
print(result)
```

### JavaScript / TypeScript

```bash
npm install github:maviapi-sdks/getyourguide-unofficial-sdk
```

```javascript
import { GetyourguideClient } from "getyourguide-unofficial-sdk";

const client = new GetyourguideClient(); // or new GetyourguideClient({ apiKey: "mvk_live_..." })
const result = await client.activitiesLocation({ location: "venice-l35", limit: 5 });
console.log(result);
```

### Go

```bash
go get github.com/maviapi-sdks/getyourguide-unofficial-sdk
```

```go
package main

import (
	"context"
	"fmt"
	"log"

	getyourguide "github.com/maviapi-sdks/getyourguide-unofficial-sdk"
)

func main() {
	client := getyourguide.New("") // or getyourguide.New("mvk_live_...")
	result, err := client.ActivitiesLocation(context.Background(), getyourguide.Params{"location": "venice-l35", "limit": 5})
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(result))
}
```

### PHP

```bash
composer config repositories.getyourguide-unofficial-sdk vcs https://github.com/maviapi-sdks/getyourguide-unofficial-sdk
composer require maviapi-sdks/getyourguide-unofficial-sdk:dev-main
```

```php
<?php

require 'vendor/autoload.php';

use GetyourguideSdk\GetyourguideClient;

$client = new GetyourguideClient(); // or new GetyourguideClient('mvk_live_...')
$result = $client->activitiesLocation(location: 'venice-l35', limit: 5);
print_r($result);
```

### Ruby

```ruby
# Gemfile
gem "getyourguide_sdk", git: "https://github.com/maviapi-sdks/getyourguide-unofficial-sdk", branch: "main"
```

```ruby
require "getyourguide_sdk"

client = GetyourguideSdk::Client.new # or GetyourguideSdk::Client.new(api_key: "mvk_live_...")
result = client.activities_location(location: "venice-l35", limit: 5)
puts result
```

### Java

```xml
<!-- pom.xml: the JitPack repository, then the dependency -->
<repository>
  <id>jitpack.io</id>
  <url>https://jitpack.io</url>
</repository>

<dependency>
  <groupId>com.github.maviapi-sdks</groupId>
  <artifactId>getyourguide-unofficial-sdk</artifactId>
  <version>main-SNAPSHOT</version>
</dependency>
```

The client is one file with no dependencies, so you can also copy [`GetyourguideClient.java`](java/src/main/java/com/maviapi/getyourguide/GetyourguideClient.java) into your project.

```java
import com.maviapi.getyourguide.GetyourguideClient;
import java.util.Map;

public class Example {
    public static void main(String[] args) {
        GetyourguideClient client = new GetyourguideClient(); // or new GetyourguideClient("mvk_live_...")
        String json = client.activitiesLocation(Map.of("location", "venice-l35", "limit", 5));
        System.out.println(json);
    }
}
```

### C#

```bash
git clone https://github.com/maviapi-sdks/getyourguide-unofficial-sdk
dotnet add reference getyourguide-unofficial-sdk/csharp/GetyourguideSdk.csproj
```

The client is one file with no dependencies, so you can also copy [`GetyourguideClient.cs`](csharp/GetyourguideClient.cs) into your project.

```csharp
using GetyourguideSdk;

var client = new GetyourguideClient(); // or new GetyourguideClient("mvk_live_...")
var result = await client.ActivitiesLocationAsync(new Dictionary<string, object?> { ["location"] = "venice-l35", ["limit"] = 5 });
Console.WriteLine(result);
```

## Endpoints

| Endpoint | What it returns | Credits per call |
|---|---|---|
| [`GET /activities/{location}`](#get-activitieslocation) | Tour & activity listings for a GetYourGuide location slug (e.g. | 25 |
| [`GET /activity/{id}`](#get-activityid) | Full detail for one activity by numeric id (e.g. | 25 |
| [`GET /catalog`](#get-catalog) | Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000 each); each entry has the activity id and location slug. | 1 |
| [`GET /explore`](#get-explore) | Resolve a location's tour/activity listings and optionally enrich the top N with full detail (description, images, reviews) in one call. | 25 |

Try each one in the browser on the [GetYourGuide API page](https://maviapi.com/apis/getyourguide?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide).

## Authentication

A client takes the key you give it. With none, it reads the `MAVIAPI_API_KEY` environment variable, and then uses the shared demo key (30 requests a minute and 300 a day per network). To get your own, [sign up](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide) and create a key on the [keys page](https://maviapi.com/dashboard/keys). A successful request uses the credits its endpoint lists; a failed request is free. Plans are on the [pricing page](https://maviapi.com/pricing?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide).

## Errors

A request the API answers with an error status raises an `ApiError` (in Go, returns an `*Error`) with the HTTP status, a machine-readable code and a message. In Java it carries the status and the response body.

| Status | Code | Meaning |
|---|---|---|
| 400 | `bad_request` | A parameter is missing or cannot be used. |
| 401 | `missing_api_key` | No API key was sent, or the key is invalid or revoked (`missing_api_key`, `invalid_api_key`). |
| 402 | `credit_limit_reached` | The plan's credits for this period are used up. |
| 403 | `account_banned` | The account that owns the key is suspended. |
| 429 | `rate_limited` | Too many requests for this key. Wait the number of seconds in `Retry-After`. |
| 502 | `scrape_failed` | The source site could not be read this time. Retrying later usually works. |

## Endpoint reference

Base URL: `https://api.maviapi.com/v1/sites/getyourguide`. API version 2026-11-20. The same contract is in [`openapi.json`](openapi.json).

### `GET /activities/{location}`

Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each with price, rating, next availability date and destination.

Each successful request uses 25 credits.

Methods: `activities_location` (Python, Ruby) · `activitiesLocation` (JavaScript/TypeScript, PHP, Java) · `ActivitiesLocation` (Go) · `ActivitiesLocationAsync` (C#)

Parameters:

- `location` (string, required, in the path): GetYourGuide place slug in the {city}-l{id} form (from /catalog or an activity URL). Example: `venice-l35`.
- `limit` (integer, optional): Max items per page (default 50, max 200). Example: `50`.
- `offset` (integer, optional): Items to skip for pagination. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "count": 16,
    "activities": [
      {
        "id": "927092",
        "title": "Venice: St. Mark's Basilica, Doge's Palace & Bridge of Sighs",
        "url": "https://www.getyourguide.com/venice-l35/venice-st-mark-s-basilica-doge-s-palace-bridge-of-sighs-t927092/",
        "price": 41.76,
        "currency": "EUR",
        "rating": 4.0319786,
        "rating_count": 4122,
        "available_from": "2026-08-14T09:00:00+02:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/img/tour/....jpg/68.jpg",
        "position": 1
      }
    ]
  },
  "cached": false,
  "source": "https://www.getyourguide.com/venice-l35/",
  "pagination": {
    "total": 16,
    "limit": 50,
    "offset": 0,
    "count": 16,
    "has_more": false
  }
}
```

</details>

### `GET /activity/{id}`

Full detail for one activity by numeric id (e.g. 6851): title, description, images, price, rating, review count and sample reviews.

Each successful request uses 25 credits.

Methods: `activity_id` (Python, Ruby) · `activityId` (JavaScript/TypeScript, PHP, Java) · `ActivityId` (Go) · `ActivityIdAsync` (C#)

Parameters:

- `id` (string, required, in the path): Numeric activity id (the …-t<id> in an activity URL). Example: `6851`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "id": "6851",
    "title": "Venice: Grand Canal Boat Tour",
    "description": "Enjoy a boat tour on the Grand Canal of Venice...",
    "images": [
      null
    ],
    "price": 45,
    "currency": "EUR",
    "rating": 4.176025694659586,
    "review_count": 1100,
    "reviews": [
      {
        "author": "James",
        "rating": 5,
        "title": null,
        "text": "Our guide was brilliant and answered any questions put to her. Well worth it.",
        "date": "2026-08-11T05:28:12+02:00"
      }
    ]
  },
  "cached": false,
  "source": "https://www.getyourguide.com/x-l0/x-t6851/"
}
```

</details>

### `GET /catalog`

Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000 each); each entry has the activity id and location slug.

Methods: `catalog` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Catalog` (Go) · `CatalogAsync` (C#)

Parameters:

- `index` (integer, optional): Which activity sitemap file to read (0-based). Example: `0`.
- `limit` (integer, optional): Max items per page (default 100, max 5000). Example: `100`.
- `offset` (integer, optional): Items to skip for pagination. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "index": 0,
    "count": 100,
    "activities": [
      {
        "id": "4873",
        "url": "https://www.getyourguide.com/geneva-l54/best-of-geneva-guided-city-tour-with-scenic-lake-cruise-t4873/",
        "location": "geneva-l54",
        "location_id": "54"
      }
    ]
  },
  "cached": false,
  "source": "getyourguide:sitemap",
  "pagination": {
    "total": 5000,
    "limit": 50,
    "offset": 0,
    "count": 16,
    "has_more": false
  }
}
```

</details>

### `GET /explore`

Resolve a location's tour/activity listings and optionally enrich the top N with full detail (description, images, reviews) in one call.

Each successful request uses 25 credits.

Methods: `explore` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Explore` (Go) · `ExploreAsync` (C#)

Parameters:

- `location` (string, required): GetYourGuide place slug, e.g. venice-l35. Example: `venice-l35`.
- `detail` (string, optional): When true, enrich the top `enrich` listings with detail (description, images, reviews). One of: `true`, `false`. Example: `true`.
- `enrich` (integer, optional): How many top listings to enrich when detail=true (1-5). One of: `1`, `2`, `3`, `4`, `5`. Example: `3`.
- `limit` (integer, optional): Max items per page (default 50, max 200). Example: `50`.
- `offset` (integer, optional): Items to skip for pagination. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "detail": true,
    "count": 16,
    "activities": [
      {
        "id": "927092",
        "title": "Venice: St. Mark's Basilica, Doge's Palace & Bridge of Sighs",
        "url": "https://www.getyourguide.com/venice-l35/venice-st-mark-s-basilica-doge-s-palace-bridge-of-sighs-t927092/",
        "price": 41.76,
        "currency": "EUR",
        "rating": 4.0319786,
        "rating_count": 4122,
        "available_from": "2026-08-14T09:00:00+02:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/img/tour/....jpg/68.jpg",
        "position": 1,
        "detail": {
          "description": null,
          "images": [
            null
          ],
          "reviews": [
            {
              "author": "James",
              "rating": 5,
              "title": null,
              "text": "Our guide was brilliant and answered any questions put to her. Well worth it.",
              "date": "2026-08-11T05:28:12+02:00"
            }
          ]
        }
      }
    ]
  },
  "cached": false,
  "source": "getyourguide:combo",
  "pagination": {
    "total": 16,
    "limit": 50,
    "offset": 0,
    "count": 16,
    "has_more": false
  }
}
```

</details>

## More

- [GetYourGuide API page](https://maviapi.com/apis/getyourguide?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide): live examples and the changelog.
- [OpenAPI document](https://api.maviapi.com/v1/apis/getyourguide/openapi.json) and [Postman collection](https://api.maviapi.com/v1/apis/getyourguide/postman.json).
- [maviapi MCP server](https://maviapi.com/docs#mcp): the same API as tools for Claude, Cursor and other AI agents.
- [All maviapi APIs](https://maviapi.com/apis?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide). Need a website that is not there? [Ask for it](https://maviapi.com/?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide) and get an API for it.

Other unofficial SDKs: [Kiwi.com](https://github.com/maviapi-sdks/kiwi-unofficial-sdk) · [MarineTraffic](https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk) · [Speedtest](https://github.com/maviapi-sdks/speedtest-unofficial-sdk) · [Trainline](https://github.com/maviapi-sdks/trainline-unofficial-sdk) · [Trendyol](https://github.com/maviapi-sdks/trendyol-unofficial-sdk) · [Tripadvisor](https://github.com/maviapi-sdks/tripadvisor-unofficial-sdk) · [Yemeksepeti](https://github.com/maviapi-sdks/yemeksepeti-unofficial-sdk)

## License

MIT. See [LICENSE](LICENSE).
