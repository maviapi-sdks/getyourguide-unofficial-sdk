# GetYourGuide Unofficial SDK

Unofficial **GetYourGuide API** client for Python, JavaScript/TypeScript, Go, PHP, Ruby, Java and C#. Tour & activity listings from GetYourGuide — prices, ratings, availability dates and destinations, plus per-activity detail and bulk sitemap discovery.

- **8 endpoints**, each returning JSON, with one method per endpoint in every language.
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
result = client.explore(location="venice-l35", limit=5)
print(result)
```

### JavaScript / TypeScript

```bash
npm install github:maviapi-sdks/getyourguide-unofficial-sdk
```

```javascript
import { GetyourguideClient } from "getyourguide-unofficial-sdk";

const client = new GetyourguideClient(); // or new GetyourguideClient({ apiKey: "mvk_live_..." })
const result = await client.explore({ location: "venice-l35", limit: 5 });
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
	result, err := client.Explore(context.Background(), getyourguide.Params{"location": "venice-l35", "limit": 5})
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
$result = $client->explore(location: 'venice-l35', limit: 5);
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
result = client.explore(location: "venice-l35", limit: 5)
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
        String json = client.explore(Map.of("location", "venice-l35", "limit", 5));
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
var result = await client.ExploreAsync(new Dictionary<string, object?> { ["location"] = "venice-l35", ["limit"] = 5 });
Console.WriteLine(result);
```

## Endpoints

| Endpoint | What it returns | Credits per call |
|---|---|---|
| [`GET /activities-v2/{location}`](#get-activities-v2location) | Every tour & activity GetYourGuide lists for a location slug (e.g. | 10 |
| [`GET /activities/{location}`](#get-activitieslocation) | Tour & activity listings for a GetYourGuide location slug (e.g. | 10 |
| [`GET /activity/{id}`](#get-activityid) | Full detail for one activity by numeric id (e.g. | 10 |
| [`GET /catalog`](#get-catalog) | Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000 each); each entry has the activity id and location slug. | 1 |
| [`GET /explore`](#get-explore) | Resolve a location's tour/activity listings and optionally enrich the top N with full detail (description, images, reviews) in one call. | 10 |
| [`GET /explore-v2`](#get-explore-v2) | Every tour/activity GetYourGuide lists for a location (all pages, pagination.total = the site's count), optionally with full detail (description, images, reviews) for the top N, in one call. | 10 |
| [`GET /locations`](#get-locations) | Find GetYourGuide places (cities, regions, countries, attractions) by name: id, name, type, descriptor (e.g. | 10 |
| [`GET /search`](#get-search) | Search GetYourGuide tours & activities by free text and/or place, with the site's filters (dates, price range, duration, minimum rating, languages, start time, features, categories, departure place) and sort orders. | 10 |

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
| 429 | `rate_limited` | Too many requests for this key (`rate_limited`), or too many at once for its plan (`concurrency_limited`). Wait the number of seconds in `Retry-After`. |
| 502 | `scrape_failed` | The source site could not be read this time. Retrying later usually works. |

## Endpoint reference

Base URL: `https://api.maviapi.com/v1/sites/getyourguide`. API version 2026-11-25. The same contract is in [`openapi.json`](openapi.json).

### `GET /activities-v2/{location}`

Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all pages: price, rating, review count, duration, next availability, image. pagination.total matches the site's own count.

Each successful request uses 10 credits for every 24 rows it returns (at least 10 credits).

Methods: `activities_v2_by_location` (Python, Ruby) · `activitiesV2ByLocation` (JavaScript/TypeScript, PHP, Java) · `ActivitiesV2ByLocation` (Go) · `ActivitiesV2ByLocationAsync` (C#)

Parameters:

- `location` (string, required, in the path): GetYourGuide place slug in the {city}-l{id} form (from /catalog or an activity URL). Example: `venice-l35`.
- `limit` (integer, optional): Max activities per page (default 50, max 1000). Every page of the location is fetched once and cached, so any limit/offset is served from the same full list. Example: `50`.
- `offset` (integer, optional): Activities to skip. Works up to pagination.total (the site's full count), not just the first page. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "location_id": "35",
    "total": 1152,
    "complete": true,
    "count": 50,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "abstract": "Make your arrival in Venice unforgettable with a water taxi transfer to your hotel or the nearest accessible point from Venice Airport.",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.37,
        "rating_count": 29055,
        "category": "transfer",
        "duration": "50 minutes",
        "free_cancellation": true,
        "available_from": "2026-11-14T13:30:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1b7db2e061cdbe72.jpeg",
        "position": 1
      }
    ]
  },
  "cached": false,
  "source": "getyourguide:search",
  "pagination": {
    "total": 1152,
    "limit": 50,
    "offset": 0,
    "count": 50,
    "has_more": true
  }
}
```

</details>

### `GET /activities/{location}`

Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each with price, rating, next availability date and destination.

Each successful request uses 10 credits.

Methods: `activities_by_location` (Python, Ruby) · `activitiesByLocation` (JavaScript/TypeScript, PHP, Java) · `ActivitiesByLocation` (Go) · `ActivitiesByLocationAsync` (C#)

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

Each successful request uses 10 credits.

Methods: `activity_by_id` (Python, Ruby) · `activityById` (JavaScript/TypeScript, PHP, Java) · `ActivityById` (Go) · `ActivityByIdAsync` (C#)

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

Each successful request uses 1 credit for every 5000 rows it returns (at least 1 credit).

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

Each successful request uses 10 credits.

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

### `GET /explore-v2`

Every tour/activity GetYourGuide lists for a location (all pages, pagination.total = the site's count), optionally with full detail (description, images, reviews) for the top N, in one call.

Each successful request uses 10 credits for every 24 rows it returns (at least 10 credits).

Methods: `explore_v2` (Python, Ruby) · `exploreV2` (JavaScript/TypeScript, PHP, Java) · `ExploreV2` (Go) · `ExploreV2Async` (C#)

Parameters:

- `location` (string, required): GetYourGuide place slug, e.g. venice-l35. Example: `venice-l35`.
- `detail` (string, optional): When true, enrich the top `enrich` activities with detail (description, images, reviews). One of: `true`, `false`. Example: `false`.
- `enrich` (integer, optional): How many top activities to enrich when detail=true (1-5). One of: `1`, `2`, `3`, `4`, `5`. Example: `3`.
- `limit` (integer, optional): Max activities per page (default 50, max 1000). Every page of the location is fetched once and cached, so any limit/offset is served from the same full list. Example: `50`.
- `offset` (integer, optional): Activities to skip. Works up to pagination.total (the site's full count), not just the first page. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "location_id": "35",
    "detail": false,
    "enrich": 0,
    "total": 1152,
    "complete": true,
    "count": 50,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "abstract": "Make your arrival in Venice unforgettable with a water taxi transfer to your hotel or the nearest accessible point from Venice Airport.",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.37,
        "rating_count": 29055,
        "category": "transfer",
        "duration": "50 minutes",
        "free_cancellation": true,
        "available_from": "2026-11-14T13:30:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1b7db2e061cdbe72.jpeg",
        "position": 1,
        "detail": {
          "description": "Explore the Grand Canal by boat...",
          "images": [
            null
          ],
          "reviews": [
            {
              "author": "James",
              "rating": 5,
              "title": null,
              "text": "Well worth it.",
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
    "total": 1152,
    "limit": 50,
    "offset": 0,
    "count": 50,
    "has_more": true
  }
}
```

</details>

### `GET /locations`

Find GetYourGuide places (cities, regions, countries, attractions) by name: id, name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35) that /activities, /activities-v2, /explore and /search take.

Each successful request uses 10 credits.

Methods: `locations` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Locations` (Go) · `LocationsAsync` (C#)

Parameters:

- `q` (string, required): Name of a city, region, country or attraction (any case, accents optional). Example: `venice`.
- `limit` (integer, optional): Max places to return (the site suggests up to 20). Example: `50`.
- `offset` (integer, optional): Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "venice",
    "count": 12,
    "locations": [
      {
        "id": "35",
        "name": "Venice",
        "slug": "venice-l35",
        "type": "city",
        "descriptor": "City in Italy",
        "url": "https://www.getyourguide.com/venice-l35/",
        "image": "https://cdn.getyourguide.com/img/location/5ffeb43d54f6e.jpeg/132.jpg"
      }
    ]
  },
  "cached": false,
  "source": "getyourguide:autocomplete",
  "pagination": {
    "total": 12,
    "limit": 50,
    "offset": 0,
    "count": 12,
    "has_more": false
  }
}
```

</details>

### `GET /search`

Search GetYourGuide tours & activities by free text and/or place, with the site's filters (dates, price range, duration, minimum rating, languages, start time, features, categories, departure place) and sort orders. 24 results per page; data.total is the site's own count.

Each successful request uses 10 credits for every 24 rows it returns (at least 10 credits).

Methods: `search` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Search` (Go) · `SearchAsync` (C#)

Parameters:

- `q` (string, optional): Free text, as typed in the site's search box (an activity, attraction or place). q, location or both are required. Example: `gondola`.
- `location` (string, optional): Limit to one place: a place slug from /locations (venice-l35) or its numeric id (35). Example: `venice-l35`.
- `date_from` (string, optional): Only activities available on or after this date (YYYY-MM-DD). Alone, it searches that one day.
- `date_to` (string, optional): Last day of the date range (YYYY-MM-DD); needs date_from.
- `min_price` (number, optional): Lowest starting price, in EUR.
- `max_price` (number, optional): Highest starting price, in EUR.
- `sort` (string, optional): Order of the results. With q, the text match is weighed in too. One of: `popularity`, `price_asc`, `price_desc`, `rating_desc`. Example: `popularity`.
- `languages` (string, optional): Guide/audio languages, comma separated ISO codes (en, de, fr, es, it, ...): activities offered in any of them.
- `duration` (string, optional): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day, 2-days, 3-days, 4-days, 5-days-plus.
- `min_rating` (string, optional): Minimum average rating. One of: `3.0`, `3.5`, `4.0`, `4.5`. Example: `3.0`.
- `start_time` (string, optional): Start times, comma separated: morning (before 12 PM), afternoon (12-5 PM), evening (after 5 PM).
- `features` (string, optional): Features, comma separated: private, small-group, skip-the-line, wheelchair-accessible, hotel-pickup, originals.
- `categories` (string, optional): Category ids, comma separated: the tc<n> in a category page address (gondola-tours-tc264 -> tc-264).
- `departs_from` (string, optional): Departure places, comma separated slugs or ids from /locations.
- `page` (integer, optional): Page of the site's results, 24 per page (1 to 34; the site serves no pages past about 34). data.total is the full count; narrow the query with filters to reach more rows. Example: `1`.
- `limit` (integer, optional): Rows of this page to return (default 50: the whole 24-row page). Example: `50`.
- `offset` (integer, optional): Rows of this page to skip. Example: `0`.

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "gondola",
    "location": {
      "input": "venice-l35",
      "id": "35"
    },
    "filters": {
      "date_from": null,
      "date_to": null,
      "min_price": null,
      "max_price": null,
      "languages": [
        null
      ],
      "duration": [
        null
      ],
      "min_rating": null,
      "start_time": [
        null
      ],
      "features": [
        null
      ],
      "categories": [
        null
      ],
      "departs_from": [
        null
      ]
    },
    "sort": "popularity",
    "page": 1,
    "page_size": 24,
    "total": 288,
    "has_more": true,
    "count": 24,
    "activities": [
      {
        "id": "221382",
        "title": "Venice: Grand Canal Gondola Ride with App Commentary",
        "abstract": "Make your arrival in Venice unforgettable with a water taxi transfer to your hotel or the nearest accessible point from Venice Airport.",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.37,
        "rating_count": 29055,
        "category": "transfer",
        "duration": "50 minutes",
        "free_cancellation": true,
        "available_from": "2026-11-14T13:30:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1b7db2e061cdbe72.jpeg",
        "position": 1
      }
    ]
  },
  "cached": false,
  "source": "getyourguide:search",
  "pagination": {
    "total": 24,
    "limit": 50,
    "offset": 0,
    "count": 24,
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

Other unofficial SDKs: [Airbnb](https://github.com/maviapi-sdks/airbnb-unofficial-sdk) · [Booking.com](https://github.com/maviapi-sdks/booking-unofficial-sdk) · [Google Search](https://github.com/maviapi-sdks/google-search-unofficial-sdk) · [Kiwi.com](https://github.com/maviapi-sdks/kiwi-unofficial-sdk) · [MarineTraffic](https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk) · [Speedtest](https://github.com/maviapi-sdks/speedtest-unofficial-sdk) · [Trainline](https://github.com/maviapi-sdks/trainline-unofficial-sdk) · [Trendyol](https://github.com/maviapi-sdks/trendyol-unofficial-sdk) · [Tripadvisor](https://github.com/maviapi-sdks/tripadvisor-unofficial-sdk) · [Yemeksepeti](https://github.com/maviapi-sdks/yemeksepeti-unofficial-sdk)

## License

MIT. See [LICENSE](LICENSE).
