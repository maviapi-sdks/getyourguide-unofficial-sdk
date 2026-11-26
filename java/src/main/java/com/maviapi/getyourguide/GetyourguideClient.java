// Unofficial GetYourGuide API client for Java 11+.
// Not affiliated with GetYourGuide. Endpoint reference: https://maviapi.com/apis/getyourguide

package com.maviapi.getyourguide;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/** GetYourGuide API client. Every method returns the response body: a JSON document. */
public class GetyourguideClient {
    public static final String DEMO_KEY = "mvk_test_playground_5f3c1a8d";

    /** An error status answered by the API. Its body is a JSON object with "error" and "message". */
    public static class ApiError extends RuntimeException {
        private final int status;
        private final String body;

        public ApiError(int status, String body) {
            super(status + ": " + body);
            this.status = status;
            this.body = body;
        }

        public int getStatus() {
            return status;
        }

        public String getBody() {
            return body;
        }
    }

    private final String apiKey;
    private final String baseUrl;
    private final HttpClient http = HttpClient.newHttpClient();

    /** Uses the MAVIAPI_API_KEY environment variable, then the shared demo key. */
    public GetyourguideClient() {
        this(null, null);
    }

    public GetyourguideClient(String apiKey) {
        this(apiKey, null);
    }

    public GetyourguideClient(String apiKey, String baseUrl) {
        this.apiKey = first(apiKey, System.getenv("MAVIAPI_API_KEY"), DEMO_KEY);
        String root = first(baseUrl, System.getenv("MAVIAPI_BASE_URL"), "https://api.maviapi.com");
        while (root.endsWith("/")) {
            root = root.substring(0, root.length() - 1);
        }
        this.baseUrl = root + "/v1/sites/getyourguide";
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
     *   location (string, required): GetYourGuide place slug in the {city}-l{id} form
     *     (from /catalog or an activity URL)
     *   limit (integer): Max activities per page (default 50, max 1000). Every page of
     *     the location is fetched once and cached, so any limit/offset is served from the
     *     same full list
     *   offset (integer): Activities to skip. Works up to pagination.total (the site's
     *     full count), not just the first page
     */
    public String activitiesV2ByLocation(Map<String, Object> params) {
        return get("/activities-v2/{location}", params, "location");
    }

    /**
     * Tour & activity listings for a GetYourGuide location slug (e.g. venice-l35), each
     * with price, rating, next availability date and destination.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   location (string, required): GetYourGuide place slug in the {city}-l{id} form
     *     (from /catalog or an activity URL)
     *   limit (integer): Max items per page (default 50, max 200)
     *   offset (integer): Items to skip for pagination
     */
    public String activitiesByLocation(Map<String, Object> params) {
        return get("/activities/{location}", params, "location");
    }

    /**
     * Full detail for one activity by numeric id (e.g. 6851): title, description, images,
     * price, rating, review count and sample reviews.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   id (string, required): Numeric activity id (the …-t<id> in an activity URL)
     */
    public String activityById(Map<String, Object> params) {
        return get("/activity/{id}", params, "id");
    }

    /**
     * Enumerate all activity URLs from a GetYourGuide activity sitemap file (?index, ~5000
     * each); each entry has the activity id and location slug.
     *
     * Each successful request uses 1 credit for every 5000 rows it returns (at least 1
     * credit).
     *
     * Parameters:
     *   index (integer): Which activity sitemap file to read (0-based)
     *   limit (integer): Max items per page (default 100, max 5000)
     *   offset (integer): Items to skip for pagination
     */
    public String catalog(Map<String, Object> params) {
        return get("/catalog", params);
    }

    /**
     * Resolve a location's tour/activity listings and optionally enrich the top N with
     * full detail (description, images, reviews) in one call.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   location (string, required): GetYourGuide place slug, e.g. venice-l35
     *   detail (string): When true, enrich the top `enrich` listings with detail
     *     (description, images, reviews). One of: true, false
     *   enrich (integer): How many top listings to enrich when detail=true (1-5). One
     *     of: 1, 2, 3, 4, 5
     *   limit (integer): Max items per page (default 50, max 200)
     *   offset (integer): Items to skip for pagination
     */
    public String explore(Map<String, Object> params) {
        return get("/explore", params, "location");
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
     *   location (string, required): GetYourGuide place slug, e.g. venice-l35
     *   detail (string): When true, enrich the top `enrich` activities with detail
     *     (description, images, reviews). One of: true, false
     *   enrich (integer): How many top activities to enrich when detail=true (1-5). One
     *     of: 1, 2, 3, 4, 5
     *   limit (integer): Max activities per page (default 50, max 1000). Every page of
     *     the location is fetched once and cached, so any limit/offset is served from the
     *     same full list
     *   offset (integer): Activities to skip. Works up to pagination.total (the site's
     *     full count), not just the first page
     */
    public String exploreV2(Map<String, Object> params) {
        return get("/explore-v2", params, "location");
    }

    /**
     * Find GetYourGuide places (cities, regions, countries, attractions) by name: id,
     * name, type, descriptor (e.g. 'City in Italy') and the place slug (e.g. venice-l35)
     * that /activities, /activities-v2, /explore and /search take.
     *
     * Each successful request uses 10 credits.
     *
     * Parameters:
     *   q (string, required): Name of a city, region, country or attraction (any case,
     *     accents optional)
     *   limit (integer): Max places to return (the site suggests up to 20)
     *   offset (integer)
     */
    public String locations(Map<String, Object> params) {
        return get("/locations", params, "q");
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
     *   q (string): Free text, as typed in the site's search box (an activity,
     *     attraction or place). q, location or both are required
     *   location (string): Limit to one place: a place slug from /locations (venice-l35)
     *     or its numeric id (35)
     *   date_from (string): Only activities available on or after this date
     *     (YYYY-MM-DD). Alone, it searches that one day
     *   date_to (string): Last day of the date range (YYYY-MM-DD); needs date_from
     *   min_price (number): Lowest starting price, in EUR
     *   max_price (number): Highest starting price, in EUR
     *   sort (string): Order of the results. With q, the text match is weighed in too.
     *     One of: popularity, price_asc, price_desc, rating_desc
     *   languages (string): Guide/audio languages, comma separated ISO codes (en, de,
     *     fr, es, it, ...): activities offered in any of them
     *   duration (string): Durations, comma separated: 0-3h, 3-5h, 5-7h, full-day,
     *     2-days, 3-days, 4-days, 5-days-plus
     *   min_rating (string): Minimum average rating. One of: 3.0, 3.5, 4.0, 4.5
     *   start_time (string): Start times, comma separated: morning (before 12 PM),
     *     afternoon (12-5 PM), evening (after 5 PM)
     *   features (string): Features, comma separated: private, small-group,
     *     skip-the-line, wheelchair-accessible, hotel-pickup, originals
     *   categories (string): Category ids, comma separated: the tc<n> in a category page
     *     address (gondola-tours-tc264 -> tc-264)
     *   departs_from (string): Departure places, comma separated slugs or ids from
     *     /locations
     *   page (integer): Page of the site's results, 24 per page (1 to 34; the site
     *     serves no pages past about 34). data.total is the full count; narrow the query
     *     with filters to reach more rows
     *   limit (integer): Rows of this page to return (default 50: the whole 24-row page)
     *   offset (integer): Rows of this page to skip
     */
    public String search(Map<String, Object> params) {
        return get("/search", params);
    }

    private static String first(String... values) {
        for (String value : values) {
            if (value != null && !value.isEmpty()) {
                return value;
            }
        }
        return "";
    }

    private String get(String path, Map<String, Object> params, String... required) {
        for (String name : required) {
            if (params.get(name) == null) {
                throw new IllegalArgumentException("Missing required parameter: " + name);
            }
        }
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            String token = "{" + entry.getKey() + "}";
            String text = URLEncoder.encode(String.valueOf(entry.getValue()), StandardCharsets.UTF_8);
            if (path.contains(token)) {
                path = path.replace(token, text.replace("+", "%20"));
            } else {
                query.append(query.length() == 0 ? "?" : "&")
                    .append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                    .append("=")
                    .append(text);
            }
        }
        HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl + path + query))
            .timeout(Duration.ofSeconds(120))
            .header("Authorization", "Bearer " + apiKey)
            .header("Accept", "application/json")
            .header("User-Agent", "getyourguide-unofficial-sdk/0.1.0 (java)")
            .GET()
            .build();
        try {
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiError(response.statusCode(), response.body());
            }
            return response.body();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }
}
