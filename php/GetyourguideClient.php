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
     * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
     * with price, rating, next availability date and destination.
     *
     * Each successful request uses 25 credits.
     *
     * Parameters:
     *   $location (string, required): GetYourGuide place slug in the {city}-l{id} form
     *     (from /catalog or an activity URL)
     *   $limit (integer): Max items per page (default 50, max 200)
     *   $offset (integer): Items to skip for pagination
     *
     * @return array<string, mixed>
     */
    public function activitiesLocation(string $location, ?int $limit = null, ?int $offset = null): array
    {
        return $this->get('/activities/{location}', ['location' => $location, 'limit' => $limit, 'offset' => $offset]);
    }

    /**
     * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
     * price, rating, review count and sample reviews.
     *
     * Each successful request uses 25 credits.
     *
     * Parameters:
     *   $id (string, required): Numeric activity id (the …-t<id> in an activity URL)
     *
     * @return array<string, mixed>
     */
    public function activityId(string $id): array
    {
        return $this->get('/activity/{id}', ['id' => $id]);
    }

    /**
     * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
     * each); each entry has the activity id and location slug.
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
     * Each successful request uses 25 credits.
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
