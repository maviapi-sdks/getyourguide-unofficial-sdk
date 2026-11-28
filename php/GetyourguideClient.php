<?php

// Unofficial GetYourGuide API client for PHP.
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

declare(strict_types=1);

namespace GetyourguideSdk;

/** An error status answered by the API. */
class ApiError extends \RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
    ) {
        parent::__construct("$status $errorCode: $message", $status);
    }
}

class GetyourguideClient
{
    public const DEMO_KEY = 'mvk_test_playground_5f3c1a8d';

    private string $apiKey;
    private string $baseUrl;

    /**
     * With no $apiKey it uses the MAVIAPI_API_KEY environment variable, then the
     * shared demo key.
     */
    public function __construct(?string $apiKey = null, ?string $baseUrl = null, private int $timeout = 120)
    {
        $this->apiKey = $apiKey ?: (getenv('MAVIAPI_API_KEY') ?: self::DEMO_KEY);
        $root = $baseUrl ?: (getenv('MAVIAPI_BASE_URL') ?: 'https://api.maviapi.com');
        $this->baseUrl = rtrim($root, '/') . '/v1/sites/getyourguide';
    }

    /**
     * Every tour & activity GetYourGuide lists for a place, across all of the site's
     * pages: price, rating, review count, duration, next availability, image. `total` is
     * the site's own count; rows come in the site's popularity order, then the remaining
     * activities by ascending price.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug in the {city}-l{id} form,
     *     e.g. venice-l35 (from /locations, /catalog or an activity URL)
     *   $limit (integer): Rows in one page, 1 to 1000 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function activitiesV2ByLocation(string $location, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/activities-v2/{location}', ['location' => $location, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * Tour & activity listings for a GetYourGuide place in the site's popularity order:
     * the first page of the site's listing (24 rows), each with price, rating, review
     * count, next availability, place label and image.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug in the {city}-l{id} form,
     *     e.g. venice-l35 (from /locations, /catalog or an activity URL)
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function activitiesByLocation(string $location, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/activities/{location}', ['location' => $location, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * Full detail for one activity (as /activity: title, description, images, price,
     * rating, reviews) plus where and how it happens: meeting point with address and
     * coordinates, other start points and a separate end point, pickup, the main
     * attraction (id, name, coordinates, URL) and the places visited with coordinates, the
     * city (id, name, slug) and country, duration with its lower and upper bound in
     * minutes, guide languages and the kind of guide offering them, category and the
     * site's numeric category ids, free cancellation and the cancellation policy, and the
     * activity URL.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $id (string, required): numeric activity id, the number after -t in an activity
     *     URL (e.g. 631866)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function activityV2ById(string $id, ?string $undefined = null): array
    {
        return $this->get('/activity-v2/{id}', ['id' => $id, undefined => $undefined]);
    }

    /**
     * Full detail for one activity: title, description, images, starting price, average
     * rating, review count and a sample of recent reviews (author, rating, title, text,
     * date).
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $id (string, required): numeric activity id, the number after -t in an activity
     *     URL (e.g. 6851)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function activityById(string $id, ?string $undefined = null): array
    {
        return $this->get('/activity/{id}', ['id' => $id, undefined => $undefined]);
    }

    /**
     * Activity URLs listed in one GetYourGuide activity sitemap file (about 5000 per file;
     * URLs whose slugs hold characters other than lowercase letters, digits and hyphens
     * are left out), each with its activity id and place slug.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $index (integer): which activity sitemap file to read, 0-based (0 to about 60)
     *   $limit (integer): Rows in one page, 1 to 1000 (default 100)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function catalog(?int $index = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/catalog', ['index' => $index, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * A place's tour & activity listings in the site's popularity order (the first page of
     * 24 rows, as /activities), with the top `enrich` listings optionally carrying full
     * detail (description, images, recent reviews) in a `detail` object.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
     *   $detail (string): "true" to add detail to the top listings; "false" for listings
     *     only. One of: true, false
     *   $enrich (integer): how many top listings get detail when detail=true (1-5)
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function explore(?string $location = null, ?string $detail = null, ?int $enrich = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/explore', ['location' => $location, 'detail' => $detail, 'enrich' => $enrich, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * Every tour & activity GetYourGuide lists for a place (as /activities-v2: all of the
     * site's pages, `total` = the site's count), with the top `enrich` activities
     * optionally carrying full detail (description, images, recent reviews) in a `detail`
     * object.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $location (string): GetYourGuide place slug, e.g. venice-l35 (from /locations)
     *   $detail (string): "true" to add detail to the top activities; "false" for
     *     listings only. One of: true, false
     *   $enrich (integer): how many top activities get detail when detail=true (1-5)
     *   $limit (integer): Rows in one page, 1 to 1000 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function exploreV2(?string $location = null, ?string $detail = null, ?int $enrich = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/explore-v2', ['location' => $location, 'detail' => $detail, 'enrich' => $enrich, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * GetYourGuide places (cities, regions, countries, attractions, neighborhoods) whose
     * name matches the text, in the site's relevance order, at most the site's top 20
     * suggestions: id, name, type, descriptor such as 'City in Italy', and the place slug
     * (e.g. venice-l35) that the location parameter of the other endpoints takes.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $q (string): name of a city, region, country or attraction (any case, accents
     *     optional)
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function locations(?string $q = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/locations', ['q' => $q, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * One page (24 rows) of GetYourGuide's tour & activity search, by free text and/or
     * place, with the site's filters and sort orders. `total` is the site's own count of
     * results for the query; `has_more` says whether page+1 holds more.
     *
     * Each successful request uses 5 credits.
     *
     * Parameters:
     *   $q (string): free text as typed in the site's search box (an activity,
     *     attraction or place). Give q, location or both; with neither, the example search
     *     for 'gondola' runs
     *   $location (string): limit to one place: a place slug from /locations
     *     (venice-l35) or its numeric id (35)
     *   $date_from (string): only activities available on or after this date
     *     (YYYY-MM-DD); alone, it searches that one day
     *   $date_to (string): last day of the date range (YYYY-MM-DD); needs date_from
     *   $min_price (string): lowest starting price, in EUR
     *   $max_price (string): highest starting price, in EUR
     *   $sort (string): popularity, price_asc, price_desc or rating_desc; with q the
     *     text match is weighed in too. One of: popularity, price_asc, price_desc,
     *     rating_desc
     *   $languages (string): guide/audio languages, comma separated ISO codes (en, de,
     *     fr, es, it, ...): activities offered in any of them
     *   $duration (string): durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
     *     2-days, 3-days, 4-days, 5-days-plus
     *   $min_rating (string): minimum average rating: 3.0, 3.5, 4.0 or 4.5
     *   $start_time (string): start times, comma separated: morning (before 12 PM),
     *     afternoon (12-5 PM), evening (after 5 PM)
     *   $features (string): comma separated: private, small-group, skip-the-line,
     *     wheelchair-accessible, hotel-pickup, originals
     *   $categories (string): category ids, comma separated: the tc<n> in a category
     *     page address (gondola-tours-tc264 -> tc-264 or 264). With several, the rows of
     *     each category are merged and total is the sum of their counts
     *   $departs_from (string): departure places, comma separated place slugs or ids
     *     from /locations
     *   $page (integer): page of the site's results, 24 per page (1 to 34; the site
     *     serves no pages past about 34). Narrow the query with filters to reach more rows
     *   $limit (integer): Rows in one page, 1 to 200 (default 50)
     *   $offset (integer): Rows to skip before the page starts (default 0)
     *   $undefined (string)
     *   $undefined (string)
     *   $undefined (string)
     *
     * @return array<string, mixed>
     */
    public function search(?string $q = null, ?string $location = null, ?string $date_from = null, ?string $date_to = null, ?string $min_price = null, ?string $max_price = null, ?string $sort = null, ?string $languages = null, ?string $duration = null, ?string $min_rating = null, ?string $start_time = null, ?string $features = null, ?string $categories = null, ?string $departs_from = null, ?int $page = null, ?int $limit = null, ?int $offset = null, ?string $undefined = null, ?string $undefined = null, ?string $undefined = null): array
    {
        return $this->get('/search', ['q' => $q, 'location' => $location, 'date_from' => $date_from, 'date_to' => $date_to, 'min_price' => $min_price, 'max_price' => $max_price, 'sort' => $sort, 'languages' => $languages, 'duration' => $duration, 'min_rating' => $min_rating, 'start_time' => $start_time, 'features' => $features, 'categories' => $categories, 'departs_from' => $departs_from, 'page' => $page, 'limit' => $limit, 'offset' => $offset, undefined => $undefined, undefined => $undefined, undefined => $undefined]);
    }

    /**
     * @param array<string, scalar|null> $params
     * @return array<string, mixed>
     */
    private function get(string $path, array $params): array
    {
        $query = [];
        foreach ($params as $name => $value) {
            if ($value === null) {
                continue;
            }
            $text = is_bool($value) ? ($value ? 'true' : 'false') : (string) $value;
            $token = '{' . $name . '}';
            if (str_contains($path, $token)) {
                $path = str_replace($token, rawurlencode($text), $path);
            } else {
                $query[$name] = $text;
            }
        }
        $curl = curl_init($this->baseUrl . $path . ($query ? '?' . http_build_query($query) : ''));
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_USERAGENT => 'getyourguide-unofficial-sdk/0.1.0 (php)',
            CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . $this->apiKey, 'Accept: application/json'],
        ]);
        $body = curl_exec($curl);
        if ($body === false) {
            throw new ApiError(0, 'network_error', curl_error($curl));
        }
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $data = json_decode($body, true);
        if ($status >= 400) {
            $detail = is_array($data) ? $data : [];
            throw new ApiError(
                $status,
                (string) ($detail['error'] ?? 'http_error'),
                (string) ($detail['message'] ?? substr($body, 0, 200)),
            );
        }
        return is_array($data) ? $data : [];
    }
}
