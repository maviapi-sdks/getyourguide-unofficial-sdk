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
     * Every tour & activity GetYourGuide lists for a location slug (e.g. venice-l35), all
     * pages: price, rating, review count, duration, next availability, image.
     * pagination.total matches the site's own count.
     *
     * Each successful request uses 10 credits for every 24 rows it returns (at least 10
     * credits).
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug in the {city}-l{id} form
     *     (from /catalog or an activity URL)
     *   $limit (integer): Max activities per page (default 50, max 1000). Every page of
     *     the location is fetched once and cached, so any limit/offset is served from the
     *     same full list
     *   $offset (integer): Activities to skip. Works up to pagination.total (the site's
     *     full count), not just the first page
     *
     * @return array<string, mixed>
     */
    public function activitiesV2ByLocation(string $location, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/activities-v2/{location}', ['location' => $location, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
     * with price, rating, next availability date and destination.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug in the {city}-l{id} form
     *     (from /catalog or an activity URL)
     *   $limit (integer): Max items per page (default 50, max 200)
     *   $offset (integer): Items to skip for pagination
     *
     * @return array<string, mixed>
     */
    public function activitiesByLocation(string $location, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/activities/{location}', ['location' => $location, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
     * price, rating, review count and sample reviews.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $id (string, required): Numeric activity id (the …-t<id> in an activity URL)
     *
     * @return array<string, mixed>
     */
    public function activityById(string $id): array
    {
        return $this->get('/activity/{id}', ['id' => $id]);
    }

    /**
     * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
     * each); each entry has the activity id and location slug.
     *
     * Each successful request uses 1 credit for every 5000 rows it returns (at least 1
     * credit).
     *
     * Parameters:
     *   $index (integer): Which activity sitemap file to read (0-based)
     *   $limit (integer): Max items per page (default 100, max 5000)
     *   $offset (integer): Items to skip for pagination
     *
     * @return array<string, mixed>
     */
    public function catalog(?int $index = null, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/catalog', ['index' => $index, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Resolve a location's tour/activity listings and optionally enrich the top N with
     * full detail (description, images, reviews) in one call.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug, e.g. venice-l35
     *   $detail (string): When true, enrich the top `enrich` listings with detail
     *     (description, images, reviews). One of: true, false
     *   $enrich (integer): How many top listings to enrich when detail=true (1-5). One
     *     of: 1, 2, 3, 4, 5
     *   $limit (integer): Max items per page (default 50, max 200)
     *   $offset (integer): Items to skip for pagination
     *
     * @return array<string, mixed>
     */
    public function explore(string $location, ?string $detail = null, ?int $enrich = null, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/explore', ['location' => $location, 'detail' => $detail, 'enrich' => $enrich, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Every tour/activity GetYourGuide lists for a location (all pages, pagination.total =
     * the site's count), optionally with full detail (description, images, reviews) for
     * the top N, in one call.
     *
     * Each successful request uses 10 credits for every 24 rows it returns (at least 10
     * credits).
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug, e.g. venice-l35
     *   $detail (string): When true, enrich the top `enrich` activities with detail
     *     (description, images, reviews). One of: true, false
     *   $enrich (integer): How many top activities to enrich when detail=true (1-5). One
     *     of: 1, 2, 3, 4, 5
     *   $limit (integer): Max activities per page (default 50, max 1000). Every page of
     *     the location is fetched once and cached, so any limit/offset is served from the
     *     same full list
     *   $offset (integer): Activities to skip. Works up to pagination.total (the site's
     *     full count), not just the first page
     *
     * @return array<string, mixed>
     */
    public function exploreV2(string $location, ?string $detail = null, ?int $enrich = null, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/explore-v2', ['location' => $location, 'detail' => $detail, 'enrich' => $enrich, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
     * name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
     * that /activities, /activities-v2, /explore and /search take.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   $q (string, required): Name of a city, region, country or attraction (any case,
     *     accents optional)
     *   $limit (integer): Max places to return (the site suggests up to 20)
     *   $offset (integer)
     *
     * @return array<string, mixed>
     */
    public function locations(string $q, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/locations', ['q' => $q, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Search GetYourGuide tours & activities by free text and/or place, with the site's
     * filters (dates, price range, duration, minimum rating, languages, start time,
     * features, categories, departure place) and sort orders. 24 results per page;
     * data.total is the site's own count.
     *
     * Each successful request uses 10 credits for every 24 rows it returns (at least 10
     * credits).
     *
     * Parameters:
     *   $q (string): Free text, as typed in the site's search box (an activity,
     *     attraction or place). q, location or both are required
     *   $location (string): Limit to one place: a place slug from /locations
     *     (venice-l35) or its numeric id (35)
     *   $date_from (string): Only activities available on or after this date
     *     (YYYY-MM-DD). Alone, it searches that one day
     *   $date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
     *   $min_price (number): Lowest starting price, in EUR
     *   $max_price (number): Highest starting price, in EUR
     *   $sort (string): Order of the results. With q, the text match is weighed in too.
     *     One of: popularity, price_asc, price_desc, rating_desc
     *   $languages (string): Guide/audio languages, comma separated ISO codes (en, de,
     *     fr, es, it, ...): activities offered in any of them
     *   $duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
     *     2-days, 3-days, 4-days, 5-days-plus
     *   $min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
     *   $start_time (string): Start times, comma separated: morning (before 12 PM),
     *     afternoon (12-5 PM), evening (after 5 PM)
     *   $features (string): Features, comma separated: private, small-group,
     *     skip-the-line, wheelchair-accessible, hotel-pickup, originals
     *   $categories (string): Category ids, comma separated: the tc<n> in a category
     *     page address (gondola-tours-tc264 -> tc-264)
     *   $departs_from (string): Departure places, comma separated slugs or ids from
     *     /locations
     *   $page (integer): Page of the site's results, 24 per page (1 to 34; the site
     *     serves no pages past about 34). data.total is the full count; narrow the query
     *     with filters to reach more rows
     *   $limit (integer): Rows of this page to return (default 50: the whole 24-row
     *     page)
     *   $offset (integer): Rows of this page to skip
     *
     * @return array<string, mixed>
     */
    public function search(?string $q = null, ?string $location = null, ?string $date_from = null, ?string $date_to = null, ?float $min_price = null, ?float $max_price = null, ?string $sort = null, ?string $languages = null, ?string $duration = null, ?string $min_rating = null, ?string $start_time = null, ?string $features = null, ?string $categories = null, ?string $departs_from = null, ?int $page = null, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/search', ['q' => $q, 'location' => $location, 'date_from' => $date_from, 'date_to' => $date_to, 'min_price' => $min_price, 'max_price' => $max_price, 'sort' => $sort, 'languages' => $languages, 'duration' => $duration, 'min_rating' => $min_rating, 'start_time' => $start_time, 'features' => $features, 'categories' => $categories, 'departs_from' => $departs_from, 'page' => $page, 'limit' => $limit, 'offset' => $offset]);
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
