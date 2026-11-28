# GetYourGuide Unofficial SDK

Unofficial **GetYourGuide API** client for Python, JavaScript/TypeScript, Go, PHP, Ruby, Java and C#. Tour & activity listings from GetYourGuide — prices, ratings, availability dates and destinations, plus per-activity detail and bulk sitemap discovery.

- **9 endpoints**, each returning JSON, with one method per endpoint in every language.
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
| [`GET /activities-v2/{location}`](#get-activities-v2location) | Every tour & activity GetYourGuide lists for a place, across all of the site's pages: price, rating, review count, duration, next availability, image. | 5 |
| [`GET /activities/{location}`](#get-activitieslocation) | Tour & activity listings for a GetYourGuide place in the site's popularity order: the first page of the site's listing (24 rows), each with price, rating, review count, next availability, place label and image. | 5 |
| [`GET /activity-v2/{id}`](#get-activity-v2id) | Full detail for one activity (as /activity: title, description, images, price, rating, reviews) plus where and how it happens: meeting point with address and coordinates, other start points and a separate end point, pickup, the main attraction (id, name, coordinates, URL) and the places visited with coordinates, the city (id, name, slug) and country, duration with its lower and upper bound in minutes, guide languages and the kind of guide offering them, category and the site's numeric category ids, free cancellation and the cancellation policy, and the activity URL. | 5 |
| [`GET /activity/{id}`](#get-activityid) | Full detail for one activity: title, description, images, starting price, average rating, review count and a sample of recent reviews (author, rating, title, text, date). | 5 |
| [`GET /catalog`](#get-catalog) | Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file; URLs whose slugs hold characters other than lowercase letters, digits and hyphens are left out), each with its activity id and place slug. | 5 |
| [`GET /explore`](#get-explore) | A place's tour & activity listings in the site's popularity order (the first page of 24 rows, as /activities), with the top `enrich` listings optionally carrying full detail (description, images, recent reviews) in a `detail` object. | 5 |
| [`GET /explore-v2`](#get-explore-v2) | Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the site's pages, `total` = the site's count), with the top `enrich` activities optionally carrying full detail (description, images, recent reviews) in a `detail` object. | 5 |
| [`GET /locations`](#get-locations) | GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose name matches the text, in the site's relevance order, at most the site's top 20 suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug (e.g. | 5 |
| [`GET /search`](#get-search) | One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or place, with the site's filters and sort orders. | 5 |

Try each one in the browser on the [GetYourGuide API page](https://maviapi.com/apis/getyourguide?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide).

## Authentication

A client takes the key you give it. With none, it reads the `MAVIAPI_API_KEY` environment variable, and then uses the shared demo key (30 requests a minute and 300 a day per network). To get your own, [sign up](https://maviapi.com/sign-up?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide) and create a key on the [keys page](https://maviapi.com/dashboard/keys). A successful request uses the credits its endpoint lists; a failed request is free. Plans are on the [pricing page](https://maviapi.com/pricing?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide).

## Errors

A request the API answers with an error status raises an `ApiError` (in Go, returns an `*Error`) with the HTTP status, a machine-readable code and a message. In Java it carries the status and the response body.

| Status | Code | Meaning |
|---|---|---|
| 400 | `bad_request` | A parameter is missing or cannot be used (`bad_request`), or, with the `x-maviapi-strict: 1` request header, a query param the operation does not take was sent (`unknown_param`, with the names in `params`). |
| 401 | `missing_api_key` | No API key was sent, or the key is invalid or revoked (`missing_api_key`, `invalid_api_key`). |
| 402 | `credit_limit_reached` | The plan's credits for this period are used up. |
| 403 | `account_banned` | The account that owns the key is suspended. |
| 410 | `cursor_expired` | The stored copy of the list this cursor walks is gone. Start the list again without cursor. |
| 429 | `rate_limited` | Too many requests for this key (`rate_limited`), or too many at once for its plan (`concurrency_limited`). Wait the number of seconds in `Retry-After`. |
| 502 | `scrape_failed` | The source site could not be read this time. Retrying later usually works. |

## Endpoint reference

Base URL: `https://api.maviapi.com/v1/sites/getyourguide`. API version 2026-11-27. The same contract is in [`openapi.json`](openapi.json).

### `GET /activities-v2/{location}`

Every tour & activity GetYourGuide lists for a place, across all of the site's pages: price, rating, review count, duration, next availability, image. `total` is the site's own count; rows come in the site's popularity order, then the remaining activities by ascending price.

Each successful request uses 5 credits.

Methods: `activities_v2_by_location` (Python, Ruby) · `activitiesV2ByLocation` (JavaScript/TypeScript, PHP, Java) · `ActivitiesV2ByLocation` (Go) · `ActivitiesV2ByLocationAsync` (C#)

Parameters:

- `location` (string, required, in the path): GetYourGuide place slug in the {city}-l{id} form, e.g. venice-l35 (from /locations, /catalog or an activity URL). Example: `venice-l35`.
- `limit` (integer, optional): Rows in one page, 1 to 1000 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "location_id": "35",
    "total": 1171,
    "complete": true,
    "count": 1171,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "abstract": "Make your arrival in Venice unforgettable with a water taxi transfer to your hotel or the nearest accessible point from Venice Airport. Enjoy a scenic ride and get a stunning first look at Venice.",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.37,
        "rating_count": 29107,
        "category": "transfer",
        "duration": "50 - 100 minutes",
        "free_cancellation": true,
        "available_from": "2026-11-27T04:00:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1d9ec02a63f56551.jpeg",
        "position": 1
      }
    ],
    "pagination": {
      "count": 1171,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:25.675Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /activities/{location}`

Tour & activity listings for a GetYourGuide place in the site's popularity order: the first page of the site's listing (24 rows), each with price, rating, review count, next availability, place label and image.

Each successful request uses 5 credits.

Methods: `activities_by_location` (Python, Ruby) · `activitiesByLocation` (JavaScript/TypeScript, PHP, Java) · `ActivitiesByLocation` (Go) · `ActivitiesByLocationAsync` (C#)

Parameters:

- `location` (string, required, in the path): GetYourGuide place slug in the {city}-l{id} form, e.g. venice-l35 (from /locations, /catalog or an activity URL). Example: `venice-l35`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "count": 24,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "currency": "EUR",
        "rating": 4.37,
        "rating_count": 29107,
        "available_from": "2026-11-27T04:00:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1d9ec02a63f56551.jpeg",
        "position": 1
      }
    ],
    "pagination": {
      "count": 24,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:07.709Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /activity-v2/{id}`

Full detail for one activity (as /activity: title, description, images, price, rating, reviews) plus where and how it happens: meeting point with address and coordinates, other start points and a separate end point, pickup, the main attraction (id, name, coordinates, URL) and the places visited with coordinates, the city (id, name, slug) and country, duration with its lower and upper bound in minutes, guide languages and the kind of guide offering them, category and the site's numeric category ids, free cancellation and the cancellation policy, and the activity URL.

Each successful request uses 5 credits.

Methods: `activity_v2_by_id` (Python, Ruby) · `activityV2ById` (JavaScript/TypeScript, PHP, Java) · `ActivityV2ById` (Go) · `ActivityV2ByIdAsync` (C#)

Parameters:

- `id` (string, required, in the path): numeric activity id, the number after -t in an activity URL (e.g. 631866). Example: `631866`.
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "id": "631866",
    "title": "Rome: Colosseum 3-in-1 Tour with Underground Option",
    "description": "Step onto the Colosseum's Arena Floor—an experience few visitors enjoy, explore ancient temples and tombs in the Roman Forum, and visit Caesar's Palace on Palatine Hill, all with a local expert guide.",
    "images": [
      "https://cdn.getyourguide.com/image/fit=crop,width=180,height=180/tour_img/de83673bd7f4f95ff8d7be25c511284d096843c63fb6f69ea5da5ec0e5e15fda.jpg"
    ],
    "price": 48,
    "currency": "EUR",
    "rating": 4.556669946756984,
    "review_count": 1741,
    "reviews": [
      {
        "author": "Joy",
        "rating": 5,
        "title": null,
        "text": "What a memorable day. Loved it. Would do it again and recommend strongly.",
        "date": "2026-11-27T07:30:59+01:00"
      }
    ],
    "url": "https://www.getyourguide.com/rome-l33/rome-colosseum-underground-experience-with-roman-forum-t631866/",
    "meeting_point": {
      "name": "Arch of Constantine",
      "address": "Piazza del Colosseo, 00184 Roma RM, Italy",
      "description": "Meet your guide at the Arch of Constantine, specifically the corner of the arch furthest from the Colosseum. Our meeting point coordinator will be holding a \"Let's See Italy\" sign so they're easy to recognize.",
      "latitude": 41.8898113,
      "longitude": 12.49067819999999
    },
    "meeting_point_note": null,
    "pickup_available": false,
    "start_points": [
      null
    ],
    "end_points": [
      null
    ],
    "end_point_note": "You'll return to the meeting point at the end of the activity.",
    "attraction": {
      "id": "2618",
      "name": "Roman Forum",
      "latitude": 41.8924623,
      "longitude": 12.485325,
      "url": "https://www.getyourguide.com/roman-forum-l2618/"
    },
    "places_visited": [
      {
        "name": "Roman Forum",
        "description": "Guided tour 45 minutes",
        "latitude": 41.8924623,
        "longitude": 12.485325,
        "main": true
      }
    ],
    "city": {
      "id": "33",
      "name": "Rome",
      "slug": "rome-l33"
    },
    "country": {
      "id": "169011",
      "name": "Italy"
    },
    "duration": "2.5 - 3 hours",
    "duration_minutes": 150,
    "duration_max_minutes": 180,
    "languages": [
      "English"
    ],
    "language_options": [
      {
        "type": "Live tour guide",
        "languages": [
          "English"
        ]
      }
    ],
    "category": "guidedTour",
    "category_ids": [
      0
    ],
    "free_cancellation": true,
    "cancellation_policy": "Cancel up to 7 days in advance for a full refund",
    "fetched_at": "2026-11-27T17:47:35.231Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /activity/{id}`

Full detail for one activity: title, description, images, starting price, average rating, review count and a sample of recent reviews (author, rating, title, text, date).

Each successful request uses 5 credits.

Methods: `activity_by_id` (Python, Ruby) · `activityById` (JavaScript/TypeScript, PHP, Java) · `ActivityById` (Go) · `ActivityByIdAsync` (C#)

Parameters:

- `id` (string, required, in the path): numeric activity id, the number after -t in an activity URL (e.g. 6851). Example: `6851`.
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "id": "6851",
    "title": "Venice: Grand Canal Boat Tour",
    "description": "Enjoy a boat tour on the Grand Canal of Venice, where you will see the bustling Venetian waterfront and iconic historical landmarks like the luxurious Hotel Gritti, Ca' Pisani Moretta, and the ancient Rialto Bridge.",
    "images": [
      "https://cdn.getyourguide.com/img/tour/b73a785a983f8e415467c0186558555d41f52496f68c5878596d9b03eab5b0ab.jpg/53.jpg"
    ],
    "price": 45,
    "currency": "EUR",
    "rating": 4.127170705431156,
    "review_count": 1189,
    "reviews": [
      {
        "author": "Cinzia",
        "rating": 5,
        "title": null,
        "text": "A lovely tour; a lot was explained, and you could take great photos!",
        "date": "2026-10-30T09:18:01+01:00"
      }
    ],
    "pagination": {
      "count": 10,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:26.445Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /catalog`

Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file; URLs whose slugs hold characters other than lowercase letters, digits and hyphens are left out), each with its activity id and place slug.

Each successful request uses 5 credits.

Methods: `catalog` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Catalog` (Go) · `CatalogAsync` (C#)

Parameters:

- `index` (integer, optional): which activity sitemap file to read, 0-based (0 to about 60). Example: `0`.
- `limit` (integer, optional): Rows in one page, 1 to 1000 (default 100).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "index": 0,
    "count": 4998,
    "activities": [
      {
        "id": "462358",
        "url": "https://www.getyourguide.com/cairo-l92/cairo-giza-pyramids-sphinx-tour-with-camel-ride-entry-t462358/",
        "location": "cairo-l92",
        "location_id": "92"
      }
    ],
    "pagination": {
      "count": 4998,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:28.995Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /explore`

A place's tour & activity listings in the site's popularity order (the first page of 24 rows, as /activities), with the top `enrich` listings optionally carrying full detail (description, images, recent reviews) in a `detail` object.

Each successful request uses 5 credits.

Methods: `explore` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Explore` (Go) · `ExploreAsync` (C#)

Parameters:

- `location` (string, optional): GetYourGuide place slug, e.g. venice-l35 (from /locations). Example: `venice-l35`.
- `detail` (string, optional): "true" to add detail to the top listings; "false" for listings only. One of: `true`, `false`. Example: `false`.
- `enrich` (integer, optional): how many top listings get detail when detail=true (1-5). Example: `3`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "detail": false,
    "count": 24,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "currency": "EUR",
        "rating": 4.37,
        "rating_count": 29107,
        "available_from": "2026-11-27T04:00:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1d9ec02a63f56551.jpeg",
        "position": 1
      }
    ],
    "pagination": {
      "count": 24,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:29.021Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /explore-v2`

Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the site's pages, `total` = the site's count), with the top `enrich` activities optionally carrying full detail (description, images, recent reviews) in a `detail` object.

Each successful request uses 5 credits.

Methods: `explore_v2` (Python, Ruby) · `exploreV2` (JavaScript/TypeScript, PHP, Java) · `ExploreV2` (Go) · `ExploreV2Async` (C#)

Parameters:

- `location` (string, optional): GetYourGuide place slug, e.g. venice-l35 (from /locations). Example: `venice-l35`.
- `detail` (string, optional): "true" to add detail to the top activities; "false" for listings only. One of: `true`, `false`. Example: `false`.
- `enrich` (integer, optional): how many top activities get detail when detail=true (1-5). Example: `3`.
- `limit` (integer, optional): Rows in one page, 1 to 1000 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "location": "venice-l35",
    "location_id": "35",
    "detail": false,
    "enrich": 0,
    "total": 1171,
    "complete": true,
    "count": 1171,
    "activities": [
      {
        "id": "6849",
        "title": "Venice: Marco Polo Airport Water Taxi Transfer",
        "abstract": "Make your arrival in Venice unforgettable with a water taxi transfer to your hotel or the nearest accessible point from Venice Airport. Enjoy a scenic ride and get a stunning first look at Venice.",
        "url": "https://www.getyourguide.com/venice-l35/venice-marco-polo-airport-transfer-shared-water-taxi-t6849/",
        "price": 39,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.37,
        "rating_count": 29107,
        "category": "transfer",
        "duration": "50 - 100 minutes",
        "free_cancellation": true,
        "available_from": "2026-11-27T04:00:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/1d9ec02a63f56551.jpeg",
        "position": 1
      }
    ],
    "pagination": {
      "count": 1171,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:29.089Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /locations`

GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose name matches the text, in the site's relevance order, at most the site's top 20 suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug (e.g. venice-l35) that the location parameter of the other endpoints takes.

Each successful request uses 5 credits.

Methods: `locations` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Locations` (Go) · `LocationsAsync` (C#)

Parameters:

- `q` (string, optional): name of a city, region, country or attraction (any case, accents optional). Example: `venice`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "venice",
    "count": 20,
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
    ],
    "pagination": {
      "count": 20,
      "has_more": false,
      "next_cursor": null
    },
    "fetched_at": "2026-11-27T17:47:30.077Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

### `GET /search`

One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or place, with the site's filters and sort orders. `total` is the site's own count of results for the query; `has_more` says whether page+1 holds more.

Each successful request uses 5 credits.

Methods: `search` (Python, JavaScript/TypeScript, PHP, Ruby, Java) · `Search` (Go) · `SearchAsync` (C#)

Parameters:

- `q` (string, optional): free text as typed in the site's search box (an activity, attraction or place). Give q, location or both; with neither, the example search for 'gondola' runs.
- `location` (string, optional): limit to one place: a place slug from /locations (venice-l35) or its numeric id (35).
- `date_from` (string, optional): only activities available on or after this date (YYYY-MM-DD); alone, it searches that one day.
- `date_to` (string, optional): last day of the date range (YYYY-MM-DD); needs date_from.
- `min_price` (string, optional): lowest starting price, in EUR.
- `max_price` (string, optional): highest starting price, in EUR.
- `sort` (string, optional): popularity, price_asc, price_desc or rating_desc; with q the text match is weighed in too. One of: `popularity`, `price_asc`, `price_desc`, `rating_desc`. Example: `popularity`.
- `languages` (string, optional): guide/audio languages, comma separated ISO codes (en, de, fr, es, it, ...): activities offered in any of them.
- `duration` (string, optional): durations, comma separated: 0-3h, 3-5h, 5-7h, full-day, 2-days, 3-days, 4-days, 5-days-plus.
- `min_rating` (string, optional): minimum average rating: 3.0, 3.5, 4.0 or 4.5.
- `start_time` (string, optional): start times, comma separated: morning (before 12 PM), afternoon (12-5 PM), evening (after 5 PM).
- `features` (string, optional): comma separated: private, small-group, skip-the-line, wheelchair-accessible, hotel-pickup, originals.
- `categories` (string, optional): category ids, comma separated: the tc<n> in a category page address (gondola-tours-tc264 -> tc-264 or 264). With several, the rows of each category are merged and total is the sum of their counts.
- `departs_from` (string, optional): departure places, comma separated place slugs or ids from /locations.
- `page` (integer, optional): page of the site's results, 24 per page (1 to 34; the site serves no pages past about 34). Narrow the query with filters to reach more rows. Example: `1`.
- `limit` (integer, optional): Rows in one page, 1 to 200 (default 50).
- `offset` (integer, optional): Rows to skip before the page starts (default 0).
- `undefined` (string, optional)
- `undefined` (string, optional)
- `undefined` (string, optional)

<details>
<summary>Example response</summary>

```json
{
  "data": {
    "query": "gondola",
    "location": null,
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
    "total": 1049,
    "has_more": true,
    "count": 24,
    "activities": [
      {
        "id": "221382",
        "title": "Venice: Grand Canal Gondola Ride with App Commentary",
        "abstract": "Ride a traditional gondola through quiet side canals and along the Grand Canal with in-app audio commentary, and visit the Gondola Gallery with a short virtual-reality film.",
        "url": "https://www.getyourguide.com/venice-l35/venice-grand-canal-gondola-ride-with-app-commentary-t221382/",
        "price": 37.05,
        "original_price": 39,
        "currency": "EUR",
        "price_label": "per person",
        "rating": 4.19,
        "rating_count": 26848,
        "category": "waterActivity",
        "duration": "30 minutes - 2 hours",
        "free_cancellation": true,
        "available_from": "2026-11-27T16:00:00+01:00",
        "location": "Venice",
        "image": "https://cdn.getyourguide.com/image/format=auto,fit=crop,gravity=auto,quality=60,width=270,height=180,dpr=2/tour_img/db8da9c4a17fa436ebc371b7f64d3a758ed4efb13bdf296d36224719613a15b7.jpg",
        "position": 1
      }
    ],
    "pagination": {
      "count": 24,
      "has_more": true,
      "next_cursor": "WzEsIjhhZjEzOWI3IixudWxsLDAseyJwYWdlIjoyfV0"
    },
    "fetched_at": "2026-11-27T17:47:31.887Z",
    "age": 0
  },
  "cached": null,
  "source": null,
  "pagination": {
    "total": null,
    "limit": null,
    "offset": null,
    "count": null,
    "has_more": null,
    "next_cursor": null
  },
  "fetched_at": null,
  "age": null
}
```

</details>

## More

- [GetYourGuide API page](https://maviapi.com/apis/getyourguide?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide): live examples and the changelog.
- [OpenAPI document](https://api.maviapi.com/v1/apis/getyourguide/openapi.json) and [Postman collection](https://api.maviapi.com/v1/apis/getyourguide/postman.json).
- [maviapi MCP server](https://maviapi.com/docs#mcp): the same API as tools for Claude, Cursor and other AI agents.
- [All maviapi APIs](https://maviapi.com/apis?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide). Need a website that is not there? [Ask for it](https://maviapi.com/?utm_source=github&utm_medium=readme&utm_campaign=sdk-getyourguide) and get an API for it.

Other unofficial SDKs: [Airbnb](https://github.com/maviapi-sdks/airbnb-unofficial-sdk) · [Booking.com](https://github.com/maviapi-sdks/booking-unofficial-sdk) · [FlightList](https://github.com/maviapi-sdks/flightlist-unofficial-sdk) · [Google Search](https://github.com/maviapi-sdks/google-search-unofficial-sdk) · [Kiwi.com](https://github.com/maviapi-sdks/kiwi-unofficial-sdk) · [Madrid Cultural Agenda](https://github.com/maviapi-sdks/madrid-cultural-agenda-unofficial-sdk) · [MarineTraffic](https://github.com/maviapi-sdks/marinetraffic-unofficial-sdk) · [Speedtest](https://github.com/maviapi-sdks/speedtest-unofficial-sdk) · [Trainline](https://github.com/maviapi-sdks/trainline-unofficial-sdk) · [Trendyol](https://github.com/maviapi-sdks/trendyol-unofficial-sdk) · [Tripadvisor](https://github.com/maviapi-sdks/tripadvisor-unofficial-sdk) · [Yemeksepeti](https://github.com/maviapi-sdks/yemeksepeti-unofficial-sdk)

## License

MIT. See [LICENSE](LICENSE).
